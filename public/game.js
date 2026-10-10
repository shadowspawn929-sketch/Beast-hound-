(() => {
'use strict';

/* Beast Tamer: Wild Realm. Lightweight 2D canvas game. */
const SAVE_KEY = 'beast_tamer_wild_realm_ultimate_v1';
const PLAYER_KEY = 'beast_tamer_online_player_id';
const TILE = 64;
const RANKS = ['E','D','C','B','A','S','SS'];
const CLASS_LEVELS = [1,20,50,100];
const BEAST_LEVELS = [1,10,25,50];
const CLASS_DATA = {
  warrior:{name:'Warrior',icon:'⚔️',colour:'#7789a8',weapon:'Greatsword',portrait:'🧑‍⚔️',evo:['Warrior','Knight','Grand Knight','Overlord'],bonus:1.08},
  berserker:{name:'Berserker',icon:'🪓',colour:'#b45158',weapon:'Battle Axe',portrait:'🪓',evo:['Berserker','Ravager','Warbringer','Calamity'],bonus:1.14},
  ranger:{name:'Ranger',icon:'🏹',colour:'#5e9d6d',weapon:'Bow',portrait:'🏹',evo:['Ranger','Hunter','Beast Hunter','Beastmaster'],bonus:1.10},
  mage:{name:'Mage',icon:'🔮',colour:'#826bdb',weapon:'Arcane Staff',portrait:'🧙',evo:['Mage','Archmage','Elemental Sage','Arcane Sovereign'],bonus:1.12},
  paladin:{name:'Paladin',icon:'🛡️',colour:'#d0b76d',weapon:'Sword + Shield',portrait:'🛡️',evo:['Paladin','Holy Knight','Divine Guardian','Celestial Champion'],bonus:1.05},
  assassin:{name:'Assassin',icon:'🗡️',colour:'#414e65',weapon:'Twin Daggers',portrait:'🥷',evo:['Assassin','Shadowblade','Void Assassin','Night Sovereign'],bonus:1.16},
  beastTamer:{name:'Beast Tamer',icon:'🐾',colour:'#b27b4c',weapon:'Taming Gauntlet',portrait:'🧑‍🦱',evo:['Beast Tamer','Beast Handler','Beast Lord','Beast Emperor'],bonus:1.07},
  necromancer:{name:'Necromancer',icon:'☠️',colour:'#7954bc',weapon:'Shadow Staff',portrait:'☠️',evo:['Necromancer','Dark Summoner','Death Lord','Shadow Monarch'],bonus:1.10},
  alchemist:{name:'Alchemist',icon:'🧪',colour:'#58a9a1',weapon:'Alchemy Gauntlet',portrait:'🧪',evo:['Alchemist','Transmuter','Master Alchemist','Alchemic Emperor'],bonus:1.06}
};

const SPECIES = {
 Ignis:{name:'Ignis',element:'Fire',rank:'C',hp:100,atk:24,def:12,crit:.10,icon:'🔥',colour:'#ef7044',shape:'fox',skill:'Flame Burst',evo:['Flame Cub','Flamefang','Inferno Wolf','Infernal Fenrir']},
 Emberling:{name:'Emberling',element:'Fire',rank:'D',hp:86,atk:20,def:11,crit:.12,icon:'🦊',colour:'#f3a04e',shape:'fox',skill:'Ember Shot',evo:['Ember Cub','Emberling','Flame Spirit','Phoenix Lord']},
 MagmaGolem:{name:'Magma Golem',element:'Fire',rank:'B',hp:185,atk:28,def:28,crit:.04,icon:'🌋',colour:'#c4583b',shape:'golem',skill:'Molten Fist',evo:['Magma Core','Magma Golem','Volcanic Titan','Caldera Colossus']},
 Aquaris:{name:'Aquaris',element:'Water',rank:'C',hp:130,atk:18,def:24,crit:.06,icon:'💧',colour:'#4fa8de',shape:'otter',skill:'Tidal Crash',evo:['Water Pup','Aqua Hound','Tidal Wolf','Abyssal Fenrir']},
 Bubblefin:{name:'Bubblefin',element:'Water',rank:'E',hp:68,atk:14,def:12,crit:.08,icon:'🐟',colour:'#4dbfd2',shape:'fish',skill:'Bubble Burst',evo:['Bubble Fish','Reef Swimmer','Ocean Fang','Leviathan']},
 Frostfin:{name:'Frostfin',element:'Water',rank:'D',hp:92,atk:17,def:18,crit:.07,icon:'❄️',colour:'#9ad8ed',shape:'fish',skill:'Frost Pulse',evo:['Ice Fish','Frost Serpent','Glacial Serpent','Eternal Wyrm']},
 Sylva:{name:'Sylva',element:'Nature',rank:'C',hp:112,atk:20,def:18,crit:.07,icon:'🌿',colour:'#72b86b',shape:'stag',skill:'Vine Snare',evo:['Forest Cub','Thornfang','Ancient Wolf','Worldroot Fenrir']},
 Thornback:{name:'Thornback',element:'Nature',rank:'B',hp:142,atk:23,def:24,crit:.05,icon:'🍃',colour:'#658e4b',shape:'boar',skill:'Briar Charge',evo:['Thorn Beast','Ironthorn','Elderthorn','Forest Colossus']},
 SparkMouse:{name:'Spark Mouse',element:'Lightning',rank:'E',hp:72,atk:17,def:9,crit:.14,icon:'⚡',colour:'#edcf5b',shape:'mouse',skill:'Static Pop',evo:['Spark Mouse','Thunder Rat','Storm Rodent','Thunder Emperor']},
 VoltHawk:{name:'Volt Hawk',element:'Lightning',rank:'B',hp:120,atk:28,def:14,crit:.15,icon:'🦅',colour:'#6caada',shape:'bird',skill:'Thunder Dive',evo:['Volt Hawk','Storm Hawk','Thunder Eagle','Raijin Falcon']},
 WindFalcon:{name:'Wind Falcon',element:'Wind',rank:'D',hp:84,atk:22,def:11,crit:.13,icon:'🌪️',colour:'#95d8ca',shape:'bird',skill:'Gale Peck',evo:['Wind Falcon','Gale Falcon','Sky Raptor','Heavenly Raptor']},
 GaleFox:{name:'Gale Fox',element:'Wind',rank:'C',hp:98,atk:25,def:12,crit:.16,icon:'🌬️',colour:'#d99b71',shape:'fox',skill:'Swift Gale',evo:['Gale Fox','Swift Fox','Storm Fox','Divine Kitsune']},
 TerraBoar:{name:'Terra Boar',element:'Earth',rank:'C',hp:155,atk:22,def:26,crit:.05,icon:'🪨',colour:'#9b785a',shape:'boar',skill:'Boulder Charge',evo:['Earth Boar','Boulder Boar','Mountain Boar','Worldbreaker Boar']},
 StoneGolem:{name:'Stone Golem',element:'Earth',rank:'C',hp:150,atk:19,def:29,crit:.03,icon:'🗿',colour:'#8b9aaa',shape:'golem',skill:'Stone Fist',evo:['Stone Golem','Iron Golem','Ancient Golem','Titan Golem']},
 ShadowWolf:{name:'Shadow Wolf',element:'Shadow',rank:'D',hp:88,atk:21,def:13,crit:.12,icon:'🐺',colour:'#655da2',shape:'wolf',skill:'Dark Pounce',evo:['Shadow Wolf','Nightfang','Void Wolf','Eclipse Fenrir']},
 VoidBat:{name:'Void Bat',element:'Shadow',rank:'C',hp:94,atk:24,def:11,crit:.16,icon:'🦇',colour:'#7056a8',shape:'bat',skill:'Void Screech',evo:['Void Bat','Abyss Bat','Void Wing','Abyssal Dragon']},
 NightPanther:{name:'Night Panther',element:'Shadow',rank:'B',hp:138,atk:32,def:17,crit:.17,icon:'🐈‍⬛',colour:'#34334f',shape:'panther',skill:'Night Rush',evo:['Night Panther','Shadow Panther','Void Panther','Eternal Night Panther']},
 Mortis:{name:'Mortis',element:'Necromancy',rank:'C',hp:106,atk:23,def:15,crit:.11,icon:'☠️',colour:'#8372bd',shape:'wolf',skill:'Night Slash',evo:['Bone Cub','Death Wolf','Gravefang','Dread Fenrir']},
 BoneKnight:{name:'Bone Knight',element:'Necromancy',rank:'B',hp:150,atk:31,def:22,crit:.08,icon:'💀',colour:'#b7bdc1',shape:'knight',skill:'Grave Blade',evo:['Bone Warrior','Death Knight','Dark Knight','Death Emperor']},
 SoulWraith:{name:'Soul Wraith',element:'Necromancy',rank:'A',hp:125,atk:34,def:12,crit:.18,icon:'👻',colour:'#7ebbc5',shape:'wraith',skill:'Soul Drain',evo:['Lost Soul','Soul Wraith','Phantom Lord','Soul Reaper']},
 Drakeling:{name:'Drakeling',element:'Dragon',rank:'A',hp:205,atk:32,def:22,crit:.12,icon:'🐉',colour:'#c76a56',shape:'dragon',skill:'Dragon Breath',evo:['Dragon Egg','Young Dragon','Ancient Dragon','Elder Dragon']},
 VoidDragon:{name:'Void Dragon',element:'Dragon',rank:'SS',hp:360,atk:52,def:34,crit:.17,icon:'🐲',colour:'#6b4a9a',shape:'dragon',skill:'Abyss Break',evo:['Void Dragon','Abyss Drake','Abyss Dragon','Void Emperor']},
 CelestialDragon:{name:'Celestial Dragon',element:'Dragon',rank:'SS',hp:390,atk:49,def:38,crit:.16,icon:'✨',colour:'#d2be7e',shape:'dragon',skill:'Astral Roar',evo:['Celestial Wyrm','Celestial Dragon','Astral Dragon','Divine Dragon']},
 Fenrir:{name:'Fenrir',element:'Legendary',rank:'SS',hp:430,atk:58,def:39,crit:.19,icon:'🐺',colour:'#d8e3e6',shape:'wolf',skill:'Moonfang',evo:['Fenrir','Awakened Fenrir','Divine Fenrir'],legendary:true},
 Leviathan:{name:'Leviathan',element:'Legendary',rank:'SS',hp:470,atk:55,def:45,crit:.12,icon:'🌊',colour:'#388aa4',shape:'serpent',skill:'Abyss Tide',evo:['Leviathan','Awakened Leviathan','Abyssal Leviathan'],legendary:true},
 Phoenix:{name:'Phoenix',element:'Legendary',rank:'SS',hp:300,atk:64,def:25,crit:.22,icon:'🔥',colour:'#e78b4b',shape:'phoenix',skill:'Rebirth',evo:['Young Phoenix','Eternal Phoenix','Divine Phoenix'],legendary:true},
 Behemoth:{name:'Behemoth',element:'Legendary',rank:'SS',hp:520,atk:60,def:49,crit:.10,icon:'🦬',colour:'#886e5a',shape:'behemoth',skill:'World Crush',evo:['Young Behemoth','Ancient Behemoth','World Behemoth'],legendary:true},
 WorldSerpent:{name:'World Serpent',element:'Legendary',rank:'SS',hp:500,atk:62,def:41,crit:.14,icon:'🐍',colour:'#5f9965',shape:'serpent',skill:'World Coil',evo:['Serpent','Ancient Serpent','Jörmungandr'],legendary:true}
};

const REGION_DATA = {
 meadow:{name:'Verdant Wilds',label:'VERDANT WILDS',unlock:1,terrain:'grass'},
 town:{name:'Greenleaf Town',label:'GREENLEAF TOWN',unlock:1,terrain:'town'},
 forest:{name:'Whisper Woods',label:'WHISPER WOODS',unlock:1,terrain:'forest'},
 desert:{name:'Sandcliff Desert',label:'SANDCLIFF DESERT',unlock:2,terrain:'sand'},
 coast:{name:'Seabreeze Coast',label:'SEABREEZE COAST',unlock:2,terrain:'sand'},
 volcano:{name:'Emberfall Ridge',label:'EMBERFALL RIDGE',unlock:3,terrain:'lava'},
 frost:{name:'Frostpeak Mountains',label:'FROSTPEAK MOUNTAINS',unlock:3,terrain:'snow'},
 shadow:{name:'Shadowmire',label:'SHADOWMIRE',unlock:4,terrain:'shadow'},
 dragon:{name:'Dracorin Sanctuary',label:'DRACORIN SANCTUARY',unlock:5,terrain:'crystal'}
};
const RANK_SHADOW = {E:3,D:5,C:8,B:12,A:18,S:25,SS:40};
const NECRO_LIMITS = [5,12,25,50];
const SHOP_ITEMS = [
  {id:'orb',name:'Tame Orb',description:'Capture weakened wild beasts.',price:25,icon:'🔮',kind:'orbs',amount:1},
  {id:'potion',name:'Potion',description:'Restore player and beasts.',price:35,icon:'🧪',kind:'potions',amount:1},
  {id:'orb_pack',name:'Orb Pack ×5',description:'Five Tame Orbs.',price:110,icon:'🔮',kind:'orbs',amount:5},
  {id:'potion_pack',name:'Potion Pack ×5',description:'Five Potions.',price:150,icon:'🧪',kind:'potions',amount:5},
  {id:'camp_token',name:'Camp Token',description:'An exploration souvenir.',price:60,icon:'🏕️',kind:'items',amount:1}
];

const $ = id => document.getElementById(id);
const canvas = $('worldCanvas');
const ctx = canvas.getContext('2d', { alpha:false, desynchronized:true });
ctx.imageSmoothingEnabled = false;
let viewW = innerWidth, viewH = innerHeight, dpr = 1;
let state;
let worldTime = 0;
let player;
let camera = {x:0,y:0};
let movement = {x:0,y:0,mag:0};
let joystickPointer = null;
let lastTime = 0, accumulator = 0, fpsFrames=0, fpsTimer=0, fps=60;
let hudTimer = 0, skillCooldown = 0;
let showFPS = false, graphicsMode = 'medium';
let currentRegion = 'town';
let wilds = [];
let remotePlayers = new Map();
let selectedWild = null;
let battle = null;
let activeModal = 'none';
let guildState = {guild:null,members:[]};
let onlinePlayers = [];
let shopItems = SHOP_ITEMS.slice();
let trade = null;
let incomingTrade = null;
let lastNetworkMove = 0;
let lastSave = 0;
let lastNoticeTime = 0;
let dashTimer = 0, dashCooldown = 0, dashX = 0, dashY = 1;
let questCount = 0;
let activeEffectTimer = 0;
const tileCache = new Map();
const combatEffects = [];
const followers = new Map();
let toastTimer = 0;
const socket = (typeof window !== 'undefined' && window.BeastTamerOnline?.socket) ? window.BeastTamerOnline.socket : ((typeof io === 'function') ? io({transports:['websocket','polling']}) : null);
const CLASS_KEYS = Object.keys(CLASS_DATA);

function uid(prefix='b'){return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9);}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function rankIndex(r){return Math.max(0,RANKS.indexOf(r));}
function hash(x,y,seed=0){let n=(x*374761393+y*668265263+seed*1442695041)|0;n=(n^(n>>>13))*1274126177;return ((n^(n>>>16))>>>0)/4294967295;}
function niceId(id){return SPECIES[id]?.name||String(id||'Beast').replace(/([a-z])([A-Z])/g,'$1 $2');}
function beastData(id){return SPECIES[id]||SPECIES.SparkMouse;}
function makeBeast(id, level=1, shadow=false){const s=beastData(id), l=Math.max(1,level), mult=1+(l-1)*.035;return {uid:uid('b'),id,name:s.name,level:l,xp:0,hp:Math.round(s.hp*mult),maxHp:Math.round(s.hp*mult),atk:Math.round(s.atk*mult),def:Math.round(s.def*mult),crit:s.crit,element:s.element,rank:s.rank,shadow:!!shadow,formStage:0};}
function defaultState(){return {player:{name:'Hunter',rank:'E',level:1,xp:0,gold:180,hp:120,maxHp:120,classId:null,classStage:0},potions:4,orbs:6,team:[makeBeast('Ignis'),makeBeast('Aquaris'),makeBeast('Sylva'),makeBeast('Mortis')],storage:[makeBeast('SparkMouse'),makeBeast('WindFalcon'),makeBeast('StoneGolem')],shadowArmy:[],activeShadows:[],shadows:[],shadowEnergy:3,shadowMaxEnergy:3,defeated:0,worldLevel:1,bossDefeated:false,items:{},discoveredRegions:['town','meadow'],graphicsMode:'medium',showFPS:false,questCount:0};}
function normalBeasts(list,max){return (Array.isArray(list)?list:[]).slice(0,max).filter(b=>b&&SPECIES[b.id]).map(b=>({...makeBeast(b.id,Number(b.level)||1,!!b.shadow),...b,uid:b.uid||uid('b')}));}
function normalizeState(x){const d=defaultState(),s=x&&typeof x==='object'?x:{};const out={...d,...s,player:{...d.player,...(s.player||{})},team:normalBeasts(s.team??d.team,4),storage:normalBeasts(s.storage??d.storage,150),shadowArmy:normalBeasts(s.shadowArmy??[],100),activeShadows:Array.isArray(s.activeShadows)?s.activeShadows:[],items:s.items&&typeof s.items==='object'?s.items:{},discoveredRegions:Array.isArray(s.discoveredRegions)?s.discoveredRegions:['town','meadow']};
  out.player.level=clamp(Number(out.player.level)||1,1,999);out.player.xp=Math.max(0,Number(out.player.xp)||0);out.player.gold=clamp(Number(out.player.gold)||0,0,999999999);out.player.maxHp=Math.max(1,Number(out.player.maxHp)||120);out.player.hp=clamp(Number(out.player.hp)||out.player.maxHp,0,out.player.maxHp);out.player.rank=RANKS.includes(out.player.rank)?out.player.rank:'E';out.potions=clamp(Number(out.potions)||0,0,999999);out.orbs=clamp(Number(out.orbs)||0,0,999999);out.worldLevel=clamp(Number(out.worldLevel)||1,1,5);out.player.classId=CLASS_DATA[out.player.classId]?out.player.classId:null;out.player.classStage=classStage(out.player.classId,out.player.level);out.shadowArmy=out.shadowArmy.map(s=>({...s,shadow:true}));out.shadows=[...new Set(out.shadowArmy.map(b=>b.id))];out.graphicsMode=['low','medium','high'].includes(out.graphicsMode)?out.graphicsMode:'medium';out.showFPS=!!out.showFPS;return out;}
function loadState(){try{const v=localStorage.getItem(SAVE_KEY);return normalizeState(v?JSON.parse(v):defaultState());}catch{return defaultState();}}
state=loadState();
function classStage(classId=state?.player.classId,level=state?.player.level||1){if(!CLASS_DATA[classId])return 0;let n=0;CLASS_LEVELS.forEach((lv,i)=>{if(level>=lv)n=i;});return n;}
function classInfo(){return CLASS_DATA[state.player.classId]||CLASS_DATA.beastTamer;}
function classTitle(){const c=classInfo();return c.evo[classStage()]||c.name;}
function isNecro(){return state.player.classId==='necromancer';}
function shadowLimit(){return isNecro()?Math.max(RANK_SHADOW[state.player.rank]||3,NECRO_LIMITS[classStage()]):Math.min(15,RANK_SHADOW[state.player.rank]||3);}
function activeShadowLimit(){return isNecro()?Math.min(4,1+classStage()):1;}
function activeShadowCount(){return state.team.filter(b=>b.shadow).length;}
function shadowEnergyMax(){return isNecro()?3+classStage()*2:2;}
function refreshShadowEnergy(){state.shadowMaxEnergy=shadowEnergyMax();state.shadowEnergy=clamp(Number(state.shadowEnergy)||0,0,state.shadowMaxEnergy);}
function saveState(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));if(socket?.connected)socket.emit('profile:save',state);}catch(e){console.warn('Could not save',e);}}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1900);}
function setModal(title,eyebrow='WILD REALM',html=''){activeModal='custom';$('modalTitle').textContent=title;$('modalEyebrow').textContent=eyebrow;$('modalBody').innerHTML=html;$('modalLayer').classList.remove('hidden');}
function closeModal(){activeModal='none';$('modalLayer').classList.add('hidden');}
function currentDisplayName(b){const s=beastData(b.id);return (s.evo[Math.min(b.formStage||0,s.evo.length-1)]||b.name||s.name)+(b.shadow?' • Shadow':'');}
function updateBeastForm(b,showToast=false){const data=beastData(b.id);let stage=0;BEAST_LEVELS.forEach((lv,i)=>{if(Number(b.level)>=lv)stage=i;});stage=Math.min(stage,data.evo.length-1);if(stage>(b.formStage||0)){b.formStage=stage;b.maxHp=Math.round(b.maxHp*1.12);b.hp=b.maxHp;b.atk=Math.round(b.atk*1.12);b.def=Math.round(b.def*1.08);if(showToast)toast(`✨ ${data.name} evolved into ${data.evo[stage]}!`);}else b.formStage=Math.max(b.formStage||0,stage);}
function handleClassEvolution(previous){const before=classStage(state.player.classId,previous),after=classStage();state.player.classStage=after;refreshShadowEnergy();if(after>before){toast(`✨ CLASS EVOLUTION: ${classTitle()}`);}}

