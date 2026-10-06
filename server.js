const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.join(__dirname, 'public');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'beast-tamer.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    profile TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS guilds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    tag TEXT NOT NULL UNIQUE,
    creator_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS guild_members (
    guild_id INTEGER NOT NULL,
    player_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at INTEGER NOT NULL,
    PRIMARY KEY (guild_id, player_id),
    FOREIGN KEY(guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
    FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'gold'
  );
`);

const seedShop = db.prepare(`INSERT OR IGNORE INTO shop_items (id,name,description,price,currency) VALUES (?,?,?,?,?)`);
[
  ['orb', 'Tame Orb', 'Used to tame wild beasts.', 25, 'gold'],
  ['potion', 'Potion', 'Restores the Hunter and team.', 35, 'gold'],
  ['orb_pack_5', 'Orb Pack ×5', 'Five Tame Orbs.', 110, 'gold'],
  ['potion_pack_5', 'Potion Pack ×5', 'Five Potions.', 150, 'gold']
].forEach(x => seedShop.run(...x));

const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ['websocket', 'polling'] });

app.use(express.json({ limit: '1mb' }));
app.use(express.static(ROOT));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    game: 'Beast Tamer: Wild Realm',
    online: onlinePlayers.size,
    features: ['multiplayer', 'guilds', 'trading', 'shop']
  });
});

app.get('/api/shop', (req, res) => {
  res.json(db.prepare('SELECT * FROM shop_items ORDER BY price ASC').all());
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

const onlinePlayers = new Map();
const trades = new Map();
const rate = new Map();

function cleanName(value) {
  return String(value || 'Hunter').replace(/[^a-zA-Z0-9 _-]/g, '').trim().slice(0, 20) || 'Hunter';
}
function cleanTag(value) {
  return String(value || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5);
}
function clampInt(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}
function now() { return Date.now(); }
function safeProfile(input) {
  const p = input && typeof input === 'object' ? input : {};
  const player = p.player && typeof p.player === 'object' ? p.player : {};
  return {
    ...p,
    player: {
      ...player,
      name: cleanName(player.name),
      level: clampInt(player.level, 1, 999),
      xp: clampInt(player.xp, 0, 99999999),
      gold: clampInt(player.gold, 0, 999999999),
      hp: clampInt(player.hp, 0, 999999),
      maxHp: clampInt(player.maxHp, 1, 999999),
      rank: String(player.rank || 'E').slice(0, 2),
      guildId: player.guildId ? clampInt(player.guildId, 1, 999999999) : null
    },
    potions: clampInt(p.potions, 0, 999999),
    orbs: clampInt(p.orbs, 0, 999999),
    team: Array.isArray(p.team) ? p.team.slice(0, 5) : [],
    storage: Array.isArray(p.storage) ? p.storage.slice(0, 100) : [],
    shadows: Array.isArray(p.shadows) ? p.shadows.slice(0, 100) : [],
    defeated: clampInt(p.defeated, 0, 99999999),
    worldLevel: clampInt(p.worldLevel, 1, 5),
    bossDefeated: Boolean(p.bossDefeated)
  };
}
function rowForPlayer(id) {
  return db.prepare('SELECT id,name,profile,updated_at FROM players WHERE id=?').get(id);
}
function getProfile(id) {
  const row = rowForPlayer(id);
  if (!row) return null;
  try { return safeProfile(JSON.parse(row.profile)); } catch { return null; }
}
function saveProfile(id, profile) {
  const clean = safeProfile(profile);
  const name = clean.player.name;
  db.prepare(`INSERT INTO players(id,name,profile,updated_at) VALUES(?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, profile=excluded.profile, updated_at=excluded.updated_at`)
    .run(id, name, JSON.stringify(clean), now());
  return clean;
}
function publicPlayer(id) {
  const entry = onlinePlayers.get(id);
  if (!entry) return null;
  return {
    id,
    name: entry.name,
    rank: entry.rank,
    level: entry.level,
    guildId: entry.guildId || null,
    x: entry.x || 0,
    z: entry.z || 0,
    rot: entry.rot || 0
  };
}
function onlineList() {
  return [...onlinePlayers.keys()].map(publicPlayer).filter(Boolean);
}
function emitOnline() { io.emit('online:list', onlineList()); }

function guildForPlayer(playerId) {
  return db.prepare(`
    SELECT g.id,g.name,g.tag,g.level,g.xp,gm.role
    FROM guild_members gm JOIN guilds g ON g.id=gm.guild_id
    WHERE gm.player_id=?
  `).get(playerId) || null;
}
function guildMembers(guildId) {
  return db.prepare(`
    SELECT p.id,p.name,gm.role,gm.joined_at
    FROM guild_members gm JOIN players p ON p.id=gm.player_id
    WHERE gm.guild_id=? ORDER BY CASE gm.role WHEN 'leader' THEN 0 WHEN 'officer' THEN 1 ELSE 2 END, gm.joined_at ASC
  `).all(guildId).map(m => ({ ...m, online: onlinePlayers.has(m.id) }));
}
function joinGuildRoom(socket, guildId) {
  if (guildId) socket.join('guild:' + guildId);
}
function leaveGuildRooms(socket) {
  for (const room of socket.rooms) if (room.startsWith('guild:')) socket.leave(room);
}
function syncGuild(socket) {
  const id = socket.data.playerId;
  const profile = getProfile(id) || { player: {} };
  const guild = guildForPlayer(id);
  if (guild) {
    profile.player.guildId = guild.id;
    saveProfile(id, profile);
    leaveGuildRooms(socket);
    joinGuildRoom(socket, guild.id);
  } else {
    if (profile.player) profile.player.guildId = null;
    saveProfile(id, profile);
    leaveGuildRooms(socket);
  }
  socket.emit('guild:state', { guild, members: guild ? guildMembers(guild.id) : [] });
  emitOnline();
}

function normalizeOffer(offer) {
  const o = offer && typeof offer === 'object' ? offer : {};
  return {
    gold: clampInt(o.gold, 0, 999999999),
    orbs: clampInt(o.orbs, 0, 999999),
    potions: clampInt(o.potions, 0, 999999),
    beastUid: o.beastUid ? String(o.beastUid).slice(0, 100) : null
  };
}
function sideForTrade(trade, socket) {
  if (trade.a.socketId === socket.id) return 'a';
  if (trade.b.socketId === socket.id) return 'b';
  return null;
}
function getStorageBeast(profile, uid) {
  if (!uid || !Array.isArray(profile.storage)) return null;
  return profile.storage.find(b => b && String(b.uid) === String(uid)) || null;
}
function validateOffer(profile, offer) {
  if (offer.gold > clampInt(profile.player.gold)) return 'Not enough gold.';
  if (offer.orbs > clampInt(profile.orbs)) return 'Not enough orbs.';
  if (offer.potions > clampInt(profile.potions)) return 'Not enough potions.';
  if (offer.beastUid && !getStorageBeast(profile, offer.beastUid)) return 'That beast is no longer in storage.';
  return null;
}
function applyTrade(profileA, offerA, profileB, offerB) {
  profileA.player.gold = clampInt(profileA.player.gold) - offerA.gold + offerB.gold;
  profileB.player.gold = clampInt(profileB.player.gold) - offerB.gold + offerA.gold;
  profileA.orbs = clampInt(profileA.orbs) - offerA.orbs + offerB.orbs;
  profileB.orbs = clampInt(profileB.orbs) - offerB.orbs + offerA.orbs;
  profileA.potions = clampInt(profileA.potions) - offerA.potions + offerB.potions;
  profileB.potions = clampInt(profileB.potions) - offerB.potions + offerA.potions;

  if (offerA.beastUid) {
    const idx = profileA.storage.findIndex(b => b && String(b.uid) === String(offerA.beastUid));
    if (idx < 0) throw new Error('Trader A beast missing');
    const beast = profileA.storage.splice(idx, 1)[0];
    profileB.storage = Array.isArray(profileB.storage) ? profileB.storage : [];
    profileB.storage.push(beast);
  }
  if (offerB.beastUid) {
    const idx = profileB.storage.findIndex(b => b && String(b.uid) === String(offerB.beastUid));
    if (idx < 0) throw new Error('Trader B beast missing');
    const beast = profileB.storage.splice(idx, 1)[0];
    profileA.storage = Array.isArray(profileA.storage) ? profileA.storage : [];
    profileA.storage.push(beast);
  }
}

io.on('connection', socket => {
  socket.on('player:hello', payload => {
    try {
      const id = String(payload?.id || '').slice(0, 100);
      if (!id) return socket.emit('server:error', 'Missing player ID.');

      const existing = onlinePlayers.get(id);
      if (existing && existing.socketId !== socket.id) {
        io.to(existing.socketId).emit('session:replaced');
        io.sockets.sockets.get(existing.socketId)?.disconnect(true);
      }

      const incoming = safeProfile(payload?.profile || {});
      let profile = getProfile(id);
      let isNew = false;
      if (!profile) {
        profile = safeProfile(incoming);
        if (!profile.player.name || profile.player.name === 'Hunter') profile.player.name = cleanName(payload?.name || 'Hunter');
        saveProfile(id, profile);
        isNew = true;
      }

      socket.data.playerId = id;
      const guild = guildForPlayer(id);
      profile.player.guildId = guild ? guild.id : null;
      saveProfile(id, profile);

      const entry = {
        socketId: socket.id,
        name: cleanName(profile.player.name),
        rank: String(profile.player.rank || 'E'),
        level: clampInt(profile.player.level, 1, 999),
        guildId: profile.player.guildId || null,
        x: 0,
        z: 0,
        rot: 0,
        lastMove: 0
      };
      onlinePlayers.set(id, entry);
      joinGuildRoom(socket, entry.guildId);

      socket.emit('profile:load', { profile, isNew });
      socket.emit('shop:list', db.prepare('SELECT * FROM shop_items ORDER BY price ASC').all());
      socket.emit('online:list', onlineList());
      socket.emit('guild:state', { guild, members: guild ? guildMembers(guild.id) : [] });
      emitOnline();
    } catch (err) {
      socket.emit('server:error', 'Could not join the realm.');
      console.error(err);
    }
  });

  socket.on('profile:save', incoming => {
    const id = socket.data.playerId;
    if (!id) return;
    const saved = saveProfile(id, incoming);
    const e = onlinePlayers.get(id);
    if (e) {
      e.name = saved.player.name;
      e.rank = saved.player.rank;
      e.level = saved.player.level;
      e.guildId = saved.player.guildId;
    }
    socket.emit('profile:saved', { at: now() });
    emitOnline();
  });

  socket.on('player:move', pos => {
    const id = socket.data.playerId;
    const e = onlinePlayers.get(id);
    if (!id || !e) return;
    const t = now();
    if (t - e.lastMove < 70) return;
    e.lastMove = t;
    e.x = Math.max(-70, Math.min(70, Number(pos?.x) || 0));
    e.z = Math.max(-70, Math.min(70, Number(pos?.z) || 0));
    e.rot = Number(pos?.rot) || 0;
    socket.broadcast.emit('player:move', { ...publicPlayer(id) });
  });

  socket.on('guild:list', () => {
    socket.emit('guild:list', db.prepare(`SELECT g.id,g.name,g.tag,g.level,g.xp,COUNT(gm.player_id) members FROM guilds g LEFT JOIN guild_members gm ON g.id=gm.guild_id GROUP BY g.id ORDER BY g.level DESC,g.xp DESC,g.name ASC LIMIT 50`).all());
  });

  socket.on('guild:create', data => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const current = guildForPlayer(playerId);
    if (current) return socket.emit('server:error', 'You are already in a guild.');
    const name = String(data?.name || '').trim().slice(0, 24);
    const tag = cleanTag(data?.tag);
    if (name.length < 3 || tag.length < 2) return socket.emit('server:error', 'Guild name must be 3–24 chars and tag 2–5 letters/numbers.');
    try {
      const create = db.transaction(() => {
        const r = db.prepare('INSERT INTO guilds(name,tag,creator_id,created_at) VALUES(?,?,?,?)').run(name,tag,playerId,now());
        db.prepare('INSERT INTO guild_members(guild_id,player_id,role,joined_at) VALUES(?,?,?,?)').run(r.lastInsertRowid,playerId,'leader',now());
        return Number(r.lastInsertRowid);
      });
      const guildId = create();
      const profile = getProfile(playerId);
      profile.player.guildId = guildId;
      saveProfile(playerId, profile);
      syncGuild(socket);
      socket.emit('toast', `Guild [${tag}] created!`);
    } catch (err) {
      const msg = String(err.message || '').includes('UNIQUE') ? 'Guild name or tag already exists.' : 'Guild could not be created.';
      socket.emit('server:error', msg);
    }
  });

  socket.on('guild:join', guildId => {
    const playerId = socket.data.playerId;
    const id = clampInt(guildId,1,999999999);
    if (!playerId || !id) return;
    if (guildForPlayer(playerId)) return socket.emit('server:error', 'Leave your current guild first.');
    const guild = db.prepare('SELECT * FROM guilds WHERE id=?').get(id);
    if (!guild) return socket.emit('server:error', 'Guild not found.');
    const count = db.prepare('SELECT COUNT(*) c FROM guild_members WHERE guild_id=?').get(id).c;
    if (count >= 50) return socket.emit('server:error', 'That guild is full.');
    db.prepare('INSERT INTO guild_members(guild_id,player_id,role,joined_at) VALUES(?,?,?,?)').run(id,playerId,'member',now());
    const profile = getProfile(playerId);
    profile.player.guildId = id;
    saveProfile(playerId, profile);
    syncGuild(socket);
    io.to('guild:' + id).emit('guild:system', `${cleanName(profile.player.name)} joined the guild.`);
  });

  socket.on('guild:leave', () => {
    const playerId = socket.data.playerId;
    const guild = guildForPlayer(playerId);
    if (!guild) return socket.emit('server:error', 'You are not in a guild.');
    const members = guildMembers(guild.id);
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM guild_members WHERE guild_id=? AND player_id=?').run(guild.id,playerId);
      if (guild.role === 'leader' && members.length > 1) {
        const successor = members.find(m => m.id !== playerId);
        db.prepare('UPDATE guild_members SET role=? WHERE guild_id=? AND player_id=?').run('leader',guild.id,successor.id);
      } else if (members.length === 1) {
        db.prepare('DELETE FROM guilds WHERE id=?').run(guild.id);
      }
    });
    tx();
    const profile = getProfile(playerId);
    profile.player.guildId = null;
    saveProfile(playerId, profile);
    syncGuild(socket);
    io.to('guild:' + guild.id).emit('guild:system', `${cleanName(profile.player.name)} left the guild.`);
  });

  socket.on('guild:members', () => {
    const guild = guildForPlayer(socket.data.playerId);
    socket.emit('guild:members', guild ? guildMembers(guild.id) : []);
  });

  socket.on('guild:chat', message => {
    const playerId = socket.data.playerId;
    const guild = guildForPlayer(playerId);
    if (!guild) return;
    const clean = String(message || '').trim().slice(0, 180);
    if (!clean) return;
    const profile = getProfile(playerId);
    io.to('guild:' + guild.id).emit('guild:chat', { name: profile.player.name, message: clean, at: now() });
  });

  socket.on('shop:list', () => socket.emit('shop:list', db.prepare('SELECT * FROM shop_items ORDER BY price ASC').all()));

  socket.on('shop:buy', ({ itemId, qty = 1 } = {}) => {
    const playerId = socket.data.playerId;
    if (!playerId) return;
    const item = db.prepare('SELECT * FROM shop_items WHERE id=?').get(String(itemId || ''));
    const amount = clampInt(qty, 1, 20);
    if (!item) return socket.emit('server:error', 'Shop item not found.');
    const profile = getProfile(playerId);
    const total = item.price * amount;
    if (profile.player.gold < total) return socket.emit('server:error', 'Not enough gold.');

    profile.player.gold -= total;
    if (item.id === 'orb') profile.orbs += amount;
    if (item.id === 'potion') profile.potions += amount;
    if (item.id === 'orb_pack_5') profile.orbs += 5 * amount;
    if (item.id === 'potion_pack_5') profile.potions += 5 * amount;
    saveProfile(playerId, profile);
    socket.emit('profile:load', { profile, isNew: false });
    socket.emit('toast', `Bought ${amount} × ${item.name}.`);
  });

  socket.on('trade:request', targetId => {
    const fromId = socket.data.playerId;
    const target = onlinePlayers.get(String(targetId));
    if (!fromId || !target || fromId === String(targetId)) return socket.emit('server:error', 'That player is not available.');
    const tradeId = `t_${now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    trades.set(tradeId, {
      id: tradeId,
      status: 'pending',
      a: { playerId: fromId, socketId: socket.id, offer: normalizeOffer({}) },
      b: { playerId: String(targetId), socketId: target.socketId, offer: normalizeOffer({}) },
      confirmed: { a: false, b: false }
    });
    io.to(target.socketId).emit('trade:incoming', { tradeId, from: publicPlayer(fromId) });
    socket.emit('toast', `Trade request sent to ${target.name}.`);
  });

  socket.on('trade:accept', tradeId => {
    const trade = trades.get(String(tradeId));
    if (!trade || trade.status !== 'pending') return;
    if (trade.b.socketId !== socket.id) return;
    trade.status = 'active';
    socket.emit('trade:started', tradeView(trade));
    io.to(trade.a.socketId).emit('trade:started', tradeView(trade));
  });

  socket.on('trade:reject', tradeId => {
    const trade = trades.get(String(tradeId));
    if (!trade) return;
    if (![trade.a.socketId, trade.b.socketId].includes(socket.id)) return;
    io.to(trade.a.socketId).emit('trade:closed', 'Trade declined.');
    io.to(trade.b.socketId).emit('trade:closed', 'Trade declined.');
    trades.delete(String(tradeId));
  });

  socket.on('trade:update', offer => {
    const trade = trades.get(String(offer?.tradeId));
    if (!trade || trade.status !== 'active') return;
    const side = sideForTrade(trade, socket);
    if (!side) return;
    trade[side].offer = normalizeOffer(offer?.offer);
    trade.confirmed.a = false;
    trade.confirmed.b = false;
    io.to(trade.a.socketId).emit('trade:state', tradeView(trade));
    io.to(trade.b.socketId).emit('trade:state', tradeView(trade));
  });

  socket.on('trade:confirm', tradeId => {
    const trade = trades.get(String(tradeId));
    if (!trade || trade.status !== 'active') return;
    const side = sideForTrade(trade, socket);
    if (!side) return;
    trade.confirmed[side] = true;
    io.to(trade.a.socketId).emit('trade:state', tradeView(trade));
    io.to(trade.b.socketId).emit('trade:state', tradeView(trade));
    if (!trade.confirmed.a || !trade.confirmed.b) return;

    try {
      const pA = getProfile(trade.a.playerId);
      const pB = getProfile(trade.b.playerId);
      if (!pA || !pB) throw new Error('Player profile missing.');
      const errA = validateOffer(pA, trade.a.offer);
      const errB = validateOffer(pB, trade.b.offer);
      if (errA || errB) throw new Error(errA || errB);
      if (trade.a.offer.beastUid && trade.a.offer.beastUid === trade.b.offer.beastUid) throw new Error('Invalid beast trade.');

      const tx = db.transaction(() => {
        applyTrade(pA, trade.a.offer, pB, trade.b.offer);
        saveProfile(trade.a.playerId, pA);
        saveProfile(trade.b.playerId, pB);
      });
      tx();

      trade.status = 'complete';
      io.to(trade.a.socketId).emit('trade:complete', pA);
      io.to(trade.b.socketId).emit('trade:complete', pB);
      io.to(trade.a.socketId).emit('toast', 'Trade completed!');
      io.to(trade.b.socketId).emit('toast', 'Trade completed!');
      trades.delete(trade.id);
    } catch (err) {
      trade.confirmed.a = trade.confirmed.b = false;
      io.to(trade.a.socketId).emit('trade:error', String(err.message || 'Trade failed.'));
      io.to(trade.b.socketId).emit('trade:error', String(err.message || 'Trade failed.'));
      io.to(trade.a.socketId).emit('trade:state', tradeView(trade));
      io.to(trade.b.socketId).emit('trade:state', tradeView(trade));
    }
  });

  socket.on('trade:cancel', tradeId => {
    const trade = trades.get(String(tradeId));
    if (!trade) return;
    if (![trade.a.socketId, trade.b.socketId].includes(socket.id)) return;
    io.to(trade.a.socketId).emit('trade:closed', 'Trade cancelled.');
    io.to(trade.b.socketId).emit('trade:closed', 'Trade cancelled.');
    trades.delete(String(tradeId));
  });

  socket.on('disconnect', () => {
    const id = socket.data.playerId;
    if (!id) return;
    const current = onlinePlayers.get(id);
    if (current?.socketId === socket.id) onlinePlayers.delete(id);
    for (const [tradeId, trade] of trades.entries()) {
      if (trade.a.socketId === socket.id || trade.b.socketId === socket.id) {
        const other = trade.a.socketId === socket.id ? trade.b.socketId : trade.a.socketId;
        io.to(other).emit('trade:closed', 'Player disconnected.');
        trades.delete(tradeId);
      }
    }
    emitOnline();
  });
});

function tradeView(trade) {
  return {
    tradeId: trade.id,
    status: trade.status,
    a: { playerId: trade.a.playerId, name: onlinePlayers.get(trade.a.playerId)?.name || trade.a.playerId, offer: trade.a.offer },
    b: { playerId: trade.b.playerId, name: onlinePlayers.get(trade.b.playerId)?.name || trade.b.playerId, offer: trade.b.offer },
    confirmed: trade.confirmed
  };
}

server.listen(PORT, '0.0.0.0', () => console.log(`Beast Tamer Online running on port ${PORT}`));
