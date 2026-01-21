# PartyKit Migration Guide

This document explains how to migrate from Firebase to PartyKit for real-time game state synchronization.

## Overview

**Current (Firebase):**
- Any client can write to Firebase
- Multiple listeners for different data paths
- Race conditions possible when multiple clients update simultaneously
- State can become inconsistent

**New (PartyKit):**
- Server is the single source of truth
- Clients send **actions**, server updates **state**
- All clients receive the same state simultaneously
- Race conditions impossible

## Files Created

```
partykit/
├── server.ts          # PartyKit server (handles all game logic)
└── partykit.json      # PartyKit config

src/services/
└── partyClient.ts     # Client library (replaces firebase.js)
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install partykit partysocket
```

### 2. Deploy PartyKit Server

```bash
# Login to PartyKit (first time only)
npx partykit login

# Deploy the server
cd partykit
npx partykit deploy
```

This will give you a URL like: `bad-date-demo.yourname.partykit.dev`

### 3. Update Environment Variables

Add to `.env`:
```
VITE_PARTYKIT_HOST=bad-date-demo.yourname.partykit.dev
```

### 4. Update React Components

Replace Firebase imports with PartyKit:

**Before (Firebase):**
```jsx
import { 
  subscribeToGameState, 
  updateGameState,
  submitAttribute,
  // etc
} from '../services/firebase'

// In component
useEffect(() => {
  const unsubscribe = subscribeToGameState(roomCode, (state) => {
    setPhase(state.phase)
    setPlayers(state.players)
    // ... sync all state
  })
  return unsubscribe
}, [roomCode])

// Update state (any client can do this - dangerous!)
await updateGameState(roomCode, { phase: 'phase2', timer: 30 })
```

**After (PartyKit):**
```jsx
import { usePartyGame } from '../services/partyClient'

// In component - state syncs automatically!
const { state, client, isConnected } = usePartyGame(roomCode)

// Use state directly
const phase = state?.phase
const players = state?.players || []

// Send actions (server validates and updates)
client?.setPhase('phase2', 30)
client?.submitAttribute('is a vampire', username, odId)
```

## API Comparison

| Firebase | PartyKit |
|----------|----------|
| `createRoom(code, data)` | Just connect to room - created automatically |
| `joinRoom(code, player)` | `client.join(odId, username)` |
| `leaveRoom(code, odId)` | `client.leave(odId)` |
| `updateGameState(code, updates)` | `client.setPhase()`, `client.setTimer()`, etc. |
| `submitAttribute(code, attr)` | `client.submitAttribute(text, username, odId)` |
| `submitVote(code, odId, num)` | `client.vote(odId, attributeNumber)` |
| `subscribeToGameState()` | `usePartyGame()` hook or `client.onStateChange()` |
| `subscribeToPlayers()` | Included in game state automatically |
| `subscribeToChat()` | Included in game state automatically |

## Key Differences in Logic

### Host Detection

**Firebase:** Stored as a property on each player
```jsx
const isHost = players.find(p => p.id === odId)?.isHost
```

**PartyKit:** Compared against host ID in state
```jsx
const isHost = state?.host === odId
```

### State Updates

**Firebase:** Direct writes, optimistic updates
```jsx
// This could cause race conditions
await updateGameState(roomCode, { compatibility: 75 })
```

**PartyKit:** Send action, server updates, all clients receive
```jsx
// Server validates and broadcasts to everyone
client.setCompatibility(75)
```

### Phase Transitions

**Firebase:** Host writes new phase, others subscribe
```jsx
// Host
await updateGameState(roomCode, { phase: 'phase2', timer: 30 })

// Client
subscribeToGameState(roomCode, (state) => {
  if (state.phase !== currentPhase) {
    setPhase(state.phase) // Might arrive at different times
  }
})
```

**PartyKit:** Host sends action, server broadcasts to ALL simultaneously
```jsx
// Host
client.setPhase('phase2', 30)

// All clients (including host) receive in onStateChange
// Guaranteed to be synchronized
```

## Migration Checklist

- [ ] Install partykit and partysocket packages
- [ ] Deploy PartyKit server
- [ ] Update .env with VITE_PARTYKIT_HOST
- [ ] Update LiveLobby.jsx (room creation/joining)
- [ ] Update LiveGameLobby.jsx (game start)
- [ ] Update LiveDateScene.jsx (main game logic)
- [ ] Remove Firebase imports and service
- [ ] Test with multiple clients
- [ ] Remove Firebase config from project

## Testing Locally

You can test PartyKit locally before deploying:

```bash
# In one terminal, run the PartyKit dev server
cd partykit
npx partykit dev

# In another terminal, run your React app
npm run dev
```

The local PartyKit server runs at `localhost:1999` by default.

## Benefits After Migration

1. **No more race conditions** - Server is authoritative
2. **Guaranteed sync** - All clients see the same state
3. **Simpler code** - No need to manage multiple subscriptions
4. **Better debugging** - Single state object, clear action flow
5. **Lower latency** - WebSocket vs Firebase long-polling
6. **Free tier** - PartyKit has generous free tier for hobby projects
