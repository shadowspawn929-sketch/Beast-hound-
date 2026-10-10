# Beast Tamer: Wild Realm — 2D Online Build

A mobile-first, top-down 2D browser RPG prototype built with Canvas 2D, Express, and Socket.IO.

## Included in this build

- Top-down 2D world with a central town, forests, paths, lakes, and unlockable regions
- Animated, class-coloured player sprites and distinctive procedural 2D beast sprites
- Nine playable classes and four class stages each
- 28 beasts across Fire, Water, Nature, Lightning, Wind, Earth, Shadow, Necromancy, Dragon, and Legendary groups
- Separate evolution chains, level-gated evolution, and visual changes by form stage
- Four active team slots plus beast storage
- Shadow extraction after defeating wild beasts, rank/class shadow capacity, active shadow limits, shadow energy, and Arise actions
- Floating-feel analog joystick with pointer tracking, dead zone, clamped travel, walk/run speed scaling, acceleration, and deceleration
- Dash, battle, capture, and party bar controls
- Fixed-step simulation with `requestAnimationFrame`, capped device pixel ratio, cached terrain tiles, and visible-region rendering for mobile performance
- Player HP/XP, quests, map, inventory, graphics options, and FPS counter
- Online player movement, guild creation/join/leave/chat, server-backed shop, and two-step trade offers for gold, orbs, potions, and stored beasts
- Local autosave and server-side JSON save data
- `/api/health` endpoint

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Render deployment

Create a **Web Service** connected to this repository.

- Build command: `npm install`
- Start command: `npm start`
- Environment: Node
- Optional persistent-disk data directory: set `DATA_DIR=/var/data` and attach a disk mounted at `/var/data` if the selected Render plan supports it.

Without persistent storage, JSON data in the instance filesystem may be lost when a hosted instance is replaced. For a growing multiplayer game, migrate saves to a managed database.

## Current prototype boundaries

The player and beast art is drawn procedurally in Canvas so the game has usable 2D visuals without requiring an external sprite pack. The referenced visual direction informs the layout and proportions; custom hand-drawn sprite sheets can replace the procedural art in a later art pass.

Exploration/combat simulation is currently client-side. The server provides multiplayer presence, guild operations, shop purchases, and trade validation, but this is not yet a hardened competitive backend. Before public PvP or real-money purchases, move combat rewards and all economy-changing actions fully server-side, add authentication/rate limits, and use a managed persistent database.


## Visual & simulation upgrade

The current visual pass adds richer character silhouettes and class weapons, animated walking legs and arms, follower-beast formation and running, roaming wild-beast behaviour, improved terrain texture and town buildings, depth-sorted scenery, elemental projectile attacks, slash and impact effects, damage numbers, and more visible hit/attack reactions. The online script is now loaded before the game script and the game reuses that shared Socket.IO connection.

For deployment, push the complete project folder to your GitHub repository so Render receives the updated `public/game.js`, `public/index.html`, and `public/online.js`.


## Next upgrade: combat, ambience, and mobile performance

- New class-specific active skill button with a visible cooldown, large impact/nova animation, and class-themed color effects.
- Beast sprites turn toward their travel/target direction and use visible attack lunges, while the hunter lunges during attacks.
- New layered tree canopy art and denser cached terrain textures.
- Biome color grading, edge vignette, soft lighting, and floating atmosphere particles, with fewer particles on Low graphics mode.
- Smooth walk-to-run joystick speed curve and camera look-ahead.
- Wild-beast AI sleeps when far from the player to avoid wasting CPU on off-screen creatures.
- HUD refresh is throttled instead of reconstructing all party-slot DOM elements 60 times per second.

The online experience remains a prototype; deploy the whole folder and test two actual browser sessions before relying on multiplayer features.
