const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'realm-data.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ['websocket', 'polling'] });
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public'), { etag: true, maxAge: '1h' }));

function emptyStore() { return { players: {}, guilds: {}, nextGuildId: 1 }; }
function loadStore() {
  try { return { ...emptyStore(), ...JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }; }
  catch { return emptyStore(); }
}
let store = loadStore();
let saveTimer = null;
function saveStore() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const temp = DATA_FILE + '.tmp';
      fs.writeFileSync(temp, JSON.stringify(store));
      fs.renameSync(temp, DATA_FILE);
    } catch (e) { console.error('Data save failed:', e.message); }
  }, 80);
}

const SHOP = [
  { id: 'orb', name: 'Tame Orb', desc: 'A capture orb for weakened wild beasts.', price: 25, icon: '🔮', kind: 'orbs', amount: 1 },
  { id: 'potion', name: 'Potion', desc: 'Restores the player and team.', price: 35, icon: '🧪', kind: 'potions', amount: 1 },
  { id: 'orb_pack', name: 'Orb Pack ×5', desc: 'Five capture orbs.', price: 110, icon: '🔮', kind: 'orbs', amount: 5 },
  { id: 'potion_pack', name: 'Potion Pack ×5', desc: 'Five potions.', price: 150, icon: '🧪', kind: 'potions', amount: 5 },
  { id: 'camp_token', name: 'Camp Token', desc: 'A small exploration keepsake.', price: 60, icon: '🏕️', kind: 'items', amount: 1 }
];
const online = new Map();
const trades = new Map();
const activeTradeByPlayer = new Map();
const socketsByPlayer = new Map();

