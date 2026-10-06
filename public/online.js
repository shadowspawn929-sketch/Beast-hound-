/* Beast Tamer Online: multiplayer + guild + trading + shop client. */
(() => {
  const PLAYER_KEY = 'beast_tamer_player_id';
  const generatedId = globalThis.crypto?.randomUUID?.() || ('p_' + Date.now().toString(36) + Math.random().toString(36).slice(2));
  const playerId = localStorage.getItem(PLAYER_KEY) || generatedId;
  localStorage.setItem(PLAYER_KEY, playerId);

  const socket = io({ transports: ['websocket', 'polling'] });
  const online = new Map();
  let shop = [];
  let guildState = { guild: null, members: [] };
  let trade = null;
  let incomingTrade = null;
  let lastMoveSent = 0;
  let currentModal = null;

  const $ = id => document.getElementById(id);
  const overlay = $('panelOverlay');
  const title = $('modalTitle');
  const body = $('modalBody');

  function toast(message) {
    if (window.beastTamer?.toast) window.beastTamer.toast(message);
    else {
      const el = $('statusToast');
      if (!el) return;
      el.textContent = message;
      el.classList.add('toast-show');
      clearTimeout(el._t);
      el._t = setTimeout(() => el.classList.remove('toast-show'), 1800);
    }
  }
  function esc(v) {
    return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }
  function getState() { return window.beastTamer?.getState ? window.beastTamer.getState() : null; }
  function applyProfile(p) {
    if (!p) return;
    window.beastTamer?.setState?.(p);
    window.beastTamer?.save?.();
  }
  function saveServer() {
    const state = getState();
    if (state) socket.emit('profile:save', state);
  }
  function open(kind) {
    currentModal = kind;
    overlay.classList.remove('hidden');
    if (kind === 'online') renderOnline();
    else if (kind === 'guild') renderGuild();
    else if (kind === 'trade') renderTradeHub();
    else if (kind === 'shop') renderShop();
  }
  function close() { currentModal = null; overlay.classList.add('hidden'); }

  function renderOnline() {
    title.textContent = 'ONLINE TAMERS';
    const players = [...online.values()].filter(p => p.id !== playerId);
    body.innerHTML = `
      <div class="online-status"><span class="pulse-dot"></span> ${players.length + 1} tamer${players.length === 0 ? '' : 's'} online</div>
      <div class="grid">${players.length ? players.map(p => `
        <div class="card">
          <h3>${esc(p.name)}</h3>
          <span class="tag">${esc(p.rank || 'E')}-RANK</span><span class="tag">Lv.${p.level || 1}</span>
          ${p.guildId ? '<span class="tag">GUILD</span>' : ''}
          <button class="modal-action" data-trade-player="${esc(p.id)}">🔄 REQUEST TRADE</button>
        </div>`).join('') : '<div class="card"><h3>No other tamers yet</h3><div class="muted">Open the game in another browser/device to test multiplayer.</div></div>'}</div>`;
    body.querySelectorAll('[data-trade-player]').forEach(btn => btn.onclick = () => {
      socket.emit('trade:request', btn.dataset.tradePlayer);
      toast('Trade request sent.');
    });
  }

  function renderGuild() {
    title.textContent = 'GUILD';
    if (guildState.guild) {
      const g = guildState.guild;
      body.innerHTML = `
        <div class="card">
          <h3>[${esc(g.tag)}] ${esc(g.name)}</h3>
          <span class="tag">Lv.${g.level}</span><span class="tag">${guildState.members.length}/50 MEMBERS</span>
          <div class="muted" style="margin-top:6px">Guild XP: ${g.xp}</div>
        </div>
        <div class="card guild-chat-wrap">
          <h3>💬 Guild Chat</h3>
          <div id="guildChatLog" class="chat-log"></div>
          <div class="inline-form"><input id="guildChatInput" maxlength="180" placeholder="Write to your guild..."><button id="guildChatSend">SEND</button></div>
        </div>
        <div class="card"><h3>👥 Members</h3><div class="member-list">${guildState.members.map(m => `<div class="member-row"><span>${esc(m.name)}</span><span>${esc(m.role.toUpperCase())}${m.online ? ' • 🟢' : ''}</span></div>`).join('')}</div></div>
        <button class="modal-action danger" id="guildLeave">LEAVE GUILD</button>`;
      $('guildChatSend').onclick = sendGuildChat;
      $('guildChatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendGuildChat(); });
      $('guildLeave').onclick = () => { socket.emit('guild:leave'); };
    } else {
      body.innerHTML = `
        <div class="card">
          <h3>🏰 Create Guild</h3>
          <div class="inline-form"><input id="guildName" maxlength="24" placeholder="Guild name"><input id="guildTag" maxlength="5" placeholder="TAG"><button id="guildCreate">CREATE</button></div>
        </div>
        <div class="card"><h3>🌐 Find a Guild</h3><div id="guildList" class="member-list"><div class="muted">Loading...</div></div></div>`;
      $('guildCreate').onclick = () => {
        const name = $('guildName').value.trim(); const tag = $('guildTag').value.trim();
        socket.emit('guild:create', { name, tag });
      };
      socket.emit('guild:list');
    }
  }
  function sendGuildChat() {
    const input = $('guildChatInput'); if (!input || !input.value.trim()) return;
    socket.emit('guild:chat', input.value.trim()); input.value = '';
  }
  function renderGuildList(list) {
    const el = $('guildList'); if (!el) return;
    el.innerHTML = list.length ? list.map(g => `<div class="member-row"><span>[${esc(g.tag)}] ${esc(g.name)}<small> Lv.${g.level} • ${g.members} members</small></span><button class="mini-btn" data-join-guild="${g.id}">JOIN</button></div>`).join('') : '<div class="muted">No guilds yet. Create the first one!</div>';
    el.querySelectorAll('[data-join-guild]').forEach(b => b.onclick = () => socket.emit('guild:join', Number(b.dataset.joinGuild)));
  }
  function addChatLine(data) {
    const log = $('guildChatLog'); if (!log) return;
    const div = document.createElement('div');
    div.className = 'chat-line'; div.innerHTML = `<b>${esc(data.name || 'Tamer')}:</b> ${esc(data.message || '')}`; log.appendChild(div); log.scrollTop = log.scrollHeight;
  }

  function renderTradeHub() {
    title.textContent = trade ? 'TRADE' : 'TRADING';
    if (!trade) {
      body.innerHTML = `<div class="card"><h3>🔄 Player Trading</h3><div class="muted">Choose an online player, then propose gold, potions, orbs, or a beast from Storage.</div><button class="modal-action" id="tradeOnline">VIEW ONLINE TAMERS</button></div>`;
      $('tradeOnline').onclick = () => open('online');
      return;
    }
    const state = getState() || {gold:0,orbs:0,potions:0,storage:[]};
    const mine = trade.a.playerId === playerId ? trade.a : trade.b;
    const other = trade.a.playerId === playerId ? trade.b : trade.a;
    body.innerHTML = `
      <div class="trade-head"><div><b>${esc(mine.name)}</b><div class="muted">Your offer</div></div><div class="vs">⇄</div><div><b>${esc(other.name)}</b><div class="muted">Their offer</div></div></div>
      <div class="trade-columns">
        <div class="card">
          <h3>YOU</h3>
          <label>Gold <input id="offerGold" class="trade-input" type="number" min="0" max="999999999" value="${mine.offer.gold}"></label>
          <label>Orbs <input id="offerOrbs" class="trade-input" type="number" min="0" max="${state.orbs}" value="${mine.offer.orbs}"></label>
          <label>Potions <input id="offerPotions" class="trade-input" type="number" min="0" max="${state.potions}" value="${mine.offer.potions}"></label>
          <label>Beast <select id="offerBeast" class="trade-input"><option value="">None</option>${(state.storage||[]).map(b => `<option value="${esc(b.uid || '')}" ${mine.offer.beastUid===b.uid?'selected':''}>${esc(b.name || b.id)} • Lv.${b.level}</option>`).join('')}</select></label>
          <button class="modal-action" id="tradeOffer">UPDATE OFFER</button>
        </div>
        <div class="card">
          <h3>THEIR OFFER</h3>
          <div class="offer-line">💰 Gold <b>${other.offer.gold}</b></div><div class="offer-line">🔮 Orbs <b>${other.offer.orbs}</b></div><div class="offer-line">🧪 Potions <b>${other.offer.potions}</b></div>
          <div class="offer-line">🐉 Beast <b>${other.offer.beastUid ? beastName(other.offer.beastUid) : 'None'}</b></div>
          <div class="confirm-state">${trade.confirmed[mine === trade.a ? 'a' : 'b'] ? '✅ You confirmed' : '⏳ You have not confirmed'}<br>${trade.confirmed[mine === trade.a ? 'b' : 'a'] ? '✅ They confirmed' : '⏳ They have not confirmed'}</div>
        </div>
      </div>
      <button class="modal-action confirm" id="tradeConfirm">${trade.confirmed[mine === trade.a ? 'a' : 'b'] ? 'CONFIRMED ✓' : 'CONFIRM TRADE'}</button>
      <button class="modal-action danger" id="tradeCancel">CANCEL TRADE</button>`;
    $('tradeOffer').onclick = () => {
      socket.emit('trade:update', { tradeId: trade.tradeId, offer: { gold: Number($('offerGold').value)||0, orbs: Number($('offerOrbs').value)||0, potions: Number($('offerPotions').value)||0, beastUid: $('offerBeast').value || null } });
    };
    $('tradeConfirm').onclick = () => socket.emit('trade:confirm', trade.tradeId);
    $('tradeCancel').onclick = () => socket.emit('trade:cancel', trade.tradeId);
  }
  function beastName(uid) {
    const s = getState(); const b = [...(s?.team||[]), ...(s?.storage||[])].find(x => x.uid === uid);
    return b ? (b.name || b.id) : 'Beast';
  }

  function renderShop() {
    title.textContent = 'REALM SHOP';
    const s = getState() || { player: { gold: 0 } };
    body.innerHTML = `<div class="shop-balance">💰 ${s.player.gold} GOLD</div><div class="grid">${shop.map(item => `
      <div class="card shop-card"><div class="shop-icon">${item.id.includes('orb') ? '🔮' : '🧪'}</div><h3>${esc(item.name)}</h3><div class="muted">${esc(item.description)}</div><div class="price">${item.price} GOLD</div><button class="modal-action" data-buy="${esc(item.id)}">BUY</button></div>`).join('')}</div>`;
    body.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => socket.emit('shop:buy', { itemId: b.dataset.buy, qty: 1 }));
  }

  socket.on('connect', () => {
    const profile = getState() || { player: { name: 'Hunter' } };
    socket.emit('player:hello', { id: playerId, name: profile.player.name, profile });
  });
  socket.on('disconnect', () => toast('Offline mode. Multiplayer will reconnect automatically.'));
  socket.on('profile:load', data => applyProfile(data.profile));
  socket.on('profile:saved', () => {});
  socket.on('toast', msg => toast(msg));
  socket.on('server:error', msg => toast('⚠️ ' + msg));
  socket.on('session:replaced', () => toast('This player opened the game somewhere else.'));

  socket.on('online:list', list => {
    const next = new Map(); list.forEach(p => next.set(p.id, p));
    online.clear(); next.forEach((v,k) => online.set(k,v));
    if (window.beastTamer?.setOnlinePlayers) window.beastTamer.setOnlinePlayers(list.filter(p => p.id !== playerId));
    if (currentModal === 'online') renderOnline();
  });
  socket.on('player:move', p => window.beastTamer?.updateRemotePlayer?.(p));

  socket.on('guild:state', data => {
    guildState = data || {guild:null,members:[]};
    if (currentModal === 'guild') renderGuild();
  });
  socket.on('guild:list', renderGuildList);
  socket.on('guild:members', members => { guildState.members = members; if (currentModal === 'guild') renderGuild(); });
  socket.on('guild:chat', addChatLine);
  socket.on('guild:system', msg => addChatLine({ name: 'SYSTEM', message: msg }));

  socket.on('shop:list', items => { shop = items || []; if (currentModal === 'shop') renderShop(); });

  socket.on('trade:incoming', data => {
    incomingTrade = data;
    title.textContent = 'TRADE REQUEST'; overlay.classList.remove('hidden'); currentModal = 'incomingTrade';
    body.innerHTML = `<div class="card"><h3>🔄 ${esc(data.from?.name || 'A player')} wants to trade.</h3><div class="muted">You can offer gold, potions, orbs, and stored beasts.</div><button class="modal-action" id="tradeAccept">ACCEPT TRADE</button><button class="modal-action danger" id="tradeReject">DECLINE</button></div>`;
    $('tradeAccept').onclick = () => socket.emit('trade:accept', data.tradeId);
    $('tradeReject').onclick = () => { socket.emit('trade:reject', data.tradeId); close(); };
  });
  socket.on('trade:started', data => { trade = data; open('trade'); });
  socket.on('trade:state', data => { trade = data; if (currentModal === 'trade') renderTradeHub(); });
  socket.on('trade:complete', profile => { trade = null; applyProfile(profile); toast('✅ Trade completed!'); if (currentModal === 'trade') renderTradeHub(); });
  socket.on('trade:closed', msg => { trade = null; toast(msg || 'Trade closed.'); if (currentModal === 'trade') renderTradeHub(); });
  socket.on('trade:error', msg => { toast('⚠️ ' + msg); });

  $('onlineBtn').onclick = () => open('online');
  $('guildBtn').onclick = () => open('guild');
  $('tradeBtn').onclick = () => open('trade');
  $('shopBtn').onclick = () => { socket.emit('shop:list'); open('shop'); };
  $('closeModal').addEventListener('click', close);

  overlay.addEventListener('click', e => { if (e.target === overlay && !trade) close(); });
  window.addEventListener('beforeunload', saveServer);
  setInterval(saveServer, 12000);
  setInterval(() => {
    const pos = window.beastTamer?.getPosition?.();
    if (!pos || !socket.connected) return;
    const t = Date.now(); if (t - lastMoveSent < 120) return;
    lastMoveSent = t; socket.emit('player:move', pos);
  }, 120);

  window.beastTamerOnline = { socket, playerId, saveServer, open };
})();
