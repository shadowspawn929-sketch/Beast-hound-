# Beast Tamer: Wild Realm Online

Render-ready Node.js game with:

- 3D browser gameplay with Three.js
- Real-time multiplayer positions with Socket.IO
- Guild creation, joining, leaving, members, and guild chat
- Server-backed player trading for gold, potions, orbs, and stored beasts
- Server-backed in-game shop
- SQLite persistence for profiles, guilds, and shop data
- Local browser save as a fallback for gameplay

## Files

public/index.html
public/style.css
public/game.js
public/online.js
server.js
package.json

## Render

Use a Web Service connected to this GitHub repository.

Build Command: `npm install`
Start Command: `npm start`

The server listens on `PORT` and binds to `0.0.0.0`.

## Database persistence

The project uses `better-sqlite3` and writes to `data/beast-tamer.db` by default. On hosting platforms where the filesystem is ephemeral, database data can disappear after a restart/redeploy. For permanent online progression, attach persistent storage or move the database to a managed external database later.

## Important multiplayer note

The guild, trade, and shop transactions are processed on the server. The exploration/combat loop is still primarily client-side in this build. A future competitive PvP update should also move battle calculations to the server for stronger anti-cheat protection.