// Cached terrain tiles keep drawing inexpensive on phones.
const TERRAIN = {
 grass:{base:'#719e62',dots:['#80aa6d','#5f8f57','#8db574']},forest:{base:'#4e8154',dots:['#5b905d','#426f49','#6a995f']},
 road:{base:'#c8ad7d',dots:['#bba071','#d6bc8d','#ad956b']},roadV:{base:'#c8ad7d',dots:['#bba071','#d6bc8d','#ad956b']},roadH:{base:'#c8ad7d',dots:['#bba071','#d6bc8d','#ad956b']},roadCross:{base:'#c8ad7d',dots:['#bba071','#d6bc8d','#ad956b']},
 town:{base:'#8fa875',dots:['#98b57c','#84a06d','#a3bb83']},water:{base:'#3e91ad',dots:['#52a4bc','#347e9e','#66b5c2']},sand:{base:'#d7b873',dots:['#c9a764','#e4c782','#d2b06b']},snow:{base:'#b9d5d8',dots:['#cae1df','#a4c5d0','#e0ece4']},lava:{base:'#874b3e',dots:['#b96743','#713e3b','#e89a54']},shadow:{base:'#41485e',dots:['#595675','#353b50','#76708d']},crystal:{base:'#7489a4',dots:['#9eb6c2','#5d7292','#c0cfca']}
};
function inEllipse(tx,ty,cx,cy,rx,ry){const dx=(tx-cx)/rx,dy=(ty-cy)/ry;return dx*dx+dy*dy<1;}
function regionAt(tx,ty){
 if(Math.abs(tx)<=6&&Math.abs(ty)<=6)return 'town';
 if(tx>=34&&ty>=22)return 'dragon';
 if(tx>=27&&ty>=15&&ty<=45)return 'coast';
 if(tx>=18&&Math.abs(ty)<20)return 'desert';
 if(ty<=-24)return tx<=-16?'shadow':'frost';
 if(tx<=-18&&ty>=14)return 'volcano';
 if(tx<=-20&&ty<=-8)return 'shadow';
 if(inEllipse(tx,ty,-14,3,10,15)||inEllipse(tx,ty,8,17,11,8)||inEllipse(tx,ty,13,-13,7,8))return 'forest';
 return 'meadow';
}
function tileType(tx,ty){
 const r=regionAt(tx,ty);
 if(r==='town'){
  if(tx===0&&ty===0)return 'roadCross';
  if(tx===0)return 'roadV';
  if(ty===0)return 'roadH';
  if(Math.abs(tx)<=5&&Math.abs(ty)<=5&&((tx===2&&Math.abs(ty)>=2)||(ty===-2&&Math.abs(tx)>=2)))return 'road';
  return 'town';
 }
 if(r==='desert'||r==='coast')return hash(Math.floor(tx/2),Math.floor(ty/2),7)>.89?'road':'sand';
 if(r==='frost')return hash(Math.floor(tx/3),Math.floor(ty/3),8)>.92?'road':'snow';
 if(r==='volcano')return hash(Math.floor(tx/3),Math.floor(ty/3),9)>.18?'lava':'shadow';
 if(r==='shadow')return hash(Math.floor(tx/2),Math.floor(ty/2),10)>.86?'crystal':'shadow';
 if(r==='dragon')return hash(Math.floor(tx/2),Math.floor(ty/2),11)>.84?'crystal':'shadow';
 if(r==='forest')return hash(Math.floor(tx/2),Math.floor(ty/2),1)>.16?'forest':'grass';
 // One gently winding trail through the greenlands instead of isolated road tiles.
 const trailY=Math.round(Math.sin(tx/10)*1.1);
 if(Math.abs(ty-trailY)<=1 && tx>-28&&tx<24)return 'roadH';
 if(hash(Math.floor(tx/3),Math.floor(ty/3),2)>.985)return 'road';
 if(hash(Math.floor(tx/2),Math.floor(ty/2),3)>.96)return 'water';
 return 'grass';
}
function tileCanvas(type,variant){
 const key=type+':'+variant;if(tileCache.has(key))return tileCache.get(key);
 const c=document.createElement('canvas');c.width=TILE;c.height=TILE;const g=c.getContext('2d');
 const config=TERRAIN[type]||TERRAIN.grass;g.fillStyle=config.base;g.fillRect(0,0,TILE,TILE);
 let seed=(variant+1)*541+type.length*997;const rnd=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<52;i++){const x=rnd()*TILE,y=rnd()*TILE,sz=1+rnd()*4;g.globalAlpha=.13+rnd()*.12;g.fillStyle=config.dots[Math.floor(rnd()*config.dots.length)];g.beginPath();g.ellipse(x,y,sz,Math.max(1,sz*.45),rnd()*.8,0,Math.PI*2);g.fill();}
 g.globalAlpha=1;
 if(type==='grass'||type==='forest'||type==='town'){
  for(let i=0;i<7;i++){const x=4+rnd()*56,y=4+rnd()*56;g.strokeStyle=i%3?'#456f49':'#b7c985';g.globalAlpha=.28;g.lineWidth=1;g.beginPath();g.moveTo(x,y+2);g.lineTo(x-1,y-2);g.moveTo(x,y+2);g.lineTo(x+2,y-1);g.stroke();}
  if(variant===2||variant===5){const fx=12+rnd()*40,fy=12+rnd()*40;g.globalAlpha=.82;g.fillStyle=variant===2?'#e8d79c':'#d5a9bb';g.beginPath();g.arc(fx,fy,1.8,0,Math.PI*2);g.fill();g.fillStyle='#e7e3bd';g.beginPath();g.arc(fx+2,fy-1,1,0,Math.PI*2);g.fill();}
 }
 if(type.startsWith('road')){
  g.globalAlpha=.25;g.strokeStyle='#8c7757';g.lineWidth=1;g.setLineDash([3,5]);g.beginPath();
  if(type==='roadV'){g.moveTo(32,0);g.lineTo(32,64);}else if(type==='roadCross'){g.moveTo(32,0);g.lineTo(32,64);g.moveTo(0,32);g.lineTo(64,32);}else{g.moveTo(0,32);g.lineTo(64,32);}g.stroke();g.setLineDash([]);
  g.globalAlpha=.18;g.strokeStyle='#f0d9a8';g.lineWidth=2;if(type==='roadV'){g.beginPath();g.moveTo(8,0);g.lineTo(8,64);g.moveTo(56,0);g.lineTo(56,64);g.stroke();}else{g.beginPath();g.moveTo(0,8);g.lineTo(64,8);g.moveTo(0,56);g.lineTo(64,56);g.stroke();}g.globalAlpha=1;
 }
 if(type==='sand'||type==='road'||type==='roadH'||type==='roadV'||type==='roadCross'){g.globalAlpha=.23;for(let i=0;i<10;i++){const sx=rnd()*64,sy=rnd()*64;g.fillStyle=i%2?'#8b7755':'#f1d69a';g.beginPath();g.ellipse(sx,sy,1+rnd()*2,.7+rnd()*.7,rnd(),0,Math.PI*2);g.fill();}g.globalAlpha=1;}
 if(type==='water'){
  g.strokeStyle='#a6dfe1';g.globalAlpha=.54;g.lineWidth=1.3;for(let y=9+(variant%3)*3;y<64;y+=17){g.beginPath();g.moveTo(4,y);g.quadraticCurveTo(15,y-4,27,y);g.quadraticCurveTo(39,y+4,59,y-1);g.stroke();}g.globalAlpha=1;
 }
 if(type==='snow'){g.fillStyle='#f1f5ec';g.globalAlpha=.65;for(let i=0;i<5;i++){g.beginPath();g.arc(rnd()*64,rnd()*64,1+rnd()*2,0,Math.PI*2);g.fill();}g.globalAlpha=1;}
 if(type==='lava'){g.strokeStyle='#f4ac63';g.globalAlpha=.6;g.lineWidth=2;g.beginPath();g.moveTo(5,16+variant*3);g.lineTo(25,13+variant*2);g.lineTo(39,24+variant);g.lineTo(59,20);g.stroke();g.globalAlpha=1;}
 // Soft tile edge tint hides seams on mobile screens without heavy blending.
 g.strokeStyle='rgba(28,45,34,.055)';g.lineWidth=1;g.strokeRect(.5,.5,63,63);
 tileCache.set(key,c);return c;
}
function propAt(tx,ty){
 const r=regionAt(tx,ty);if(r==='town')return townBuildingAt(tx,ty);
 const t=tileType(tx,ty);if(t==='water'||t.startsWith('road')||t==='sand')return null;
 const h=hash(tx,ty,42);
 if(h>.91)return {type:'tree',variation:Math.floor(h*17)%6};
 if(h>.865)return {type:'rock',variation:Math.floor(h*12)%3};
 if(h>.815)return {type:'bush',variation:Math.floor(h*9)%4};
 if(h>.795&&r==='meadow')return {type:'flower',variation:Math.floor(h*19)%4};
 if((r==='shadow'||r==='volcano'||r==='dragon')&&h>.72)return {type:'crystal',variation:Math.floor(h*10)%4};
 return null;
}
function townBuildingAt(tx,ty){const buildings={ '-4,-3':{name:'Tamer Guild',kind:'guild',colour:'#879d80'},'3,-3':{name:'General Shop',kind:'shop',colour:'#b57b58'},'-4,3':{name:'Beast Clinic',kind:'clinic',colour:'#7eaaa3'},'3,3':{name:'Quest Hall',kind:'quest',colour:'#d3b86e'},'0,-5':{name:'Town Gate',kind:'gate',colour:'#bba574'}};return buildings[`${tx},${ty}`]?{type:'building',...buildings[`${tx},${ty}`]}:null;}
function isBlocked(x,y){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);const t=tileType(tx,ty);const r=regionAt(tx,ty);if(t==='water')return true;const info=REGION_DATA[r]||REGION_DATA.meadow;if(info.unlock>state.worldLevel)return true;const prop=propAt(tx,ty);if(prop&&(prop.type==='tree'||prop.type==='rock'||prop.type==='building'))return true;return false;}
function updateRegion(){const tx=Math.floor(player.x/TILE),ty=Math.floor(player.y/TILE);const r=regionAt(tx,ty);if(r!==currentRegion){currentRegion=r;const info=REGION_DATA[r]||REGION_DATA.meadow;$('areaLabel').textContent=info.label;if(!state.discoveredRegions.includes(r)){state.discoveredRegions.push(r);toast(`🗺️ Discovered ${info.name}!`);state.player.xp+=12;}if(info.unlock>state.worldLevel)toast(`🔒 ${info.name} unlocks at World Level ${info.unlock}.`);}}
function regionNameAt(x,y){const r=regionAt(Math.floor(x/TILE),Math.floor(y/TILE));return (REGION_DATA[r]||REGION_DATA.meadow).name;}