function cleanText(v, max = 40) { return String(v ?? '').replace(/[<>]/g, '').trim().slice(0, max); }
function clampInt(v, min = 0, max = 1e9) { const n = Number(v); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : min; }
function safeId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80); }
function safeBeastList(v, max = 100) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, max).filter(b => b && typeof b === 'object' && /^[a-zA-Z0-9_-]{1,60}$/.test(String(b.id || '')))
    .map(b => ({ ...b, uid: cleanText(b.uid || ('b_' + Math.random().toString(36).slice(2)), 100), level: clampInt(b.level, 1, 999), name: cleanText(b.name || b.id, 60) }));
}
function safeProfile(input) {
  const p = input && typeof input === 'object' ? input : {};
  const pl = p.player && typeof p.player === 'object' ? p.player : {};
  return {
    ...p,
    player: {
      ...pl,
      name: cleanText(pl.name || 'Hunter', 20) || 'Hunter',
      level: clampInt(pl.level, 1, 999), xp: clampInt(pl.xp, 0, 99999999),
      rank: cleanText(pl.rank || 'E', 2), gold: clampInt(pl.gold, 0, 999999999),
      hp: clampInt(pl.hp, 0, 999999), maxHp: clampInt(pl.maxHp || 120, 1, 999999),
      classId: cleanText(pl.classId || '', 32), classStage: clampInt(pl.classStage, 0, 3),
      guildId: pl.guildId ? clampInt(pl.guildId, 1, 999999999) : null
    },
    potions: clampInt(p.potions, 0, 999999), orbs: clampInt(p.orbs, 0, 999999),
    team: safeBeastList(p.team, 4), storage: safeBeastList(p.storage, 150),
    shadowArmy: safeBeastList(p.shadowArmy, 100), activeShadows: Array.isArray(p.activeShadows) ? p.activeShadows.slice(0, 10).map(x => cleanText(x, 100)) : [],
    shadows: Array.isArray(p.shadows) ? p.shadows.slice(0, 100).map(x => cleanText(x, 60)) : [],
    defeated: clampInt(p.defeated, 0, 99999999), worldLevel: clampInt(p.worldLevel, 1, 5),
    bossDefeated: !!p.bossDefeated, items: p.items && typeof p.items === 'object' ? p.items : {}
  };
}
function ensureProfile(id, incoming) {
  if (!store.players[id]) {
    store.players[id] = { profile: safeProfile(incoming), createdAt: Date.now(), updatedAt: Date.now() };
    saveStore();
  }
  store.players[id].profile = safeProfile(store.players[id].profile);
  return store.players[id].profile;
}
function saveProfile(id, profile) {
  const p = safeProfile(profile);
  if (!store.players[id]) store.players[id] = { createdAt: Date.now() };
  store.players[id].profile = p; store.players[id].updatedAt = Date.now();
  saveStore(); return p;
}
function guildMembership(playerId) {
  for (const g of Object.values(store.guilds)) {
    const m = g.members?.[playerId];
    if (m) return { id: g.id, name: g.name, tag: g.tag, level: g.level || 1, xp: g.xp || 0, role: m.role };
  }
  return null;
}
function guildMemberList(guildId) {
  const g = store.guilds[guildId]; if (!g) return [];
  return Object.entries(g.members).map(([id, m]) => ({ id, name: online.get(id)?.name || store.players[id]?.profile?.player?.name || 'Tamer', role: m.role, online: online.has(id) }));
}
function publicPlayer(id) {
  const p = online.get(id); if (!p) return null;
  return { id, name: p.name, level: p.level, rank: p.rank, classId: p.classId, x: p.x, y: p.y, facing: p.facing, guildId: p.guildId };
}
function broadcastOnline() { io.emit('online:list', [...online.keys()].map(publicPlayer).filter(Boolean)); }
function sendGuildState(socket) {
  const id = socket.data.playerId; const guild = guildMembership(id);
  if (guild) {
    socket.join('guild:' + guild.id);
    const prof = store.players[id]?.profile;
    if (prof) { prof.player.guildId = guild.id; saveProfile(id, prof); }
  }
  socket.emit('guild:state', { guild, members: guild ? guildMemberList(guild.id) : [] });
}
function tradeView(t) {
  const a = online.get(t.a.id); const b = online.get(t.b.id);
  return { tradeId: t.id, status: t.status,
    a: { id: t.a.id, name: a?.name || t.a.id, offer: t.a.offer },
    b: { id: t.b.id, name: b?.name || t.b.id, offer: t.b.offer }, confirmed: t.confirmed };
}
function normalizeOffer(o) {
  return { gold: clampInt(o?.gold, 0, 999999999), orbs: clampInt(o?.orbs, 0, 999999), potions: clampInt(o?.potions, 0, 999999), beastUid: cleanText(o?.beastUid || '', 100) || null };
}
function sideFor(t, socket) { if (t.a.socketId === socket.id) return 'a'; if (t.b.socketId === socket.id) return 'b'; return null; }
function clearTrade(t, message) {
  io.to(t.a.socketId).emit('trade:closed', message); io.to(t.b.socketId).emit('trade:closed', message);
  activeTradeByPlayer.delete(t.a.id); activeTradeByPlayer.delete(t.b.id); trades.delete(t.id);
}
function findStorageBeast(profile, uid) { return profile.storage.findIndex(b => String(b.uid) === String(uid)); }
function validateOffer(profile, offer) {
  if (offer.gold > profile.player.gold) return 'Not enough gold for that offer.';
  if (offer.orbs > profile.orbs) return 'Not enough orbs for that offer.';
  if (offer.potions > profile.potions) return 'Not enough potions for that offer.';
  if (offer.beastUid && findStorageBeast(profile, offer.beastUid) < 0) return 'Trade beasts must be in Storage.';
  return null;
}
function finishTrade(t) {
  const pa = store.players[t.a.id]?.profile, pb = store.players[t.b.id]?.profile;
  if (!pa || !pb) throw new Error('A player profile is unavailable.');
  const oa = t.a.offer, ob = t.b.offer;
  const error = validateOffer(pa, oa) || validateOffer(pb, ob);
  if (error) throw new Error(error);
  if (oa.beastUid && ob.beastUid && oa.beastUid === ob.beastUid) throw new Error('Invalid beast selection.');
  const a = structuredClone(pa), b = structuredClone(pb);
  a.player.gold = a.player.gold - oa.gold + ob.gold;
  b.player.gold = b.player.gold - ob.gold + oa.gold;
  a.orbs = a.orbs - oa.orbs + ob.orbs; b.orbs = b.orbs - ob.orbs + oa.orbs;
  a.potions = a.potions - oa.potions + ob.potions; b.potions = b.potions - ob.potions + oa.potions;
  if (oa.beastUid) { const i = findStorageBeast(a, oa.beastUid); if (i < 0) throw new Error('Your offered beast is no longer in storage.'); b.storage.push(a.storage.splice(i, 1)[0]); }
  if (ob.beastUid) { const i = findStorageBeast(b, ob.beastUid); if (i < 0) throw new Error('Their offered beast is no longer in storage.'); a.storage.push(b.storage.splice(i, 1)[0]); }
  store.players[t.a.id].profile = safeProfile(a); store.players[t.b.id].profile = safeProfile(b);
  store.players[t.a.id].updatedAt = store.players[t.b.id].updatedAt = Date.now(); saveStore();
  io.to(t.a.socketId).emit('trade:complete', store.players[t.a.id].profile);
  io.to(t.b.socketId).emit('trade:complete', store.players[t.b.id].profile);
  io.to(t.a.socketId).emit('toast', 'Trade completed!'); io.to(t.b.socketId).emit('toast', 'Trade completed!');
  activeTradeByPlayer.delete(t.a.id); activeTradeByPlayer.delete(t.b.id); trades.delete(t.id);
}

