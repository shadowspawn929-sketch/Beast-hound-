const express=require('express');
const http=require('http');
const path=require('path');
const {Server}=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=new Server(server);
app.use(express.static(path.join(__dirname,'public')));
const players=new Map();
const species=[
 {id:'emberfox',name:'Emberfox',icon:'🦊',affinity:'Fire',color:0xff7138,hp:70,atk:15,def:8},
 {id:'mossling',name:'Mossling',icon:'🌿',affinity:'Nature',color:0x65c466,hp:82,atk:12,def:11},
 {id:'aquaphin',name:'Aquaphin',icon:'🐬',affinity:'Water',color:0x58a9e8,hp:86,atk:13,def:12},
 {id:'stormcub',name:'Stormcub',icon:'🐯',affinity:'Lightning',color:0x8b82ff,hp:68,atk:18,def:7},
 {id:'rockhorn',name:'Rockhorn',icon:'🦏',affinity:'Earth',color:0xa78663,hp:105,atk:11,def:19},
 {id:'moonowl',name:'Moonowl',icon:'🦉',affinity:'Mystic',color:0xb77cff,hp:72,atk:17,def:9},
 {id:'flamehound',name:'Flame Hound',icon:'🐕',affinity:'Fire',color:0xff5a24,hp:115,atk:24,def:14},
 {id:'frostdrake',name:'Frost Drake',icon:'🐉',affinity:'Ice',color:0x9ee8ff,hp:160,atk:31,def:20},
 {id:'voidstalker',name:'Void Stalker',icon:'👁️',affinity:'Void',color:0x4b1c70,hp:190,atk:38,def:24}
];
function makeBeast(s,lvl=1,shadow=false){return {id:s.id,name:s.name,icon:s.icon,affinity:s.affinity,color:s.color,maxHp:s.hp+lvl*8,hp:s.hp+lvl*8,atk:s.atk+lvl*2,def:s.def+lvl,level:lvl,shadow};}
function randomWild(level){const s=species[Math.floor(Math.random()*species.length)];return makeBeast(s,Math.max(1,level+Math.floor(Math.random()*3)-1),false)}
function publicPlayer(p){return {id:p.id,name:p.name,x:p.x,z:p.z,level:p.level,rank:p.rank,cls:p.cls,beast:p.team[0]||null}};
function broadcast(){io.emit('players',[...players.values()].map(publicPlayer));}
io.on('connection',socket=>{
 socket.on('join',raw=>{
  const name=String(raw||'Trainer').trim().slice(0,18)||'Trainer';
  const starter=makeBeast(species.find(s=>s.id==='emberfox'));
  const p={id:socket.id,name,x:(Math.random()*18)-9,z:(Math.random()*18)-9,level:1,xp:0,gold:100,rank:'E',cls:'Warrior',team:[starter],shadowArmy:[],boneWarrior:false};
  players.set(socket.id,p);socket.emit('state',p);broadcast();io.emit('chat',{name:'SYSTEM',text:`${name} entered the Wild Realm.`});
 });
 socket.on('move',v=>{const p=players.get(socket.id);if(!p)return;p.x=Math.max(-42,Math.min(42,Number(v.x)||p.x));p.z=Math.max(-42,Math.min(42,Number(v.z)||p.z));socket.broadcast.emit('move',publicPlayer(p));});
 socket.on('chat',text=>{const p=players.get(socket.id);text=String(text||'').trim().slice(0,160);if(p&&text)io.emit('chat',{name:p.name,text});});
 socket.on('saveState',data=>{const p=players.get(socket.id);if(!p)return;Object.assign(p,{level:data.level||p.level,xp:data.xp||p.xp,gold:data.gold||p.gold,rank:data.rank||p.rank,cls:data.cls||p.cls,team:Array.isArray(data.team)?data.team.slice(0,6):p.team,shadowArmy:Array.isArray(data.shadowArmy)?data.shadowArmy:p.shadowArmy});socket.emit('state',p);broadcast();});
 socket.on('disconnect',()=>{const p=players.get(socket.id);players.delete(socket.id);if(p)io.emit('chat',{name:'SYSTEM',text:`${p.name} left the Wild Realm.`});broadcast();});
});
server.listen(process.env.PORT||3000,()=>console.log('Beastbound Beast Tamer running'));