function spawnPlayer(){player={x:0,y:0,vx:0,vy:0,facing:'down',walk:0,anim:0,attackTimer:0,hitTimer:0,dash:0,lastX:0,lastY:0};currentRegion='town';followers.clear();updateRegion();}
function randomWilds(){
 wilds=[];const ids=Object.keys(SPECIES).filter(id=>!SPECIES[id].legendary);let seed=9021;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<110;i++){
  let x,y;if(i<45){x=(rand()-.5)*1500;y=(rand()-.5)*1300;}else{x=(rand()-.5)*6500;y=(rand()-.5)*6500;}
  const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE),r=regionAt(tx,ty),unlock=(REGION_DATA[r]||REGION_DATA.meadow).unlock;
  const viable=ids.filter(id=>{const sp=SPECIES[id];if(unlock===1)return ['E','D','C'].includes(sp.rank);if(unlock===2)return sp.rank!=='SS'&&sp.rank!=='E';if(unlock===3)return ['B','A','C'].includes(sp.rank);return true;});
  const id=viable[Math.floor(rand()*viable.length)]||'SparkMouse';
  wilds.push({uid:'w'+i,id,x,y,homeX:x,homeY:y,hp:SPECIES[id].hp,maxHp:SPECIES[id].hp,level:Math.max(1,unlock+Math.floor(rand()*2)),alive:true,phase:rand()*6,aggro:false,wanderAngle:rand()*Math.PI*2,wanderTimer:.5+rand()*2,attackTimer:0,hitTimer:0});
 }
 ensureLegendaries();
}
function ensureLegendaries(){if(state.worldLevel<5)return;const ids=['Fenrir','Leviathan','Phoenix','Behemoth','WorldSerpent'];for(let i=0;i<ids.length;i++){const id=ids[i];if(wilds.some(w=>w.id===id))continue;const x=(35+i*2)*TILE+(i%2?18:-12),y=(24+i%3*2)*TILE+12;wilds.push({uid:'legend_'+id,id,x,y,homeX:x,homeY:y,hp:SPECIES[id].hp,maxHp:SPECIES[id].hp,level:5+i,alive:true,phase:i*1.4,aggro:false,wanderAngle:i*.8,wanderTimer:1,attackTimer:0,hitTimer:0,legendary:true});}}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function nearestWild(maxDist=130){let best=null,d0=maxDist;for(const w of wilds){if(!w.alive)continue;const d=dist(w,player);if(d<d0){d0=d;best=w;}}return best;}
function nearestNpc(){return Npcs.reduce((best,n)=>dist(n,player)<dist(best||{x:1e9,y:1e9},player)?n:best,null);}
const Npcs=[{id:'Mira',x:-80,y:20,role:'guild',icon:'🧙',line:'The guild hall welcomes every tamer.'},{id:'Toma',x:60,y:-55,role:'shop',icon:'🧑‍🌾',line:'Orbs and potions are available in my shop.'},{id:'Elder Ren',x:80,y:65,role:'quest',icon:'🧓',line:'Explore and bring the region back to life.'}];