app.get('/api/health', (req, res) => res.json({ ok: true, game: 'Beast Tamer: Wild Realm', online: online.size, features: ['2d-world', 'multiplayer', 'classes', 'beastiary', 'guilds', 'trading', 'shop'] }));
app.get('/api/shop', (req, res) => res.json(SHOP));
app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

io.on('connection', socket => {
  socket.on('player:hello', data => {
    const id = safeId(data?.id); if (!id) return socket.emit('server:error', 'Player ID is missing.');
    const oldSocket = socketsByPlayer.get(id);
    if (oldSocket && oldSocket !== socket.id) io.sockets.sockets.get(oldSocket)?.disconnect(true);
    const profile = ensureProfile(id, data?.profile || {});
    socket.data.playerId = id; socketsByPlayer.set(id, socket.id);
    const g = guildMembership(id);
    if (profile.player.guildId !== (g?.id || null)) { profile.player.guildId = g?.id || null; saveProfile(id, profile); }
    online.set(id, { socketId: socket.id, name: profile.player.name, level: profile.player.level, rank: profile.player.rank, classId: profile.player.classId, x: 0, y: 0, facing: 'down', guildId: g?.id || null, lastMove: 0 });
    socket.emit('profile:load', { profile: store.players[id].profile, isNew: true });
    socket.emit('shop:list', SHOP); sendGuildState(socket); socket.emit('online:list', [...online.keys()].map(publicPlayer).filter(Boolean)); broadcastOnline();
  });

  socket.on('profile:save', incoming => {
    const id = socket.data.playerId; if (!id) return;
    const profile = safeProfile(incoming); const g = guildMembership(id); profile.player.guildId = g?.id || null;
    saveProfile(id, profile);
    const p = online.get(id); if (p) Object.assign(p, { name: profile.player.name, level: profile.player.level, rank: profile.player.rank, classId: profile.player.classId, guildId: g?.id || null });
    socket.emit('profile:saved', { at: Date.now() }); broadcastOnline();
  });

  socket.on('player:move', pos => {
    const id = socket.data.playerId, p = online.get(id); if (!p) return;
    const t = Date.now(); if (t - p.lastMove < 70) return; p.lastMove = t;
    p.x = Math.max(-9999, Math.min(9999, Number(pos?.x) || 0));
    p.y = Math.max(-9999, Math.min(9999, Number(pos?.y) || 0));
    p.facing = ['up','down','left','right'].includes(pos?.facing) ? pos.facing : 'down';
    socket.broadcast.emit('player:move', publicPlayer(id));
  });

  socket.on('guild:list', () => socket.emit('guild:list', Object.values(store.guilds).map(g => ({ id:g.id, name:g.name, tag:g.tag, level:g.level, xp:g.xp, members:Object.keys(g.members).length })).sort((a,b)=>b.level-a.level).slice(0,50)));
  socket.on('guild:create', data => {
    const pid = socket.data.playerId; if (!pid) return;
    if (guildMembership(pid)) return socket.emit('server:error', 'Leave your current guild first.');
    const name = cleanText(data?.name, 24), tag = cleanText(data?.tag, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (name.length < 3 || tag.length < 2) return socket.emit('server:error', 'Use a guild name of 3–24 characters and a tag of 2–5 letters/numbers.');
    if (Object.values(store.guilds).some(g => g.name.toLowerCase() === name.toLowerCase() || g.tag === tag)) return socket.emit('server:error', 'That guild name or tag is already taken.');
    const id = String(store.nextGuildId++);
    store.guilds[id] = { id, name, tag, level: 1, xp: 0, createdAt: Date.now(), members: { [pid]: { role: 'leader', joinedAt: Date.now() } } };
    const pr = store.players[pid].profile; pr.player.guildId = Number(id); saveStore(); sendGuildState(socket); broadcastOnline(); socket.emit('toast', `[${tag}] guild created!`);
  });
  socket.on('guild:join', rawId => {
    const pid = socket.data.playerId, id = String(clampInt(rawId,1,999999)); if (!pid) return;
    if (guildMembership(pid)) return socket.emit('server:error', 'Leave your current guild first.');
    const g = store.guilds[id]; if (!g) return socket.emit('server:error', 'Guild not found.');
    if (Object.keys(g.members).length >= 50) return socket.emit('server:error', 'Guild is full.');
    g.members[pid] = { role:'member', joinedAt:Date.now() }; store.players[pid].profile.player.guildId = Number(id); saveStore(); sendGuildState(socket); io.to('guild:'+id).emit('guild:system', `${online.get(pid)?.name || 'A tamer'} joined the guild.`); broadcastOnline();
  });
  socket.on('guild:leave', () => {
    const pid = socket.data.playerId, gRef = guildMembership(pid); if (!gRef) return socket.emit('server:error', 'You are not in a guild.');
    const g = store.guilds[String(gRef.id)]; const ids = Object.keys(g.members); delete g.members[pid];
    if (gRef.role === 'leader' && Object.keys(g.members).length) { const next = Object.keys(g.members)[0]; g.members[next].role = 'leader'; }
    if (!Object.keys(g.members).length) delete store.guilds[String(gRef.id)];
    const p = store.players[pid]?.profile; if (p) p.player.guildId = null;
    for (const s of io.sockets.sockets.values()) if (s.data.playerId === pid) s.leave('guild:'+gRef.id);
    saveStore(); sendGuildState(socket); io.to('guild:'+gRef.id).emit('guild:system', `${online.get(pid)?.name || 'A tamer'} left the guild.`); broadcastOnline();
  });
  socket.on('guild:members', () => { const g = guildMembership(socket.data.playerId); socket.emit('guild:members', g ? guildMemberList(String(g.id)) : []); });
  socket.on('guild:chat', msg => {
    const pid = socket.data.playerId, g = guildMembership(pid); if (!g) return;
    const message = cleanText(msg, 180); if (!message) return;
    io.to('guild:'+g.id).emit('guild:chat', { name: online.get(pid)?.name || 'Tamer', message, at: Date.now() });
  });

  socket.on('shop:list', () => socket.emit('shop:list', SHOP));
  socket.on('shop:buy', data => {
    const pid = socket.data.playerId, p = store.players[pid]?.profile; if (!p) return;
    const item = SHOP.find(x => x.id === String(data?.itemId)); const qty = clampInt(data?.qty || 1, 1, 10);
    if (!item) return socket.emit('server:error', 'Shop item not found.');
    const price = item.price * qty; if (p.player.gold < price) return socket.emit('server:error', 'Not enough gold.');
    p.player.gold -= price;
    if (item.kind === 'orbs') p.orbs += item.amount * qty;
    else if (item.kind === 'potions') p.potions += item.amount * qty;
    else { p.items = p.items || {}; p.items[item.id] = (p.items[item.id] || 0) + item.amount * qty; }
    saveProfile(pid, p); socket.emit('profile:load', { profile:p, isNew:false }); socket.emit('toast', `Bought ${qty} × ${item.name}.`);
  });

  socket.on('trade:request', targetIdRaw => {
    const from = socket.data.playerId, targetId = safeId(targetIdRaw), target = online.get(targetId);
    if (!from || !target || from === targetId) return socket.emit('server:error', 'That player is not available.');
    if (activeTradeByPlayer.has(from) || activeTradeByPlayer.has(targetId)) return socket.emit('server:error', 'One of those players is already trading.');
    const id = 'tr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);
    const t = { id, status:'pending', a:{id:from,socketId:socket.id,offer:normalizeOffer({})}, b:{id:targetId,socketId:target.socketId,offer:normalizeOffer({})}, confirmed:{a:false,b:false} };
    trades.set(id,t); activeTradeByPlayer.set(from,id); activeTradeByPlayer.set(targetId,id);
    io.to(target.socketId).emit('trade:incoming', { tradeId:id, from:publicPlayer(from) }); socket.emit('toast', `Trade request sent to ${target.name}.`);
  });
  socket.on('trade:accept', idRaw => { const t = trades.get(String(idRaw)); if (!t || t.status!=='pending' || t.b.socketId!==socket.id) return; t.status='active'; io.to(t.a.socketId).emit('trade:started', tradeView(t)); io.to(t.b.socketId).emit('trade:started', tradeView(t)); });
  socket.on('trade:reject', idRaw => { const t=trades.get(String(idRaw)); if(t && [t.a.socketId,t.b.socketId].includes(socket.id)) clearTrade(t,'Trade declined.'); });
  socket.on('trade:update', data => {
    const t = trades.get(String(data?.tradeId)); if (!t || t.status!=='active') return;
    const side = sideFor(t,socket); if(!side) return;
    t[side].offer = normalizeOffer(data?.offer); t.confirmed={a:false,b:false};
    io.to(t.a.socketId).emit('trade:state',tradeView(t)); io.to(t.b.socketId).emit('trade:state',tradeView(t));
  });
  socket.on('trade:confirm', idRaw => {
    const t=trades.get(String(idRaw)); if(!t || t.status!=='active') return;
    const side=sideFor(t,socket); if(!side)return; t.confirmed[side]=true;
    io.to(t.a.socketId).emit('trade:state',tradeView(t)); io.to(t.b.socketId).emit('trade:state',tradeView(t));
    if(!t.confirmed.a || !t.confirmed.b)return;
    try { finishTrade(t); } catch(e) { t.confirmed={a:false,b:false}; io.to(t.a.socketId).emit('trade:error',e.message); io.to(t.b.socketId).emit('trade:error',e.message); io.to(t.a.socketId).emit('trade:state',tradeView(t)); io.to(t.b.socketId).emit('trade:state',tradeView(t)); }
  });
  socket.on('trade:cancel', idRaw => { const t=trades.get(String(idRaw)); if(t && [t.a.socketId,t.b.socketId].includes(socket.id)) clearTrade(t,'Trade cancelled.'); });

  socket.on('disconnect', () => {
    const pid=socket.data.playerId; if(!pid)return;
    if(socketsByPlayer.get(pid)===socket.id){ socketsByPlayer.delete(pid); online.delete(pid); }
    for(const t of trades.values()) if(t.a.socketId===socket.id || t.b.socketId===socket.id) clearTrade(t,'Player disconnected.');
    broadcastOnline();
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Beast Tamer 2D Online running on port ${PORT}`));
function flushStore() { try { fs.writeFileSync(DATA_FILE, JSON.stringify(store)); } catch (e) { console.error('Final data save failed:', e.message); } }
process.on('SIGTERM', () => { flushStore(); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { flushStore(); server.close(() => process.exit(0)); });