function roundRect(g,x,y,w,h,r,fill,stroke){g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.stroke();}}
function drawTree(g,x,y,variation=0){
 const greens=['#3b754a','#477f4d','#3f7047','#568653','#3c7650','#4c8055'];const leaf=greens[variation%greens.length];
 // Ground roots and a layered trunk anchor the canopy to the tile.
 g.fillStyle='rgba(16,31,22,.27)';g.beginPath();g.ellipse(x+4,y+20,24,8,0,0,Math.PI*2);g.fill();
 g.fillStyle='#503c2d';g.beginPath();g.moveTo(x-5,y+20);g.lineTo(x-6,y+3);g.lineTo(x-9,y-1);g.lineTo(x-5,y-4);g.lineTo(x+5,y-4);g.lineTo(x+8,y+1);g.lineTo(x+5,y+20);g.closePath();g.fill();
 g.fillStyle='#876144';g.beginPath();g.moveTo(x-2,y+18);g.lineTo(x-2,y-2);g.lineTo(x+2,y-5);g.lineTo(x+3,y+18);g.closePath();g.fill();
 g.strokeStyle='rgba(36,69,43,.6)';g.lineWidth=2;g.beginPath();g.moveTo(x-5,y+9);g.lineTo(x-10,y+13);g.moveTo(x+4,y+12);g.lineTo(x+10,y+15);g.stroke();
 // Three offset foliage masses, with outlines and leaf clusters for better depth.
 g.fillStyle='#274f39';g.beginPath();g.ellipse(x,y-8,25,26,0,0,Math.PI*2);g.fill();
 g.fillStyle=leaf;g.beginPath();g.ellipse(x-7,y-14,17,19,-.28,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(x+9,y-7,16,17,.25,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(x,y-23,14,13,0,0,Math.PI*2);g.fill();
 g.strokeStyle='rgba(29,77,48,.55)';g.lineWidth=1.2;g.beginPath();g.ellipse(x-7,y-14,17,19,-.28,0,Math.PI*2);g.ellipse(x+9,y-7,16,17,.25,0,Math.PI*2);g.stroke();
 g.fillStyle='rgba(213,238,164,.30)';g.beginPath();g.ellipse(x-10,y-20,8,7,-.4,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(x+3,y-25,5,5,.2,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(x+12,y-11,4,5,.3,0,Math.PI*2);g.fill();
 for(let i=0;i<4;i++){const lx=x-12+(i*9+variation*3)%23,ly=y-17+(i%3)*7;g.fillStyle=i%2?'rgba(28,83,47,.38)':'rgba(235,221,145,.58)';g.beginPath();g.ellipse(lx,ly,2.5,1.4,-.5,0,Math.PI*2);g.fill();}
 if(variation%3===0){g.fillStyle='#cf7b78';g.beginPath();g.arc(x+9,y-4,2.1,0,Math.PI*2);g.arc(x-10,y-8,1.8,0,Math.PI*2);g.fill();}
}
function drawRock(g,x,y,variation=0){g.fillStyle='rgba(19,35,37,.2)';g.beginPath();g.ellipse(x+2,y+10,17,6,0,0,Math.PI*2);g.fill();g.fillStyle=variation===1?'#667d7e':'#607b78';g.beginPath();g.moveTo(x-15,y+8);g.lineTo(x-12,y-6);g.lineTo(x-2,y-15);g.lineTo(x+9,y-12);g.lineTo(x+16,y-1);g.lineTo(x+13,y+9);g.closePath();g.fill();g.fillStyle='#a4bdb0';g.beginPath();g.moveTo(x-9,y-5);g.lineTo(x-2,y-13);g.lineTo(x+2,y-4);g.lineTo(x-4,y+1);g.closePath();g.fill();g.fillStyle='rgba(31,60,64,.28)';g.beginPath();g.moveTo(x+4,y+4);g.lineTo(x+10,y-4);g.lineTo(x+12,y+7);g.closePath();g.fill();}
function drawBush(g,x,y,variation=0){const col=['#4f8e56','#588e4f','#6a9a56','#467d4e'][variation%4];g.fillStyle='rgba(19,35,23,.16)';g.beginPath();g.ellipse(x,y+8,14,5,0,0,Math.PI*2);g.fill();g.fillStyle='#396a43';g.beginPath();g.arc(x-7,y,8,0,Math.PI*2);g.arc(x+2,y-4,10,0,Math.PI*2);g.arc(x+9,y+1,7,0,Math.PI*2);g.fill();g.fillStyle=col;g.beginPath();g.arc(x-8,y-2,6,0,Math.PI*2);g.arc(x+1,y-5,7,0,Math.PI*2);g.arc(x+8,y,5,0,Math.PI*2);g.fill();if(variation%2===0){g.fillStyle='#d56d75';g.beginPath();g.arc(x+2,y-7,2,0,Math.PI*2);g.fill();}}
function drawBuilding(g,tx,ty,p){
 const x=tx*TILE+2,y=ty*TILE+2,w=TILE-4,h=TILE-4;
 // foundation and front wall
 g.fillStyle='rgba(21,34,30,.28)';g.beginPath();g.ellipse(x+w/2+3,y+h+2,w*.55,7,0,0,Math.PI*2);g.fill();
 g.fillStyle='#5c4b3e';g.fillRect(x+4,y+10,w-4,h-5);g.fillStyle=p.colour||'#b79a69';g.fillRect(x+2,y+6,w-5,h-12);
 g.fillStyle='#e3c69a';g.fillRect(x+5,y+8,w-11,3);g.fillStyle='#76553f';g.fillRect(x+7,y+13,5,h-24);g.fillRect(x+w-13,y+13,4,h-24);
 // roof with two tones and visible edge trim
 g.fillStyle='#5a3a33';g.beginPath();g.moveTo(x-5,y+13);g.lineTo(x+w/2,y-17);g.lineTo(x+w+5,y+13);g.lineTo(x+w,y+16);g.lineTo(x+w/2,y-8);g.lineTo(x,y+16);g.closePath();g.fill();
 g.fillStyle=p.kind==='clinic'?'#6c9e9e':p.kind==='shop'?'#b65f48':p.kind==='quest'?'#c8a54f':p.kind==='guild'?'#617f6a':'#9a865d';g.beginPath();g.moveTo(x-3,y+10);g.lineTo(x+w/2,y-15);g.lineTo(x+w+3,y+10);g.lineTo(x+w/2,y+1);g.closePath();g.fill();
 g.strokeStyle='rgba(255,230,183,.28)';g.lineWidth=1;g.beginPath();g.moveTo(x+w/2,y-13);g.lineTo(x+w/2,y+1);g.stroke();
 // lantern windows and timber doorway
 g.fillStyle='#3c554f';g.fillRect(x+10,y+18,10,12);g.fillRect(x+w-20,y+18,10,12);g.fillStyle='#f6d991';g.fillRect(x+12,y+20,6,8);g.fillRect(x+w-18,y+20,6,8);g.fillStyle='#76513c';g.fillRect(x+w/2-7,y+h-23,14,18);g.fillStyle='#3f4034';g.fillRect(x+w/2-4,y+h-19,8,14);g.fillStyle='#e7c984';g.beginPath();g.arc(x+w/2+3,y+h-14,1.2,0,Math.PI*2);g.fill();
 // shop/guild sign
 g.fillStyle='#5c4837';g.fillRect(x+w-8,y+29,3,14);g.fillStyle='#e1c783';g.fillRect(x+w-16,y+29,18,10);g.fillStyle='#40382d';g.font='bold 6px system-ui';g.textAlign='center';g.fillText(p.kind==='shop'?'SHOP':p.kind==='guild'?'GUILD':p.kind==='clinic'?'HEAL':'QUEST',x+w-7,y+36);
}
function drawProp(g,tx,ty,p){const x=tx*TILE+TILE/2,y=ty*TILE+TILE/2;if(p.type==='building')return drawBuilding(g,tx,ty,p);if(p.type==='tree')return drawTree(g,x,y,p.variation);if(p.type==='rock')return drawRock(g,x,y,p.variation);if(p.type==='bush')return drawBush(g,x,y,p.variation);if(p.type==='flower'){g.fillStyle='#477748';g.beginPath();g.moveTo(x,y+5);g.lineTo(x-1,y-3);g.strokeStyle='#477748';g.lineWidth=2;g.stroke();g.fillStyle=['#f0d57f','#dca4bf','#e5e5bd','#9cc8dc'][p.variation%4];g.beginPath();g.arc(x,y-3,3,0,Math.PI*2);g.fill();g.fillStyle='#f4edbd';g.beginPath();g.arc(x,y-3,1,0,Math.PI*2);g.fill();return;}if(p.type==='crystal'){g.fillStyle='rgba(29,37,63,.25)';g.beginPath();g.ellipse(x,y+10,12,4,0,0,Math.PI*2);g.fill();g.fillStyle=p.variation%2?'#7dd4dc':'#a78ded';g.beginPath();g.moveTo(x,y-23);g.lineTo(x+8,y-6);g.lineTo(x+5,y+9);g.lineTo(x-5,y+9);g.lineTo(x-9,y-5);g.closePath();g.fill();g.fillStyle='rgba(237,245,255,.62)';g.beginPath();g.moveTo(x,y-18);g.lineTo(x+2,y-4);g.lineTo(x-3,y+4);g.lineTo(x-4,y-5);g.closePath();g.fill();}}
function drawGround(){const left=Math.floor((camera.x-viewW/2)/TILE)-1,right=Math.floor((camera.x+viewW/2)/TILE)+1,top=Math.floor((camera.y-viewH/2)/TILE)-1,bottom=Math.floor((camera.y+viewH/2)/TILE)+1;for(let ty=top;ty<=bottom;ty++){for(let tx=left;tx<=right;tx++){const t=tileType(tx,ty);ctx.drawImage(tileCanvas(t,Math.floor(hash(tx,ty,3)*6)),tx*TILE,ty*TILE,TILE+1,TILE+1);}}}
function drawCharacter(x,y,kind='player',obj={}){
 const g=ctx,scale=obj.scale||1,facing=obj.facing||'down';g.save();g.translate(Math.round(x),Math.round(y));g.scale(scale,scale);
 const tick=worldTime*9+(obj.phase||0),moving=!!(obj.moving||obj.walking),stride=moving?Math.sin(tick)*3.2:Math.sin(tick*.38)*.55,bob=moving?Math.abs(Math.sin(tick))*.9:Math.sin(tick*.45)*.45;
 // A small soft ground shadow anchors the sprite to the world.
 g.fillStyle='rgba(18,30,25,.28)';g.beginPath();g.ellipse(0,5,13,5,0,0,Math.PI*2);g.fill();g.translate(0,bob);
 if(kind==='player'||kind==='remote'){
  const c=CLASS_DATA[obj.classId]||CLASS_DATA.beastTamer,stage=obj.classStage||0,coat=c.colour,attacking=(obj.attackTimer||0)>0,attack=Math.min(1,(obj.attackTimer||0)/.32);
  // Back cape, visible silhouette, stitched hem.
  g.fillStyle=obj.classId==='necromancer'?'#302746':obj.classId==='ranger'?'#5a4737':'#354454';g.beginPath();g.moveTo(-8,-20);g.lineTo(9,-20);g.lineTo(12,-3);g.lineTo(4,-1);g.lineTo(-9,-3);g.closePath();g.fill();
  if(stage>=2){g.fillStyle='#d5b66e';g.beginPath();g.moveTo(-10,-18);g.lineTo(-13,-5);g.lineTo(-7,-2);g.closePath();g.fill();g.beginPath();g.moveTo(10,-18);g.lineTo(13,-5);g.lineTo(7,-2);g.closePath();g.fill();}
  // Legs and boots animate out of phase for a real walking cycle.
  g.fillStyle='#24313b';roundRect(g,-7,-9+stride,5,12,2,'#24313b','#17242b');roundRect(g,2,-9-stride,5,12,2,'#24313b','#17242b');
  g.fillStyle='#5b4435';roundRect(g,-8,1+stride,7,4,2,'#5b4435');roundRect(g,1,1-stride,7,4,2,'#5b4435');g.fillStyle='#8a7457';g.fillRect(-7,1+stride,5,1);g.fillRect(2,1-stride,5,1);
  // Torso, belt, cloth panels and shoulder guards.
  roundRect(g,-10,-22,20,19,5,coat,'#263b43');g.fillStyle='rgba(255,255,255,.16)';g.beginPath();g.moveTo(-7,-19);g.lineTo(-2,-20);g.lineTo(-3,-5);g.lineTo(-7,-5);g.closePath();g.fill();
  g.fillStyle=stage>=1?'#e6ce92':'#2d4351';g.fillRect(-10,-15,20,3);g.fillStyle='#d6bd82';g.fillRect(-2,-16,4,5);g.fillStyle='#263640';g.fillRect(-12,-21,6,7);g.fillRect(6,-21,6,7);g.fillStyle=stage>=2?'#ead69e':'#7c9aa1';g.fillRect(-11,-21,5,3);g.fillRect(6,-21,5,3);
  // Animated arms and the class weapon.
  const armSwing=attacking?Math.sin((1-attack)*Math.PI)*8:(moving?stride*.65:0);
  g.save();g.translate(-9,-17);g.rotate(-.18-armSwing*.025);roundRect(g,-2,0,5,12,2,'#c18b68','#704f43');g.fillStyle=coat;roundRect(g,-3,-2,7,6,2,coat);g.restore();
  g.save();g.translate(9,-17);g.rotate((facing==='left'?-0.45:facing==='right'?.35:0.1)+(attacking?-Math.sin((1-attack)*Math.PI)*.9:armSwing*.02));roundRect(g,-1,0,5,12,2,'#c18b68','#704f43');g.fillStyle=coat;roundRect(g,-3,-2,7,6,2,coat);g.restore();
  // Head and class-specific hair/hood.
  g.fillStyle='#e4b28d';g.beginPath();g.ellipse(0,-27,8,8.5,0,0,Math.PI*2);g.fill();g.strokeStyle='#8c5949';g.lineWidth=1;g.stroke();
  const hair=obj.classId==='necromancer'?'#282238':obj.classId==='mage'?'#3d3762':obj.classId==='assassin'?'#1e2935':obj.classId==='ranger'?'#61432e':stage>=2?'#ceb46e':'#49332d';
  g.fillStyle=hair;g.beginPath();g.moveTo(-8,-28);g.quadraticCurveTo(-9,-36,-2,-36);g.quadraticCurveTo(6,-38,8,-30);g.lineTo(6,-24);g.lineTo(3,-28);g.lineTo(-2,-25);g.lineTo(-7,-25);g.closePath();g.fill();
  if(facing==='up'){g.fillStyle=hair;g.beginPath();g.ellipse(0,-27,8,8,0,0,Math.PI*2);g.fill();g.fillStyle=coat;g.beginPath();g.moveTo(-9,-22);g.lineTo(0,-17);g.lineTo(9,-22);g.closePath();g.fill();}
  else {g.fillStyle='#293844';if(facing==='left'){g.fillRect(-5,-27,2,2);g.fillRect(-1,-27,2,2);}else if(facing==='right'){g.fillRect(1,-27,2,2);g.fillRect(5,-27,2,2);}else{g.fillRect(-4,-27,2,2);g.fillRect(3,-27,2,2);}g.fillStyle='#9b5c53';g.fillRect(-2,-22,4,1);}
  // Distinctive class equipment makes the player read as an adventurer, not a block.
  if(obj.classId==='mage'||obj.classId==='necromancer'||obj.classId==='alchemist'){
   g.strokeStyle='#6c5847';g.lineWidth=2.5;g.beginPath();g.moveTo(13,-5);g.lineTo(13,-31);g.stroke();g.strokeStyle='#d6c08b';g.lineWidth=1;g.beginPath();g.moveTo(10,-11);g.lineTo(16,-11);g.stroke();g.fillStyle=obj.classId==='necromancer'?'#bd91ff':obj.classId==='mage'?'#8ce8f2':'#8cddc9';g.beginPath();g.arc(13,-33,4+Math.sin(tick)*.35,0,Math.PI*2);g.fill();g.fillStyle='#fff5ce';g.beginPath();g.arc(12,-34,1.3,0,Math.PI*2);g.fill();
  }else if(obj.classId==='ranger'||obj.classId==='beastTamer'){
   g.strokeStyle='#bb9862';g.lineWidth=2;g.beginPath();g.arc(13,-18,7,-1.15,1.15);g.stroke();g.strokeStyle='#dec995';g.lineWidth=1;g.beginPath();g.moveTo(16,-24);g.lineTo(16,-12);g.stroke();
  }else{
   g.save();g.translate(13,-16);g.rotate(attacking?-Math.sin((1-attack)*Math.PI)*1.2:(facing==='left'?-1.05:facing==='up'?.4:.12));g.fillStyle='#c9d7dc';g.beginPath();g.moveTo(-1,-3);g.lineTo(2,-19);g.lineTo(5,-19);g.lineTo(3,1);g.closePath();g.fill();g.fillStyle='#e8d6a2';g.fillRect(-2,-7,8,3);g.fillStyle='#71513d';g.fillRect(0,-4,3,7);g.restore();
  }
  if(stage>=3){g.strokeStyle='#ebd18c';g.lineWidth=1.5;g.beginPath();g.arc(0,-20,17+Math.sin(tick)*1.1,Math.PI,Math.PI*2);g.stroke();g.fillStyle='#fff1b0';g.beginPath();g.arc(0,-38,2,0,Math.PI*2);g.fill();}
 }
 else if(kind==='npc'){
  const coat=obj.colour||'#a1a78c';g.fillStyle='#293b39';roundRect(g,-7,-10,14,15,4,'#293b39');g.fillStyle=coat;roundRect(g,-8,-21,16,14,4,coat,'#3c5046');g.fillStyle='#d9a984';g.beginPath();g.ellipse(0,-27,7,7,0,0,Math.PI*2);g.fill();g.fillStyle=obj.role==='guild'?'#d9dce7':'#554738';g.beginPath();g.arc(0,-29,7,Math.PI,Math.PI*2);g.fill();g.fillRect(-7,-29,3,5);g.fillRect(4,-29,3,5);g.fillStyle='#2b3a43';g.fillRect(-3,-27,2,2);g.fillRect(2,-27,2,2);g.fillStyle='#d6c28a';g.fillRect(-4,-9,8,2);
 }
 else if(kind==='beast'){if(Number.isFinite(obj.rotation))g.rotate(obj.rotation);drawBeastShape(g,obj,tick);}
 g.restore();
}
function drawBeastShape(g,b,tick){
 const sp=beastData(b.id),col=b.shadow?'#554b79':sp.colour,stage=b.formStage||0,shape=sp.shape||'wolf',moving=!!b.walking||!!b.moving,step=moving?Math.sin(tick*1.7)*3.2:Math.sin(tick*.45)*.55;
 const hurt=(b.hitTimer||0)>0,attack=(b.attackTimer||0)>0;
 g.translate(0,moving?Math.abs(Math.sin(tick*1.7))*1.7:Math.sin(tick*.8)*.8);
 g.fillStyle='rgba(10,20,20,.25)';g.beginPath();g.ellipse(0,5,17+stage*2,5,0,0,Math.PI*2);g.fill();
 if(b.shadow){g.strokeStyle='rgba(183,164,255,.62)';g.lineWidth=1.5;g.beginPath();g.ellipse(0,-12,20+stage*2,17+stage*2,0,0,Math.PI*2);g.stroke();}
 // The bodies have anatomy, markings, feet and tails rather than single colored blobs.
 if(shape==='fish'||shape==='serpent'){
  g.fillStyle='#244b58';g.beginPath();g.moveTo(12,-15);g.lineTo(28,-24+Math.sin(tick)*3);g.lineTo(27,-7);g.closePath();g.fill();
  g.fillStyle=col;g.beginPath();g.ellipse(0,-15,18+stage,10,.08,0,Math.PI*2);g.fill();g.strokeStyle='rgba(238,250,226,.3)';g.lineWidth=1;g.beginPath();g.moveTo(-8,-19);g.quadraticCurveTo(-2,-13,5,-10);g.stroke();
  g.fillStyle='#f8e9b0';g.beginPath();g.arc(8,-18,3,0,Math.PI*2);g.fill();g.fillStyle='#273845';g.beginPath();g.arc(9,-18,1.3,0,Math.PI*2);g.fill();
 }else if(shape==='bird'||shape==='bat'||shape==='dragon'||shape==='phoenix'){
  const wing=Math.sin(tick*1.8)*(moving||attack?9:3);
  g.fillStyle=col;g.beginPath();g.moveTo(-3,-19);g.quadraticCurveTo(-17,-31-wing,-28,-24-wing);g.lineTo(-19,-12);g.lineTo(-7,-15);g.closePath();g.fill();g.beginPath();g.moveTo(3,-19);g.quadraticCurveTo(17,-31-wing,28,-24-wing);g.lineTo(19,-12);g.lineTo(7,-15);g.closePath();g.fill();
  g.strokeStyle='rgba(245,237,208,.42)';g.lineWidth=1;g.beginPath();g.moveTo(-7,-18);g.lineTo(-23,-24-wing);g.moveTo(7,-18);g.lineTo(23,-24-wing);g.stroke();
  g.fillStyle=col;g.beginPath();g.ellipse(0,-15,11,13,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(6,-24,8,7,.3,0,Math.PI*2);g.fill();
  g.fillStyle='#e1cfa0';g.beginPath();g.moveTo(11,-24);g.lineTo(18,-22);g.lineTo(11,-20);g.closePath();g.fill();
  if(shape==='dragon'){g.fillStyle=col;g.beginPath();g.moveTo(-4,-28);g.lineTo(-9,-36-stage);g.lineTo(0,-30);g.lineTo(4,-37-stage);g.lineTo(5,-27);g.closePath();g.fill();g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.moveTo(-8,-12);g.quadraticCurveTo(-19,-5,-24,-12+Math.sin(tick)*2);g.stroke();}
  g.fillStyle='#fff0a9';g.beginPath();g.arc(8,-26,2,0,Math.PI*2);g.fill();g.fillStyle='#26343e';g.beginPath();g.arc(8.5,-26,1,0,Math.PI*2);g.fill();
 }else if(shape==='wraith'||shape==='knight'){
  g.fillStyle=col;g.beginPath();g.moveTo(-12,-31);g.quadraticCurveTo(0,-38,12,-31);g.lineTo(15,-8);g.lineTo(8,-3);g.lineTo(2,-10+step);g.lineTo(-3,-3);g.lineTo(-9,-9-step);g.lineTo(-16,-5);g.closePath();g.fill();
  if(shape==='knight'){g.fillStyle='#d0d5cf';g.beginPath();g.moveTo(-10,-29);g.lineTo(0,-37);g.lineTo(10,-29);g.lineTo(9,-22);g.lineTo(-9,-22);g.closePath();g.fill();g.fillStyle='#343b49';g.fillRect(-7,-27,14,3);g.fillStyle='#e8a4c6';g.fillRect(-5,-26,3,1);g.fillRect(3,-26,3,1);}else{g.fillStyle='#dbffff';g.beginPath();g.arc(-4,-27,2,0,Math.PI*2);g.arc(4,-27,2,0,Math.PI*2);g.fill();}
 }else if(shape==='golem'||shape==='behemoth'){
  for(const side of [-1,1]){g.fillStyle='#34474a';roundRect(g,side*9-5,-12+step,8,14,3,'#34474a');}
  roundRect(g,-16,-27,32,25,7,col,'#34494b');roundRect(g,-18,-21,9,16,3,col,'#34494b');roundRect(g,9,-21,9,16,3,col,'#34494b');
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(-10,-24);g.lineTo(-3,-29);g.lineTo(0,-20);g.closePath();g.fill();g.fillStyle='#ffeb9b';g.fillRect(-8,-21,4,3);g.fillRect(4,-21,4,3);g.fillStyle='#26333b';g.fillRect(-5,-14,10,3);
 }else{
  // Four-legged mammals: rear legs, tail, torso, shoulders and head.
  const tailMove=Math.sin(tick*1.6)*(moving?7:3);
  g.strokeStyle=col;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-12,-16);g.quadraticCurveTo(-23,-20+tailMove,-21,-11+tailMove);g.stroke();g.lineCap='butt';
  for(const side of [-1,1]){g.fillStyle='#33464b';roundRect(g,side*9-4,-12+(side===-1?step:-step),7,14,3,'#33464b');g.fillStyle=col;roundRect(g,side*9-4,-13+(side===-1?step:-step),7,9,3,col);g.fillStyle='#e1c99a';g.fillRect(side*9-3,-2+(side===-1?step:-step),5,2);}
  g.fillStyle=col;g.beginPath();g.ellipse(-1,-17,18,10,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(7,-22,11,9,.25,0,Math.PI*2);g.fill();
  // Back marking and flank shading add depth, while color stays element-coded.
  g.fillStyle=b.shadow?'rgba(205,188,255,.42)':'rgba(255,244,210,.35)';g.beginPath();g.ellipse(-3,-21,8,3,-.2,0,Math.PI*2);g.fill();
  g.fillStyle=col;g.beginPath();g.moveTo(1,-28);g.lineTo(-2,-39+stage);g.lineTo(5,-31);g.closePath();g.fill();g.beginPath();g.moveTo(9,-29);g.lineTo(14,-37+stage);g.lineTo(15,-27);g.closePath();g.fill();
  if(shape==='stag'){g.strokeStyle='#d2d8bb';g.lineWidth=2;g.beginPath();g.moveTo(4,-31);g.lineTo(0,-38);g.lineTo(-4,-41);g.moveTo(1,-36);g.lineTo(5,-41);g.moveTo(12,-31);g.lineTo(16,-38);g.lineTo(21,-41);g.moveTo(17,-36);g.lineTo(13,-41);g.stroke();}
  if(shape==='fox'||shape==='panther'||shape==='wolf'||shape==='mouse'){g.fillStyle=shape==='fox'?'#f2b77a':shape==='panther'?'#d6d3bf':'#e2d8b5';g.beginPath();g.ellipse(10,-21,6,5,.2,0,Math.PI*2);g.fill();}
  g.fillStyle=sp.element==='Fire'?'#fff0b4':sp.element==='Shadow'||sp.element==='Necromancy'?'#d6c4ff':sp.element==='Lightning'?'#fff4a1':'#f5f2d4';g.beginPath();g.ellipse(6,-25,2.2,2.6,0,0,Math.PI*2);g.ellipse(13,-25,2.2,2.6,0,0,Math.PI*2);g.fill();g.fillStyle='#263540';g.beginPath();g.arc(6.5,-25,1,0,Math.PI*2);g.arc(13.5,-25,1,0,Math.PI*2);g.fill();g.fillStyle='#273741';g.beginPath();g.ellipse(10,-18,4,2,0,0,Math.PI*2);g.fill();
 }
 // Elemental details plus evolving/shadow aura.
 if(sp.element==='Fire'){g.fillStyle='rgba(255,198,103,.8)';g.beginPath();g.arc(-12,-25,2+Math.sin(tick)*.7,0,Math.PI*2);g.fill();}
 if(sp.element==='Lightning'){g.strokeStyle='#fff0a2';g.lineWidth=1.5;g.beginPath();g.moveTo(-15,-22);g.lineTo(-19,-17);g.lineTo(-14,-17);g.lineTo(-18,-12);g.stroke();}
 if(stage>0){g.strokeStyle=b.shadow?'#bcaaff':'rgba(245,220,145,.8)';g.lineWidth=1.4;g.beginPath();g.arc(0,-18,21+stage*2,Math.PI*1.08,Math.PI*1.92);g.stroke();}
 if(b.shadow){g.fillStyle='#c4b7ff';g.beginPath();g.arc(0,-39-stage,2.2,0,Math.PI*2);g.fill();}
 if(hurt){g.fillStyle=`rgba(255,255,255,${Math.min(.55,(b.hitTimer||0)*1.6)})`;g.beginPath();g.ellipse(0,-19,19,17,0,0,Math.PI*2);g.fill();}
 if(attack){g.strokeStyle=sp.colour;g.lineWidth=2;g.beginPath();g.arc(0,-17,21,Math.PI*1.18,Math.PI*1.82);g.stroke();}
}
function elementColor(el){return ({Fire:'#ff794e',Water:'#69d8f2',Nature:'#8de174',Lightning:'#fff06c',Earth:'#c7a27c',Wind:'#baf2df',Shadow:'#a996ff',Necromancy:'#c4a4ff',Dragon:'#ffad82',Legendary:'#fff0a8'})[el]||'#f4e0a0';}
function spawnEffect(kind,fromX,fromY,x,y,color,life=.38,angle=0,text=''){if(combatEffects.length>70)combatEffects.splice(0,combatEffects.length-70);combatEffects.push({kind,fromX,fromY,x,y,color,life,maxLife:life,angle,seed:Math.random()*6.28,text});}
function drawCombatEffects(){
 for(const e of combatEffects){const t=1-e.life/e.maxLife,alpha=Math.max(0,e.life/e.maxLife);ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=e.color;ctx.fillStyle=e.color;ctx.lineCap='round';
  if(e.kind==='damage'){ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,25,32,.8)';ctx.strokeText(e.text,e.x,e.y-t*25);ctx.fillStyle=e.color;ctx.fillText(e.text,e.x,e.y-t*25);
  }else if(e.kind==='bolt'){const px=e.fromX+(e.x-e.fromX)*Math.min(1,t*1.35),py=e.fromY+(e.y-e.fromY)*Math.min(1,t*1.35);ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(e.fromX,e.fromY);ctx.lineTo(px,py);ctx.stroke();ctx.strokeStyle='#fff5d2';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(e.fromX,e.fromY);ctx.lineTo(px,py);ctx.stroke();ctx.fillStyle='#fff3c9';ctx.beginPath();ctx.arc(px,py,3.5+Math.sin(t*14)*1,0,Math.PI*2);ctx.fill();
  }else if(e.kind==='slash'){ctx.translate(e.x,e.y);ctx.rotate(e.angle+t*.55);ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,10+t*17,-1.9,1.1);ctx.stroke();ctx.strokeStyle='#fff5d1';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,11+t*17,-1.7,.65);ctx.stroke();
  }else if(e.kind==='burst'){ctx.translate(e.x,e.y);for(let i=0;i<8;i++){const a=i*Math.PI/4+e.seed,r1=3+t*5,r2=9+t*17;ctx.lineWidth=i%2?2:3;ctx.beginPath();ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);ctx.stroke();}ctx.fillStyle='#fff8da';ctx.beginPath();ctx.arc(0,0,2+alpha*3,0,Math.PI*2);ctx.fill();
  }else if(e.kind==='nova'){ctx.translate(e.x,e.y);const radius=8+t*42;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,Math.max(2,radius-5),0,Math.PI*2);ctx.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6+e.seed*.08,r1=radius*.68,r2=radius+7;ctx.lineWidth=i%3===0?3:1.5;ctx.beginPath();ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);ctx.stroke();}ctx.fillStyle='#fff8dc';ctx.beginPath();ctx.arc(0,0,2+alpha*5,0,Math.PI*2);ctx.fill();
  }else if(e.kind==='dash'){ctx.translate(e.x,e.y);ctx.rotate(e.angle);for(let i=0;i<4;i++){ctx.globalAlpha=alpha*(1-i*.16);ctx.lineWidth=4-i*.7;ctx.beginPath();ctx.moveTo(-28-i*5,-8+i*5);ctx.lineTo(8-i*5,-8+i*5);ctx.stroke();}}
  ctx.restore();
 }
}
function drawWorldEntities(){
 const left=camera.x-viewW/2-100,right=camera.x+viewW/2+100,top=camera.y-viewH/2-100,bottom=camera.y+viewH/2+100,things=[];
 const tx0=Math.floor(left/TILE)-1,tx1=Math.floor(right/TILE)+1,ty0=Math.floor(top/TILE)-1,ty1=Math.floor(bottom/TILE)+1;
 for(let ty=ty0;ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){const p=propAt(tx,ty);if(p)things.push({y:p.type==='building'?(ty+1)*TILE-2:ty*TILE+TILE*.72,draw:()=>drawProp(ctx,tx,ty,p)});}
 for(const w of wilds){if((!w.alive&&!(w.deathTimer>0))||w.x<left||w.x>right||w.y<top||w.y>bottom)continue;things.push({y:w.y,draw:()=>{ctx.save();if(!w.alive)ctx.globalAlpha=Math.min(1,(w.deathTimer||0)/.65);const shake=(w.hitTimer||0)>0?Math.sin(worldTime*90)*2.3:0,lung=(w.attackTimer||0)>0?Math.sin((w.attackTimer/.35)*Math.PI)*7:0,wd=Math.hypot(player.x-w.x,player.y-w.y)||1;drawCharacter(w.x+shake+(player.x-w.x)/wd*lung,w.y+(player.y-w.y)/wd*lung,'beast',{...w,phase:w.phase,scale:1+(w.level-1)*.009,walking:!!w.wandering,rotation:w.aggro?Math.atan2(player.y-w.y,player.x-w.x):(w.wanderAngle||0),attackTimer:w.attackTimer,hitTimer:w.hitTimer});if(w===selectedWild){ctx.strokeStyle='#ffe7a2';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(w.x,w.y-14,25,26,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='rgba(255,232,171,.32)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(w.x,w.y-14,28,29,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}});}
 for(const npc of Npcs){if(Math.abs(npc.x-camera.x)>viewW/2+80||Math.abs(npc.y-camera.y)>viewH/2+80)continue;things.push({y:npc.y,draw:()=>{drawCharacter(npc.x,npc.y,'npc',{colour:npc.role==='shop'?'#d1b67a':npc.role==='guild'?'#9aaee0':'#92c5a5',role:npc.role,phase:0});ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(15,28,30,.75)';ctx.strokeText(npc.id,npc.x,npc.y+19);ctx.fillStyle='#f5ebca';ctx.fillText(npc.id,npc.x,npc.y+19);}});}
 for(const [id,p] of remotePlayers){if(Math.abs(p.x-camera.x)>viewW/2+80||Math.abs(p.y-camera.y)>viewH/2+80)continue;things.push({y:p.y,draw:()=>{drawCharacter(p.x,p.y,'remote',{classId:p.classId,facing:p.facing,moving:true,classStage:0,phase:1});ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillStyle='#eef3e2';ctx.fillText(p.name||'Tamer',p.x,p.y+19);}});}
 state.team.slice(0,4).forEach((b,i)=>{let f=followers.get(b.uid);if(!f){f={x:player.x-25+i*14,y:player.y+28+i*6,moving:false};followers.set(b.uid,f);}if(f.x<left||f.x>right||f.y<top||f.y>bottom)return;things.push({y:f.y,draw:()=>{const a=(b.attackTimer||0)>0&&battle?Math.sin((b.attackTimer/.4)*Math.PI)*10:0,w=selectedWild&&battle?Math.hypot(selectedWild.x-f.x,selectedWild.y-f.y)||1:1,ax=selectedWild&&battle?(selectedWild.x-f.x)/w*a:0,ay=selectedWild&&battle?(selectedWild.y-f.y)/w*a:0;const rot=selectedWild&&battle?Math.atan2(selectedWild.y-f.y,selectedWild.x-f.x):Math.atan2(player.y-f.y,player.x-f.x);const duration=b.attackDuration||.42;const lunge=(b.attackTimer||0)>0?Math.sin(clamp(1-b.attackTimer/duration,0,1)*Math.PI)*12:0;drawCharacter(f.x+ax+(selectedWild&&battle?(selectedWild.x-f.x)/(Math.hypot(selectedWild.x-f.x,selectedWild.y-f.y)||1)*lunge:0),f.y+ay+(selectedWild&&battle?(selectedWild.y-f.y)/(Math.hypot(selectedWild.x-f.x,selectedWild.y-f.y)||1)*lunge:0),'beast',{...b,phase:i*1.9,scale:.80+(b.formStage||0)*.025,rotation:rot,walking:f.moving,attackTimer:b.attackTimer,attackDuration:duration,hitTimer:b.hitTimer});}});});
 things.push({y:player.y,draw:()=>{let px=player.x,py=player.y;const target=battle?wilds.find(w=>w.uid===battle.wildUid):null;if(target&&(player.attackTimer||0)>0){const len=Math.hypot(target.x-player.x,target.y-player.y)||1;const p=Math.sin(clamp(1-player.attackTimer/(player.attackDuration||.42),0,1)*Math.PI)*13;px+=(target.x-player.x)/len*p;py+=(target.y-player.y)/len*p;}drawCharacter(px,py,'player',{classId:state.player.classId||'beastTamer',classStage:classStage(),facing:player.facing,moving:Math.hypot(player.vx,player.vy)>12,attackTimer:player.attackTimer,attackDuration:player.attackDuration||.32,hitTimer:player.hitTimer});}});
 things.sort((a,b)=>a.y-b.y);for(const thing of things)thing.draw();drawCombatEffects();
}
function drawAtmosphere(){
 const tint={town:'#f5d8a0',meadow:'#bce6a0',forest:'#76b77b',desert:'#f4c67e',coast:'#82d7e1',volcano:'#f08a54',frost:'#b6e1ee',shadow:'#9a86d0',dragon:'#8cc8e2'}[currentRegion]||'#bce6a0';
 ctx.save();ctx.globalAlpha=graphicsMode==='low'?.035:.065;ctx.fillStyle=tint;ctx.fillRect(0,0,viewW,viewH);ctx.globalAlpha=1;
 // Warm, broad light keeps the world readable while the edge vignette adds depth.
 const glow=ctx.createRadialGradient(viewW*.28,viewH*.18,8,viewW*.28,viewH*.18,Math.max(viewW,viewH)*.78);glow.addColorStop(0,'rgba(255,239,189,.105)');glow.addColorStop(.5,'rgba(255,239,189,.025)');glow.addColorStop(1,'rgba(255,239,189,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,viewW,viewH);
 const vignette=ctx.createRadialGradient(viewW*.5,viewH*.48,Math.min(viewW,viewH)*.18,viewW*.5,viewH*.48,Math.max(viewW,viewH)*.72);vignette.addColorStop(0,'rgba(5,12,18,0)');vignette.addColorStop(.68,'rgba(5,12,18,.035)');vignette.addColorStop(1,'rgba(5,12,18,.23)');ctx.fillStyle=vignette;ctx.fillRect(0,0,viewW,viewH);
 if(graphicsMode!=='low'){
  const count=graphicsMode==='high'?28:15;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<count;i++){const hx=hash(i,1,81),hy=hash(i,2,82),speed=3+(i%4)*2;const x=(hx*viewW+worldTime*speed)%viewW,y=(hy*viewH+Math.sin(worldTime*.7+i)*9+viewH)%viewH;const alpha=.1+((Math.sin(worldTime*1.5+i)+1)*.055);ctx.globalAlpha=alpha;ctx.fillStyle=currentRegion==='frost'?'#d9f3ff':currentRegion==='shadow'?'#c2a9ff':currentRegion==='volcano'?'#ffc078':'#f8edbd';ctx.beginPath();ctx.arc(x,y,1+(i%3)*.35,0,Math.PI*2);ctx.fill();if(graphicsMode==='high'&&i%5===0){ctx.globalAlpha=alpha*.35;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}}
  ctx.restore();
 }
 ctx.restore();
}
function drawFrame(){ctx.fillStyle='#52734e';ctx.fillRect(0,0,viewW,viewH);ctx.save();ctx.imageSmoothingEnabled=true;ctx.translate(viewW/2-camera.x,viewH/2-camera.y);drawGround();drawWorldEntities();ctx.restore();drawAtmosphere();}
function resize(){viewW=innerWidth;viewH=innerHeight;dpr=Math.min(window.devicePixelRatio||1,graphicsMode==='low'?1:1.5);canvas.width=Math.max(1,Math.floor(viewW*dpr));canvas.height=Math.max(1,Math.floor(viewH*dpr));canvas.style.width=viewW+'px';canvas.style.height=viewH+'px';ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;}
function blockedDestination(x,y){const hitRadius=13;const pts=[[x-hitRadius,y],[x+hitRadius,y],[x,y-hitRadius],[x,y+hitRadius]];for(const p of pts)if(isBlocked(p[0],p[1]))return true;return false;}
function facingVector(facing){if(facing==='up')return{x:0,y:-1};if(facing==='left')return{x:-1,y:0};if(facing==='right')return{x:1,y:0};return{x:0,y:1};}
function updateFollowers(dt){
 const dir=Math.hypot(player.vx,player.vy)>18?{x:player.vx/Math.hypot(player.vx,player.vy),y:player.vy/Math.hypot(player.vx,player.vy)}:facingVector(player.facing),perp={x:-dir.y,y:dir.x};
 const liveIds=new Set(state.team.map(b=>b.uid));for(const key of followers.keys())if(!liveIds.has(key))followers.delete(key);
 state.team.slice(0,4).forEach((b,i)=>{const side=(i%2===0?1:-1)*24,back=38+Math.floor(i/2)*26,tx=player.x-dir.x*back+perp.x*side,ty=player.y-dir.y*back+perp.y*side;let f=followers.get(b.uid);if(!f){f={x:tx+Math.sin(i*2)*12,y:ty+Math.cos(i*2)*10,moving:false};followers.set(b.uid,f);}const dx=tx-f.x,dy=ty-f.y,d=Math.hypot(dx,dy);f.moving=d>9||Math.hypot(player.vx,player.vy)>22;const followRate=1-Math.exp(-(d>55?8:5.3)*dt);f.x+=dx*followRate;f.y+=dy*followRate;if(d>170){f.x=tx;f.y=ty;} });
}
function update(dt){
 worldTime+=dt;player.anim+=dt;player.attackTimer=Math.max(0,(player.attackTimer||0)-dt);player.hitTimer=Math.max(0,(player.hitTimer||0)-dt);dashCooldown=Math.max(0,dashCooldown-dt);dashTimer=Math.max(0,dashTimer-dt);skillCooldown=Math.max(0,skillCooldown-dt);activeEffectTimer=Math.max(0,activeEffectTimer-dt);hudTimer-=dt;
 let ix=movement.x,iy=movement.y,mag=movement.mag;if(dashTimer>0&&mag<.1){ix=dashX;iy=dashY;mag=1;}const len=Math.hypot(ix,iy);if(len>.001){ix/=len;iy/=len;}let baseSpeed=58+clamp(mag,0,1)*148;if(mag<.035)baseSpeed=0;if(dashTimer>0)baseSpeed*=2.35;
 const targetVX=ix*baseSpeed,targetVY=iy*baseSpeed,acc=baseSpeed>0?11:13;player.vx+=(targetVX-player.vx)*(1-Math.exp(-acc*dt));player.vy+=(targetVY-player.vy)*(1-Math.exp(-acc*dt));if(Math.abs(player.vx)<1)player.vx=0;if(Math.abs(player.vy)<1)player.vy=0;
 if(Math.abs(player.vx)>2||Math.abs(player.vy)>2){if(Math.abs(player.vx)>Math.abs(player.vy))player.facing=player.vx<0?'left':'right';else player.facing=player.vy<0?'up':'down';}
 const nx=player.x+player.vx*dt,ny=player.y+player.vy*dt;if(!blockedDestination(nx,player.y))player.x=nx;else player.vx=0;if(!blockedDestination(player.x,ny))player.y=ny;else player.vy=0;
 player.x=clamp(player.x,-6400,6400);player.y=clamp(player.y,-6400,6400);const lookX=player.vx*.10,lookY=player.vy*.10;camera.x+=((player.x+lookX)-camera.x)*(1-Math.exp(-6.8*dt));camera.y+=((player.y+lookY)-camera.y)*(1-Math.exp(-6.8*dt));updateRegion();updateFollowers(dt);
 for(const w of wilds){
  w.hitTimer=Math.max(0,(w.hitTimer||0)-dt);w.attackTimer=Math.max(0,(w.attackTimer||0)-dt);w.deathTimer=Math.max(0,(w.deathTimer||0)-dt);if(!w.alive)continue;
  const d=dist(w,player);if(d>820){w.wandering=false;continue;}if(d<110)w.aggro=true;else if(d>245)w.aggro=false;
  if(w.aggro&&d>47&&d<250){const speed=w.legendary?38:30,dx=(player.x-w.x)/(d||1),dy=(player.y-w.y)/(d||1);w.x+=dx*speed*dt;w.y+=dy*speed*dt;w.wandering=true;}
  else {w.wanderTimer=(w.wanderTimer||0)-dt;if(w.wanderTimer<=0){w.wanderTimer=1.3+Math.random()*2.8;w.wanderAngle+=(Math.random()-.5)*2.3;}const hx=(w.homeX??w.x)-w.x,hy=(w.homeY??w.y)-w.y,homeD=Math.hypot(hx,hy);if(homeD>75)w.wanderAngle=Math.atan2(hy,hx)+(Math.random()-.5)*.5;const pace=8+((Math.sin((w.phase||0)+worldTime)+1)*3);w.x+=Math.cos(w.wanderAngle||0)*pace*dt;w.y+=Math.sin(w.wanderAngle||0)*pace*dt;w.wandering=pace>5;}
 }
 for(const b of state.team){b.attackTimer=Math.max(0,(b.attackTimer||0)-dt);b.hitTimer=Math.max(0,(b.hitTimer||0)-dt);}
 for(let i=combatEffects.length-1;i>=0;i--){combatEffects[i].life-=dt;if(combatEffects[i].life<=0)combatEffects.splice(i,1);}
 const near=nearestWild(130);if(!battle&&near){selectedWild=near;}else if(!battle){selectedWild=null;}
 if(battle){battle.playerCooldown=Math.max(0,(battle.playerCooldown||0)-dt);const enemy=wilds.find(w=>w.uid===battle.wildUid);if(!enemy||!enemy.alive){battle=null;}else if(battle.enemyDelay>0){battle.enemyDelay-=dt;if(battle.enemyDelay<=0)enemyAttack();}}
 if(socket?.connected&&Date.now()-lastNetworkMove>120){lastNetworkMove=Date.now();socket.emit('player:move',{x:player.x,y:player.y,facing:player.facing});}
 if(Date.now()-lastSave>12000){lastSave=Date.now();saveState();}if(hudTimer<=0){hudTimer=.12;updateHud();}
}
function loop(ts){requestAnimationFrame(loop);if(!lastTime)lastTime=ts;let dt=Math.min(.1,(ts-lastTime)/1000);lastTime=ts;accumulator+=dt;const step=1/60;let steps=0;while(accumulator>=step&&steps<5){update(step);accumulator-=step;steps++;}if(steps===5)accumulator=0;drawFrame();fpsFrames++;fpsTimer+=dt;if(fpsTimer>=.5){fps=Math.round(fpsFrames/fpsTimer);fpsFrames=0;fpsTimer=0;if(showFPS){$('fpsBadge').textContent='FPS '+fps;$('fpsBadge').classList.remove('hidden');}else $('fpsBadge').classList.add('hidden');}}

function setTargetCard(w){$('targetCard').classList.remove('hidden');const s=SPECIES[w.id];$('targetIcon').textContent=s.icon;$('targetName').textContent=s.name;$('targetMeta').textContent=`Lv.${w.level} · ${s.rank}-Rank ${s.element}`;$('targetHpBar').style.width=(w.hp/w.maxHp*100)+'%';}
function updateHud(){const c=classInfo();$('playerName').textContent=state.player.name||'Hunter';$('rankLabel').textContent=state.player.rank;$('levelText').textContent='Lv.'+state.player.level;$('avatarMini').textContent=c.icon;$('hpBar').style.width=(state.player.hp/state.player.maxHp*100)+'%';$('hpText').textContent=`${Math.round(state.player.hp)} / ${state.player.maxHp} HP`;$('questProgress').textContent=`${Math.min(state.defeated,3)} / 3`;$('areaLabel').textContent=(REGION_DATA[currentRegion]||REGION_DATA.meadow).label;
 if(battle){const w=wilds.find(x=>x.uid===battle.wildUid);if(w){setTargetCard(w);$('battleLabel').textContent='ATTACK';$('battleIcon').textContent='⚔';}}else{$('targetCard').classList.add('hidden');$('battleLabel').textContent=selectedWild?'ENGAGE':'BATTLE';$('battleIcon').textContent='⚔';}
 const skillBtn=$('skillBtn');if(skillBtn){skillBtn.title=classSkillName();skillBtn.classList.toggle('cooling',skillCooldown>0);$('skillLabel').textContent=skillCooldown>0?skillCooldown.toFixed(1):'SKILL';$('skillIcon').textContent=skillCooldown>0?'⌛':'✦';}
 $('connectBadge').textContent=socket?.connected?'● ONLINE · '+onlinePlayers.length:'● OFFLINE MODE';$('connectBadge').classList.toggle('online',!!socket?.connected);
 const party=$('partyBar');party.innerHTML='';const list=state.team.slice(0,4);list.forEach((b,i)=>{const slot=document.createElement('div');slot.className='party-slot'+(b.hp<=0?' down':'');slot.title=currentDisplayName(b);const pct=clamp(b.hp/b.maxHp*100,0,100);slot.innerHTML=`<span class="beast-face">${SPECIES[b.id].icon}</span><span class="beast-lv">Lv.${b.level}</span><div class="party-hp"><span style="width:${pct}%"></span></div>`;slot.addEventListener('click',()=>openPanel('team'));party.appendChild(slot);});while(party.children.length<4){const slot=document.createElement('div');slot.className='party-slot down';slot.innerHTML='<span class="beast-face">＋</span><span class="beast-lv">EMPTY</span>';slot.onclick=()=>openPanel('team');party.appendChild(slot);}}
function addXp(n){const prev=state.player.level;state.player.xp+=n;let need=100+state.player.level*45;while(state.player.xp>=need){state.player.xp-=need;state.player.level++;state.player.maxHp+=12;state.player.hp=state.player.maxHp;state.player.rank=RANKS[Math.min(6,Math.floor(state.player.level/3))];need=100+state.player.level*45;toast('⭐ Level up! Level '+state.player.level);}handleClassEvolution(prev);for(const b of state.team){b.xp=(b.xp||0)+Math.floor(n*.7);const needB=100+b.level*35;while(b.xp>=needB){b.xp-=needB;b.level++;b.maxHp+=Math.round(SPECIES[b.id].hp*.05);b.hp=b.maxHp;b.atk+=2;b.def+=1;updateBeastForm(b,true);}}for(const b of state.storage){b.xp=(b.xp||0)+Math.floor(n*.3);const needB=100+b.level*35;if(b.xp>=needB){b.xp-=needB;b.level++;b.maxHp+=6;b.atk+=2;b.def+=1;updateBeastForm(b,true);}}for(const b of state.shadowArmy){b.xp=(b.xp||0)+Math.floor(n*.4);const needS=100+b.level*40;if(b.xp>=needS){b.xp-=needS;b.level++;b.maxHp+=8;b.hp=b.maxHp;b.atk+=3;b.def+=2;updateBeastForm(b,true);}}}
function startBattle(){if(battle){playerAttack();return;}let target=selectedWild&&selectedWild.alive?selectedWild:nearestWild(130);if(!target){toast('No wild beast nearby. Move closer.');return;}if(dist(target,player)>135){toast('Move closer to '+SPECIES[target.id].name+'.');return;}battle={wildUid:target.uid,enemyDelay:0,turn:0};selectedWild=target;setTargetCard(target);toast(`${SPECIES[target.id].name} appeared!`);}
function battleParty(){return state.team.slice(0,4).filter(b=>b.hp>0);}
const TYPE_BONUS={Fire:{Nature:1.25,Water:.82},Water:{Fire:1.25,Earth:1.15,Lightning:.82},Nature:{Water:1.2,Fire:.8},Lightning:{Water:1.22,Earth:.78,Wind:1.15},Earth:{Lightning:1.25,Wind:1.15,Water:.88},Wind:{Earth:1.2,Lightning:.9},Shadow:{Nature:1.15},Necromancy:{Shadow:1.08},Dragon:{Earth:1.18}};
function playerAttack(){
 if(!battle){startBattle();return;}if(battle.playerCooldown>0){toast('Your party is still attacking!');return;}
 const w=wilds.find(x=>x.uid===battle.wildUid);if(!w||!w.alive){battle=null;return;}const party=battleParty();if(!party.length){toast('Your beasts need healing.');return;}
 let dmgSum=0;const c=classInfo();party.forEach((b,i)=>{const mult=(TYPE_BONUS[b.element]||{})[SPECIES[w.id].element]||1,critical=Math.random()<b.crit?1.65:1,dmg=Math.max(2,Math.round((b.atk+b.level*2-SPECIES[w.id].def*.25)*mult*critical*c.bonus*(.9+Math.random()*.2)));dmgSum+=dmg;b.attackTimer=.36+i*.045;b.attackDuration=.36+i*.045;const f=followers.get(b.uid);const fx=f?f.x:player.x,fy=f?f.y-17:player.y-16;spawnEffect('bolt',fx,fy,w.x,w.y-18,elementColor(b.element),.25+i*.04);});
 player.attackTimer=.42;player.attackDuration=.42;w.hitTimer=.38;w.hitAngle=Math.atan2(w.y-player.y,w.x-player.x);spawnEffect('slash',w.x,w.y-17,w.x,w.y-17,elementColor(classInfo().name==='Necromancer'?'Necromancy':classInfo().name==='Mage'?'Water':'Wind'),.34,Math.atan2(w.y-player.y,w.x-player.x));spawnEffect('burst',w.x,w.y-17,w.x,w.y-17,elementColor(SPECIES[w.id].element),.3);spawnEffect('damage',w.x,w.y-20,w.x,w.y-29,'#fff2a8',.62,0,'-'+dmgSum);
 w.hp=Math.max(0,w.hp-dmgSum);battle.enemyDelay=.78;battle.playerCooldown=.48;battle.turn++;toast(`${party.map(b=>b.name||SPECIES[b.id].name).slice(0,2).join(' + ')} deal ${dmgSum} damage!`);if(w.hp<=0){winWild(w);return;}setTargetCard(w);
}
function classSkillName(){const names={warrior:'RISING STRIKE',berserker:'RAVAGER ROAR',ranger:'STAR VOLLEY',mage:'ARCANE NOVA',paladin:'DAWN BURST',assassin:'VOID FLASH',beastTamer:'PACK RUSH',necromancer:'SOUL BURST',alchemist:'PRISM BLAST'};return names[state.player.classId]||'BEAST BURST';}
function useClassSkill(){
 if(skillCooldown>0){toast(`Skill ready in ${skillCooldown.toFixed(1)}s.`);return;}
 if(!battle){const target=selectedWild&&selectedWild.alive?selectedWild:nearestWild(135);if(!target){toast('Move closer to a wild beast to use your skill.');return;}if(dist(target,player)>145){toast('Your skill needs a nearby target.');return;}battle={wildUid:target.uid,enemyDelay:0,turn:0};selectedWild=target;}
 const w=wilds.find(x=>x.uid===battle.wildUid);if(!w||!w.alive){battle=null;return;}const party=battleParty();if(!party.length){toast('Your beasts need healing.');return;}
 const sumAtk=party.reduce((sum,b)=>sum+b.atk+b.level,0);const c=classInfo();const damage=Math.max(16,Math.round((sumAtk*.62+state.player.level*10)*c.bonus*(.94+Math.random()*.18)));
 const colour=state.player.classId==='necromancer'?'#c5a0ff':state.player.classId==='mage'?'#8ce8f2':state.player.classId==='ranger'?'#b6ef9f':state.player.classId==='paladin'?'#ffe5a1':elementColor(party[0]?.element||'Wind');
 player.attackTimer=.52;player.attackDuration=.52;w.hitTimer=.48;w.hitAngle=Math.atan2(w.y-player.y,w.x-player.x);party.forEach((b,i)=>{b.attackTimer=.48+i*.02;b.attackDuration=.48+i*.02;const f=followers.get(b.uid);spawnEffect('bolt',f?f.x:player.x,f?f.y-18:player.y-18,w.x,w.y-18,elementColor(b.element),.22+i*.025);});
 spawnEffect('nova',w.x,w.y-17,w.x,w.y-17,colour,.58);spawnEffect('damage',w.x,w.y-24,w.x,w.y-36,'#fff2ad',.78,0,'-'+damage);for(let i=0;i<6;i++){const a=i*Math.PI/3;spawnEffect('burst',w.x+Math.cos(a)*16,w.y-17+Math.sin(a)*13,w.x+Math.cos(a)*16,w.y-17+Math.sin(a)*13,colour,.35+i*.018,a);}
 w.hp=Math.max(0,w.hp-damage);skillCooldown=5;battle.enemyDelay=.82;battle.playerCooldown=.55;battle.turn++;toast(`${classSkillName()}! ${damage} damage!`);if(w.hp<=0){winWild(w);return;}setTargetCard(w);
}
function enemyAttack(){
 if(!battle)return;const w=wilds.find(x=>x.uid===battle.wildUid);if(!w||!w.alive){battle=null;return;}const living=battleParty();if(!living.length){toast('Your party is down. Use a potion.');battle=null;return;}
 const b=living[battle.turn%living.length],sp=SPECIES[w.id],d=Math.max(3,Math.round((sp.atk*w.level/Math.max(1,b.level)-b.def*.15)*(.85+Math.random()*.25)));b.hp=Math.max(0,b.hp-d);w.attackTimer=.35;w.hitTimer=.34;const f=followers.get(b.uid),tx=f?f.x:player.x,ty=f?f.y-14:player.y-14;spawnEffect('bolt',w.x,w.y-18,tx,ty,elementColor(sp.element),.3);spawnEffect('burst',tx,ty,tx,ty,'#ff8a7b',.24);spawnEffect('damage',tx,ty,tx,ty-18,'#ffaaa2',.56,0,'-'+d);if(b.hp===0)toast(`${niceId(b.id)} is down!`);else toast(`${niceId(w.id)} hits ${niceId(b.id)} for ${d}.`);saveState();
}
function addShadowFrom(w){if(state.shadowArmy.length>=shadowLimit())return false;const b=makeBeast(w.id,Math.max(1,w.level),true);b.name=SPECIES[w.id].name;b.maxHp=Math.round(b.maxHp*1.08);b.hp=b.maxHp;b.atk=Math.round(b.atk*1.1);b.def=Math.round(b.def*1.08);state.shadowArmy.push(b);state.shadows=[...new Set(state.shadowArmy.map(x=>x.id))];return true;}
function winWild(w){w.alive=false;w.deathTimer=.65;spawnEffect('burst',w.x,w.y-18,w.x,w.y-18,elementColor(SPECIES[w.id].element),.48);spawnEffect('damage',w.x,w.y-25,w.x,w.y-48,'#c8ffd6',.72,0,'VICTORY');state.defeated++;state.player.gold+=20+rankIndex(SPECIES[w.id].rank)*15;addXp(35+rankIndex(SPECIES[w.id].rank)*25);const extracted=addShadowFrom(w);if(extracted)toast(`Victory! ${SPECIES[w.id].name} extracted as a shadow. 🌑`);else toast(`Victory! Shadow capacity full (${state.shadowArmy.length}/${shadowLimit()}).`);questCount=Math.min(3,questCount+1);state.questCount=questCount;state.worldLevel=Math.min(5,1+Math.floor(state.defeated/5));ensureLegendaries();if(w.level>=3&&Math.random()<.25)state.player.gold+=20;battle=null;selectedWild=null;saveState();updateHud();}
function captureWild(){if(!battle){toast('Engage a wild beast first.');return;}const w=wilds.find(x=>x.uid===battle.wildUid);if(!w||!w.alive)return;if(w.hp/w.maxHp>.42){toast('Weaken the beast below 42% HP.');return;}if(state.orbs<=0){toast('No Tame Orbs. Visit the shop.');return;}state.orbs--;const chance=clamp(.25+(1-w.hp/w.maxHp)*.85+(SPECIES[w.id].rank==='SS'?-.22:0),.12,.93);if(Math.random()<chance){const b=makeBeast(w.id,Math.max(1,w.level));w.alive=false;if(state.team.length<4)state.team.push(b);else state.storage.push(b);toast(`${SPECIES[w.id].name} captured! ${state.team.length<4?'Joined your active team.':'Sent to storage.'}`);battle=null;selectedWild=null;saveState();}else{toast('The capture failed.');battle.enemyDelay=.7;} }
function dash(){if(dashCooldown>0){toast(`Dash cooling down: ${dashCooldown.toFixed(1)}s`);return;}dashCooldown=1.5;dashTimer=.24;activeEffectTimer=.25;if(movement.mag>.1){dashX=movement.x;dashY=movement.y;}else{const d=facingVector(player.facing);dashX=d.x;dashY=d.y;}spawnEffect('dash',player.x,player.y-12,player.x-dashX*14,player.y-dashY*14,'#d7fff0',.3,Math.atan2(dashY,dashX));toast('Dash!');}
function usePotion(){if(state.potions<=0){toast('No potions left.');return;}state.potions--;state.player.hp=Math.min(state.player.maxHp,state.player.hp+65);for(const b of state.team)b.hp=Math.min(b.maxHp,b.hp+42);for(const b of state.storage)b.hp=Math.min(b.maxHp,b.hp+15);toast('Potion restored your party.');saveState();}
function shadowSummon(uidValue){const s=state.shadowArmy.find(b=>b.uid===uidValue);if(!s)return;if(state.team.some(b=>b.shadow&&b.shadowUid===s.uid)){toast('That shadow is already active.');return;}if(state.team.length>=4){toast('Your active party is full. Bench a beast first.');return;}if(activeShadowCount()>=activeShadowLimit()){toast(`Active shadow limit: ${activeShadowLimit()}.`);return;}if(state.shadowEnergy<=0){toast('Your Shadow Energy is depleted.');return;}const b={...s,uid:uid('active'),shadow:true,shadowUid:s.uid};state.team.push(b);state.activeShadows.push(s.uid);state.shadowEnergy--;saveState();toast(`${currentDisplayName(b)} has arisen!`);openPanel('team');}
function benchBeast(uidValue){if(state.team.length<=1){toast('Keep at least one beast active.');return;}const i=state.team.findIndex(b=>b.uid===uidValue);if(i<0)return;const b=state.team.splice(i,1)[0];if(b.shadow){state.activeShadows=state.activeShadows.filter(x=>x!==b.shadowUid);state.shadowEnergy=Math.min(state.shadowMaxEnergy,state.shadowEnergy+1);toast('Shadow returned to reserve.');}else state.storage.push(b);saveState();openPanel('team');}
function evolveBeast(uidValue,location){const list=location==='storage'?state.storage:state.team;const b=list.find(x=>x.uid===uidValue);if(!b)return;const s=SPECIES[b.id];const next=(b.formStage||0)+1;if(next>=s.evo.length){toast('This beast reached its final evolution.');return;}const req=BEAST_LEVELS[next]||50;if(b.level<req){toast(`Evolution requires Lv.${req}.`);return;}b.formStage=next;b.name=s.evo[next];b.maxHp=Math.round(b.maxHp*1.18);b.hp=b.maxHp;b.atk=Math.round(b.atk*1.16);b.def=Math.round(b.def*1.12);saveState();toast(`${s.name} evolved into ${s.evo[next]}!`);openPanel(location==='storage'?'storage':'team');}

function openPanel(panel){closeModal();activeModal=panel;$('modalLayer').classList.remove('hidden');const titles={menu:'Realm Menu',classes:'Classes & Evolution',team:'Active Beast Party',storage:'Beast Storage',bestiary:'Beast Bestiary',map:'World Map',quests:'Quests',bag:'Inventory',shop:'Realm Shop',guild:'Guild Hall',online:'Online Tamers',trade:'Trading',settings:'Settings',profile:'Hunter Profile'};$('modalTitle').textContent=titles[panel]||'Realm Menu';$('modalEyebrow').textContent='BEAST TAMER · WILD REALM';let html='';
 if(panel==='menu'){html=`<div class="menu-grid"><div class="menu-card"><h3>🧑 Hunter</h3><div class="muted">Lv.${state.player.level} · ${state.player.rank}-Rank</div><div class="muted">${classTitle()}</div><div class="muted">${state.player.gold.toLocaleString()} Gold</div></div><div class="menu-card"><h3>🌑 Shadow Necromancy</h3><div class="muted">Army ${state.shadowArmy.length}/${shadowLimit()}</div><div class="muted">Active ${activeShadowCount()}/${activeShadowLimit()}</div><div class="muted">Energy ${state.shadowEnergy}/${state.shadowMaxEnergy}</div></div></div><div class="section-title">CHARACTER</div><div class="grid"><button class="modal-action" data-panel="profile">🧑 PROFILE</button><button class="modal-action" data-panel="classes">⚔️ CLASS & EVOLUTION</button><button class="modal-action" data-panel="team">🐾 ACTIVE PARTY</button><button class="modal-action" data-panel="storage">📦 STORAGE</button><button class="modal-action" data-panel="bestiary">📖 BESTIARY</button><button class="modal-action" data-panel="shadows">🌑 SHADOW LEGION</button><button class="modal-action" data-panel="bag">🎒 INVENTORY</button></div><div class="section-title">WORLD & ONLINE</div><div class="grid"><button class="modal-action" data-panel="map">🗺️ WORLD MAP</button><button class="modal-action" data-panel="quests">📜 QUESTS</button><button class="modal-action" data-panel="shop">🛒 SHOP</button><button class="modal-action" data-panel="guild">🏰 GUILD</button><button class="modal-action" data-panel="online">👥 ONLINE PLAYERS</button><button class="modal-action" data-panel="trade">🔄 TRADING</button></div><button class="modal-action" id="saveNow">💾 SAVE PROGRESS</button>`;}
 if(panel==='classes'){html=`<p class="hint">Choose a class. Class evolutions unlock at levels 1, 20, 50 and 100, and alter your character's look and passive bonus.</p><div class="grid">${Object.entries(CLASS_DATA).map(([id,c])=>`<div class="class-card"><div class="portrait">${c.portrait}</div><h3>${c.icon} ${c.name}</h3><div class="muted">Weapon style: ${c.weapon}</div><div class="evolution-line">${c.evo.map((e,i)=>`<span>${i===classStage(id)?'⭐ ':''}${e} · Lv.${CLASS_LEVELS[i]}</span>`).join('')}</div><button class="modal-action" data-class="${id}">${state.player.classId===id?'CURRENT CLASS':'SELECT CLASS'}</button></div>`).join('')}</div>`;}
 if(panel==='team'||panel==='storage'){const list=panel==='team'?state.team:state.storage;html=`<p class="hint">${panel==='team'?'Up to four beasts join battles. Bench a beast to make room for a shadow.':'Stored beasts can be moved into your active party or offered in trades.'}</p><div class="grid">${list.map(b=>{const s=SPECIES[b.id];const next=(b.formStage||0)+1;const req=BEAST_LEVELS[next]||50;const canEvolve=next<s.evo.length&&b.level>=req;return `<div class="card"><h3>${s.icon} ${currentDisplayName(b)}</h3><span class="tag">${s.element}</span><span class="tag">${s.rank}-Rank</span>${b.shadow?'<span class="tag">SHADOW</span>':''}<div class="muted">Lv.${b.level} · HP ${b.hp}/${b.maxHp}<br>ATK ${b.atk} · DEF ${b.def}</div><div class="evolution-line">${s.evo.map((e,i)=>`<span>${i===b.formStage?'⭐ ':''}${e}</span>`).join('')}</div>${canEvolve?`<button class="modal-action" data-evolve="${b.uid}" data-list="${panel}">✨ EVOLVE</button>`:''}${panel==='team'?`<button class="modal-action" data-bench="${b.uid}">↘ BENCH / REMOVE</button>`:`<button class="modal-action" data-deploy="${b.uid}">⬆ ADD TO PARTY</button>`}</div>`;}).join('')||'<div class="card">No beasts here yet.</div>'}</div>`;}
 if(panel==='shadows'){html=`<div class="card"><h3>🌑 Shadow Legion</h3><div class="muted">Reserve ${state.shadowArmy.length}/${shadowLimit()} · Active ${activeShadowCount()}/${activeShadowLimit()} · Energy ${state.shadowEnergy}/${state.shadowMaxEnergy}</div><div class="muted">Defeated beasts are extracted automatically while capacity remains. Arise summons a shadow into your four-beast battle party.</div></div><div class="grid" style="margin-top:8px">${state.shadowArmy.map(b=>`<div class="card"><h3>🌑 ${esc(currentDisplayName(b))}</h3><span class="tag">${b.rank}-Rank</span><span class="tag">Lv.${b.level}</span><div class="muted">HP ${b.hp}/${b.maxHp} · ATK ${b.atk} · DEF ${b.def}</div>${state.team.some(t=>t.shadow&&t.shadowUid===b.uid)?'<span class="tag good">ACTIVE</span>':`<button class="modal-action" data-arise="${b.uid}">🌑 ARISE</button>`}</div>`).join('')||'<div class="card">No shadows yet. Defeat wild beasts to attempt extraction.</div>'}</div>`;}
 if(panel==='bestiary'){const types=[...new Set(Object.values(SPECIES).map(s=>s.element))];html=types.map(type=>`<div class="section-title">${type.toUpperCase()} BEASTS</div><div class="grid">${Object.entries(SPECIES).filter(([id,s])=>s.element===type).map(([id,s])=>{const owned=[...state.team,...state.storage,...state.shadowArmy].some(b=>b.id===id);return `<div class="card"><h3>${s.icon} ${s.name}</h3><span class="tag">${s.rank}-Rank</span><span class="tag">${s.element}</span><div class="muted">HP ${s.hp} · ATK ${s.atk} · DEF ${s.def}<br>Skill: ${s.skill}<br>${owned?'✅ Discovered':'❔ Not yet captured'}</div><div class="evolution-line">${s.evo.map((e,i)=>`<span>${i===0?'Base':'E'+i}: ${e}</span>`).join('')}</div></div>`;}).join('')}</div>`).join('');}
 if(panel==='bag'){html=`<div class="grid"><div class="card"><h3>🧪 Potions</h3><div class="muted">${state.potions}</div><button class="modal-action" id="usePotion">USE POTION</button></div><div class="card"><h3>🔮 Tame Orbs</h3><div class="muted">${state.orbs}</div><button class="modal-action" data-panel="shop">BUY MORE</button></div><div class="card"><h3>💰 Gold</h3><div class="muted">${state.player.gold.toLocaleString()}</div></div><div class="card"><h3>🌑 Shadow Reserve</h3><div class="muted">${state.shadowArmy.length}/${shadowLimit()} army slots</div><div class="muted">${state.shadowEnergy}/${state.shadowMaxEnergy} energy</div></div><div class="card"><h3>🎒 Items</h3><div class="muted">${Object.entries(state.items||{}).map(([k,v])=>`${k}: ${v}`).join('<br>')||'No extra items yet.'}</div></div></div>`;}
 if(panel==='profile'){const c=classInfo();html=`<div class="card"><h3>${c.portrait} ${state.player.name}</h3><div class="muted">Level ${state.player.level} · ${state.player.rank}-Rank</div><div class="muted">Class: ${classTitle()}</div><div class="muted">Class stage ${classStage()+1}/4</div><div class="muted">Defeated: ${state.defeated}</div><div class="muted">World Level: ${state.worldLevel}</div><label class="section-title">PLAYER NAME</label><input id="renameInput" class="field" maxlength="20" value="${esc(state.player.name)}"><button class="modal-action" id="renameBtn">UPDATE NAME</button></div><div class="card" style="margin-top:8px"><h3>Class Evolution</h3><div class="evolution-line">${c.evo.map((e,i)=>`<span>${i===classStage()?'⭐ ':''}${e} · Lv.${CLASS_LEVELS[i]}</span>`).join('')}</div></div>`;}
 if(panel==='map'){html=`<div class="card"><canvas id="mapCanvas" width="340" height="250" style="width:100%;height:auto;border-radius:10px;background:#284b45"></canvas><div class="map-legend">${Object.entries(REGION_DATA).map(([id,r])=>`<span>${state.discoveredRegions.includes(id)?'🟢':'🔒'} ${r.name} · Lv.${r.unlock}</span>`).join('')}</div></div>`;}
 if(panel==='quests'){html=`<div class="card"><h3>📜 First Steps</h3><div class="muted">Defeat three wild beasts near Greenleaf Town.</div><div class="target-hp" style="margin-top:8px"><span style="width:${Math.min(100,state.defeated/3*100)}%"></span></div><div class="muted">Progress ${Math.min(3,state.defeated)}/3</div>${state.defeated>=3?'<span class="tag good">COMPLETE · Reward already granted</span>':''}</div><div class="card" style="margin-top:8px"><h3>🧭 Explorer</h3><div class="muted">Discover new regions by walking into them.</div><div class="muted">Regions found: ${state.discoveredRegions.length}/${Object.keys(REGION_DATA).length}</div></div><div class="card" style="margin-top:8px"><h3>🌑 Shadow Collector</h3><div class="muted">Extract defeated beasts into your shadow reserve.</div><div class="muted">${state.shadowArmy.length}/${shadowLimit()} shadow slots used.</div></div>`;}
 if(panel==='shop'){html=`<div class="card"><h3>💰 Wallet</h3><div class="muted">${state.player.gold.toLocaleString()} Gold</div></div><div class="grid" style="margin-top:8px">${shopItems.map(it=>`<div class="card"><h3>${it.icon} ${it.name}</h3><div class="muted">${it.description}</div><div class="shop-price">${it.price} Gold</div><button class="modal-action" data-buy="${it.id}">BUY</button></div>`).join('')}</div>`;}
 if(panel==='guild'){if(guildState.guild){const g=guildState.guild;html=`<div class="card"><h3>🏰 [${esc(g.tag)}] ${esc(g.name)}</h3><div class="muted">Level ${g.level||1} · ${guildState.members.length}/50 members · Role: ${g.role||'member'}</div><button class="modal-action danger" id="guildLeave">LEAVE GUILD</button></div><div class="card" style="margin-top:8px"><h3>Members</h3>${guildState.members.map(m=>`<div class="list-row"><span>${esc(m.name)}<small>${m.online?'🟢 Online':'Offline'}</small></span><span class="tag">${esc((m.role||'member').toUpperCase())}</span></div>`).join('')}</div><div class="card" style="margin-top:8px"><h3>Guild Chat</h3><div id="guildChatLog" class="chat-log"></div><div class="inline-form"><input id="guildChatInput" placeholder="Say something..." maxlength="180"><button id="guildChatSend" class="mini-btn">SEND</button></div></div>`;}else{html=`<div class="card"><h3>Create a Guild</h3><div class="inline-form"><input id="guildName" placeholder="Guild name (3-24 chars)" maxlength="24"></div><div class="inline-form"><input id="guildTag" placeholder="TAG (2-5 chars)" maxlength="5"><button class="mini-btn" id="guildCreate">CREATE</button></div></div><div class="card" style="margin-top:8px"><h3>Find a Guild</h3><div id="guildList" class="muted">Loading guilds…</div><button class="modal-action" id="refreshGuilds">REFRESH LIST</button></div>`;}}
 if(panel==='online'){html=`<div class="card"><h3>🌐 Online Tamers</h3><div class="muted">Players connected to this game server. Open this game in another browser/device to test multiplayer.</div></div><div class="grid" style="margin-top:8px">${onlinePlayers.filter(p=>p.id!==playerId).map(p=>`<div class="card"><h3>${esc(p.name)}</h3><span class="tag">Lv.${p.level}</span><span class="tag">${esc(p.rank)}-Rank</span><div class="muted">${esc(CLASS_DATA[p.classId]?.name||'Tamer')}</div><button class="modal-action" data-trade-player="${esc(p.id)}">🔄 REQUEST TRADE</button></div>`).join('')||'<div class="card">No other tamers online yet.</div>'}</div>`;}
 if(panel==='trade'){html=trade?tradeFormHtml():`<div class="card"><h3>🔄 Safe Trading</h3><div class="muted">Select an online player and offer gold, orbs, potions, or a beast from Storage. Both players must confirm before a trade completes.</div><button class="modal-action" data-panel="online">VIEW ONLINE PLAYERS</button></div>`;}
 if(panel==='settings'){html=`<div class="card"><h3>Graphics Quality</h3><div class="muted">Lower quality can help less powerful phones.</div><div class="inline-form">${['low','medium','high'].map(m=>`<button class="mini-btn" data-graphics="${m}">${m.toUpperCase()} ${graphicsMode===m?'✓':''}</button>`).join('')}</div></div><div class="card" style="margin-top:8px"><h3>Performance</h3><div class="muted">Current FPS: ${fps}</div><button class="modal-action" id="fpsToggle">${showFPS?'HIDE':'SHOW'} FPS COUNTER</button><button class="modal-action" id="saveSettings">SAVE SETTINGS</button></div><div class="card" style="margin-top:8px"><h3>How to Play</h3><div class="hint">Drag the analog joystick to walk or run. Tap a wild beast or use Battle when close. Weaken it and tap Capture. Defeats automatically attempt Shadow Extraction while there is capacity.</div></div>`;}
 $('modalBody').innerHTML=html;wirePanel(panel);
}
function tradeFormHtml(){const mine=trade.a.id===playerId?trade.a:trade.b,other=trade.a.id===playerId?trade.b:trade.a;return `<div class="trade-cols"><div class="card"><h3>Your offer</h3><label>Gold<input id="offerGold" type="number" min="0" max="999999999" value="${mine.offer.gold}"></label><label>Tame Orbs<input id="offerOrbs" type="number" min="0" max="999999" value="${mine.offer.orbs}"></label><label>Potions<input id="offerPotions" type="number" min="0" max="999999" value="${mine.offer.potions}"></label><label>Beast from storage<select id="offerBeast"><option value="">None</option>${state.storage.map(b=>`<option value="${esc(b.uid)}" ${mine.offer.beastUid===b.uid?'selected':''}>${esc(currentDisplayName(b))} · Lv.${b.level}</option>`).join('')}</select></label><button class="modal-action" id="offerUpdate">UPDATE OFFER</button></div><div class="card"><h3>${esc(other.name)}'s offer</h3><div class="list-row">💰 Gold <b>${other.offer.gold}</b></div><div class="list-row">🔮 Orbs <b>${other.offer.orbs}</b></div><div class="list-row">🧪 Potions <b>${other.offer.potions}</b></div><div class="list-row">🐾 Beast <b>${esc(other.offer.beastUid?((state.storage.find(b=>b.uid===other.offer.beastUid)||{}).name||'Offered beast'):'None')}</b></div><p class="muted">${trade.confirmed[mine===trade.a?'a':'b']?'✅ You confirmed':'⏳ Waiting for your confirmation'}<br>${trade.confirmed[mine===trade.a?'b':'a']?'✅ They confirmed':'⏳ Waiting for other player'}</p></div></div><button class="modal-action" id="tradeConfirm">${trade.confirmed[mine===trade.a?'a':'b']?'CONFIRMED ✓':'CONFIRM TRADE'}</button><button class="modal-action danger" id="tradeCancel">CANCEL TRADE</button>`;}
function wirePanel(panel){$('modalBody').querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));$('modalBody').querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>{chooseClass(b.dataset.class);openPanel('classes');});$('modalBody').querySelectorAll('[data-evolve]').forEach(b=>b.onclick=()=>evolveBeast(b.dataset.evolve,b.dataset.list));$('modalBody').querySelectorAll('[data-arise]').forEach(b=>b.onclick=()=>shadowSummon(b.dataset.arise));$('modalBody').querySelectorAll('[data-bench]').forEach(b=>b.onclick=()=>benchBeast(b.dataset.bench));$('modalBody').querySelectorAll('[data-deploy]').forEach(b=>b.onclick=()=>{if(state.team.length>=4){toast('Active party is full. Bench a beast first.');return;}const i=state.storage.findIndex(x=>x.uid===b.dataset.deploy);if(i>=0){const beast=state.storage.splice(i,1)[0];state.team.push(beast);saveState();toast(`${niceId(beast.id)} joined the active party.`);openPanel('team');}});$('modalBody').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy));$('modalBody').querySelectorAll('[data-graphics]').forEach(b=>b.onclick=()=>{graphicsMode=b.dataset.graphics;state.graphicsMode=graphicsMode;resize();saveState();openPanel('settings');});$('modalBody').querySelectorAll('[data-trade-player]').forEach(b=>b.onclick=()=>requestTrade(b.dataset.tradePlayer));const ids=['saveNow','saveSettings'];ids.forEach(id=>{const el=$(id);if(el)el.onclick=()=>{saveState();toast('Progress saved. 💾');};});const potion=$('usePotion');if(potion)potion.onclick=()=>{usePotion();openPanel('bag');};const guildCreate=$('guildCreate');if(guildCreate)guildCreate.onclick=()=>socket?.emit('guild:create',{name:$('guildName').value,tag:$('guildTag').value});const guildLeave=$('guildLeave');if(guildLeave)guildLeave.onclick=()=>socket?.emit('guild:leave');const refresh=$('refreshGuilds');if(refresh)socket?.emit('guild:list');const chatSend=$('guildChatSend');if(chatSend)chatSend.onclick=sendGuildChat;const chatInput=$('guildChatInput');if(chatInput)chatInput.addEventListener('keydown',e=>{if(e.key==='Enter')sendGuildChat();});const fpsToggle=$('fpsToggle');if(fpsToggle)fpsToggle.onclick=()=>{showFPS=!showFPS;state.showFPS=showFPS;openPanel('settings');};const renameBtn=$('renameBtn');if(renameBtn)renameBtn.onclick=()=>{state.player.name=String($('renameInput').value||'Hunter').trim().slice(0,20)||'Hunter';saveState();toast('Name updated.');openPanel('profile');};if(panel==='map')drawMap();if(panel==='guild' && !guildState.guild)socket?.emit('guild:list');if(panel==='online'){}if(panel==='trade'&&trade)wireTradeForm();}
function chooseClass(id){if(!CLASS_DATA[id])return;const before=state.player.level;state.player.classId=id;state.player.classStage=classStage(id);refreshShadowEnergy();saveState();toast(`${CLASS_DATA[id].icon} ${classTitle()} selected.`);updateHud();}
function buyItem(id){const item=shopItems.find(x=>x.id===id);if(!item)return;if(socket?.connected){socket.emit('shop:buy',{itemId:id,qty:1});return;}if(state.player.gold<item.price){toast('Not enough gold.');return;}state.player.gold-=item.price;if(item.kind==='orbs')state.orbs+=item.amount;else if(item.kind==='potions')state.potions+=item.amount;else state.items[id]=(state.items[id]||0)+item.amount;saveState();toast(`Bought ${item.name}.`);openPanel('shop');}
function drawMap(){const c=$('mapCanvas');if(!c)return;const g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);const cell=10;for(let y=0;y<h;y+=cell){for(let x=0;x<w;x+=cell){let t='grass';const wx=(x-w/2)*35,wy=(y-h/2)*35;const r=regionAt(Math.floor(wx/TILE),Math.floor(wy/TILE));t=TERRAIN[(REGION_DATA[r]||REGION_DATA.meadow).terrain]? (REGION_DATA[r]||REGION_DATA.meadow).terrain:'grass';g.fillStyle=(TERRAIN[t]||TERRAIN.grass).base;g.fillRect(x,y,cell,cell);}}g.fillStyle='#e7d8a4';g.beginPath();g.arc(w/2,h/2,5,0,Math.PI*2);g.fill();g.strokeStyle='#fff';g.lineWidth=1;g.beginPath();g.arc(w/2,h/2,9,0,Math.PI*2);g.stroke();g.fillStyle='#f0e7cb';g.font='11px system-ui';g.fillText('YOU · GREENLEAF',w/2+11,h/2-8);const labels=[['DESERT',w*.79,h*.47],['FROSTPEAK',w*.4,h*.12],['SHADOWMIRE',w*.16,h*.18],['EMBERFALL',w*.2,h*.78],['DRACORIN',w*.85,h*.82]];for(const l of labels){g.fillStyle='rgba(9,23,31,.7)';g.fillRect(l[1]-5,l[2]-12,70,16);g.fillStyle='#e4d7ae';g.font='9px system-ui';g.fillText(l[0],l[1],l[2]);}}
function sendGuildChat(){const input=$('guildChatInput');if(input?.value.trim()){socket?.emit('guild:chat',input.value.trim());input.value='';}}
function requestTrade(id){if(!socket?.connected){toast('Online connection is required for trading.');return;}socket.emit('trade:request',id);toast('Trade request sent.');}
function wireTradeForm(){const upd=$('offerUpdate');if(upd)upd.onclick=()=>socket?.emit('trade:update',{tradeId:trade.tradeId,offer:{gold:Number($('offerGold').value)||0,orbs:Number($('offerOrbs').value)||0,potions:Number($('offerPotions').value)||0,beastUid:$('offerBeast').value||null}});const confirm=$('tradeConfirm');if(confirm)confirm.onclick=()=>socket?.emit('trade:confirm',trade.tradeId);const cancel=$('tradeCancel');if(cancel)cancel.onclick=()=>socket?.emit('trade:cancel',trade.tradeId);}

function handleSocket(){if(!socket)return;socket.on('connect',()=>{socket.emit('player:hello',{id:playerId,name:state.player.name,profile:state});$('connectBadge').textContent='● ONLINE';$('connectBadge').classList.add('online');});socket.on('disconnect',()=>{$('connectBadge').textContent='● OFFLINE MODE';$('connectBadge').classList.remove('online');});socket.on('profile:load',data=>{if(!data?.profile)return;state=normalizeState(data.profile);graphicsMode=state.graphicsMode||graphicsMode;showFPS=state.showFPS;refreshShadowEnergy();ensureLegendaries();saveLocalOnly();updateHud();});socket.on('profile:saved',()=>{});socket.on('online:list',list=>{onlinePlayers=Array.isArray(list)?list:[];const ids=new Set(onlinePlayers.filter(p=>p.id!==playerId).map(p=>p.id));for(const id of [...remotePlayers.keys()])if(!ids.has(id))remotePlayers.delete(id);if(activeModal==='online')openPanel('online');});socket.on('player:move',p=>{if(!p?.id||p.id===playerId)return;remotePlayers.set(p.id,p);});socket.on('guild:state',d=>{guildState=d||{guild:null,members:[]};if(activeModal==='guild')openPanel('guild');});socket.on('guild:list',list=>{if(activeModal!=='guild'||guildState.guild)return;const el=$('guildList');if(!el)return;el.innerHTML=(list||[]).map(g=>`<div class="list-row"><span>[${esc(g.tag)}] ${esc(g.name)}<small>Lv.${g.level} · ${g.members} members</small></span><button class="mini-btn" data-join-guild="${g.id}">JOIN</button></div>`).join('')||'<div class="muted">No guilds yet. Create the first one!</div>';el.querySelectorAll('[data-join-guild]').forEach(b=>b.onclick=()=>socket.emit('guild:join',Number(b.dataset.joinGuild)));});socket.on('guild:members',members=>{guildState.members=members||[];if(activeModal==='guild')openPanel('guild');});socket.on('guild:chat',line=>{if(activeModal==='guild'){const el=$('guildChatLog');if(el){const div=document.createElement('div');div.className='chat-line';div.textContent=`${line.name}: ${line.message}`;el.appendChild(div);el.scrollTop=el.scrollHeight;}}else toast(`Guild · ${line.name}: ${line.message}`);});socket.on('guild:system',msg=>toast(msg));socket.on('shop:list',items=>{shopItems=Array.isArray(items)&&items.length?items.map(it=>({...it,description:it.description||it.desc||''})):SHOP_ITEMS;if(activeModal==='shop')openPanel('shop');});socket.on('server:error',msg=>toast('⚠ '+msg));socket.on('toast',msg=>toast(msg));socket.on('trade:incoming',d=>{incomingTrade=d;setModal('Trade Request','PLAYER-TO-PLAYER',`<div class="card"><h3>🔄 ${esc(d.from?.name||'A tamer')} wants to trade.</h3><p class="muted">Trade offers are confirmed by both players before anything moves.</p><button id="tradeAccept" class="modal-action">ACCEPT TRADE</button><button id="tradeReject" class="modal-action danger">DECLINE</button></div>`);$('tradeAccept').onclick=()=>socket.emit('trade:accept',d.tradeId);$('tradeReject').onclick=()=>{socket.emit('trade:reject',d.tradeId);closeModal();};});socket.on('trade:started',d=>{trade=d;openPanel('trade');});socket.on('trade:state',d=>{trade=d;if(activeModal==='trade')openPanel('trade');});socket.on('trade:complete',profile=>{trade=null;state=normalizeState(profile);saveLocalOnly();toast('✅ Trade completed!');if(activeModal==='trade')openPanel('trade');});socket.on('trade:closed',msg=>{trade=null;toast(msg||'Trade closed.');if(activeModal==='trade')openPanel('trade');});socket.on('trade:error',msg=>toast('⚠ '+msg));}
function saveLocalOnly(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const playerId=(()=>{let id=localStorage.getItem(PLAYER_KEY);if(!id){id=(crypto?.randomUUID?.()||uid('player'));localStorage.setItem(PLAYER_KEY,id);}return id;})();

// Pointer-based analog stick: continuous values, clamped radius, stable touch ownership.
(function setupJoystick(){const root=$('joystick'),ring=root.querySelector('.joy-ring'),knob=$('joyKnob');const max=27;function reset(){joystickPointer=null;movement.x=0;movement.y=0;movement.mag=0;knob.style.left='50%';knob.style.top='50%';}function move(e){if(joystickPointer!==e.pointerId)return;const r=ring.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const len=Math.hypot(dx,dy),lim=max;if(len>lim){dx=dx/len*lim;dy=dy/len*lim;}knob.style.left=`calc(50% + ${dx}px)`;knob.style.top=`calc(50% + ${dy}px)`;const radius=Math.max(1,lim);let x=dx/radius,y=dy/radius,mag=Math.min(1,Math.hypot(x,y));const dead=.12;if(mag<dead){movement.x=0;movement.y=0;movement.mag=0;}else{const scaled=(mag-dead)/(1-dead);movement.x=x/mag;movement.y=y/mag;movement.mag=scaled;}}ring.addEventListener('pointerdown',e=>{e.preventDefault();if(joystickPointer!==null)return;joystickPointer=e.pointerId;ring.setPointerCapture?.(e.pointerId);move(e);});ring.addEventListener('pointermove',e=>{if(joystickPointer===e.pointerId){e.preventDefault();move(e);}});ring.addEventListener('pointerup',e=>{if(joystickPointer===e.pointerId){e.preventDefault();reset();}});ring.addEventListener('pointercancel',e=>{if(joystickPointer===e.pointerId)reset();});ring.addEventListener('lostpointercapture',()=>{if(joystickPointer!==null)reset();});})();

$('battleBtn').addEventListener('click',()=>{startBattle();});$('captureBtn').addEventListener('click',captureWild);$('dashBtn').addEventListener('click',dash);$('skillBtn').addEventListener('click',useClassSkill);$('menuBtn').addEventListener('click',()=>openPanel('menu'));$('closeModal').addEventListener('click',closeModal);$('modalLayer').addEventListener('click',e=>{if(e.target===$('modalLayer'))closeModal();});$('startBtn').addEventListener('click',()=>{ $('startScreen').classList.add('hidden');if(!state.player.classId)openPanel('classes');else toast(`Welcome back, ${classTitle()}!`);saveState();});
canvas.addEventListener('pointerdown',e=>{if(activeModal!=='none')return;const x=e.clientX,y=e.clientY;const wx=x-viewW/2+camera.x,wy=y-viewH/2+camera.y;const npc=Npcs.find(n=>Math.hypot(n.x-wx,n.y-wy)<34);if(npc){if(npc.role==='shop')openPanel('shop');else if(npc.role==='guild')openPanel('guild');else if(npc.role==='quest')openPanel('quests');return;}let best=null,bestD=34;for(const w of wilds){if(!w.alive)continue;const d=Math.hypot(w.x-wx,w.y-wy);if(d<bestD){best=w;bestD=d;}}if(best){selectedWild=best;setTargetCard(best);if(dist(best,player)<135&&!battle)toast(`${SPECIES[best.id].name} selected. Tap BATTLE to engage.`);}});
canvas.addEventListener('dblclick',()=>{if(selectedWild&&dist(selectedWild,player)<135&&!battle)startBattle();});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='escape')closeModal();if(k===' '||k==='enter'){if(activeModal==='none')startBattle();}if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){e.preventDefault();const keys={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};const v=keys[k];movement.x=v[0];movement.y=v[1];movement.mag=1;}});window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){movement.x=0;movement.y=0;movement.mag=0;}});window.addEventListener('resize',resize);window.addEventListener('beforeunload',()=>saveState());document.addEventListener('visibilitychange',()=>{if(document.hidden){movement.x=0;movement.y=0;movement.mag=0;saveState();}});

refreshShadowEnergy();spawnPlayer();randomWilds();resize();updateHud();handleSocket();
requestAnimationFrame(loop);
})();
