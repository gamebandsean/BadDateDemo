import type * as Party from "partykit/server";

/**
 * Room Registry Server
 * 
 * This special PartyKit room maintains a list of available game rooms.
 * - Hosts register their rooms when created
 * - Clients query for available rooms
 * - Rooms are automatically removed after inactivity
 */

interface RoomInfo {
  code: string;
  host: string;
  daterName: string;
  playerCount: number;
  createdAt: number;
  lastUpdate: number;
}

interface RegistryState {
  rooms: Record<string, RoomInfo>;
}

type RegistryAction = 
  | { type: 'GET_ROOMS' }
  | { type: 'REGISTER_ROOM'; room: RoomInfo }
  | { type: 'UPDATE_ROOM'; code: string; playerCount: number }
  | { type: 'REMOVE_ROOM'; code: string }
  | { type: 'CLEAR_ALL_ROOMS' };

// How long before a room is considered stale (5 minutes)
const ROOM_STALE_MS = 5 * 60 * 1000;

export default class RoomRegistry implements Party.Server {
  state: RegistryState = { rooms: {} };

  constructor(readonly room: Party.Room) {}

  async onStart() {
    // Load state from storage
    const stored = await this.room.storage.get<RegistryState>("state");
    if (stored) {
      this.state = stored;
    }
    
    // Clean up stale rooms
    this.cleanupStaleRooms();
  }

  async onConnect(conn: Party.Connection) {
    // Send current room list to new connection
    this.sendRoomsList(conn);
  }

  async onMessage(message: string, sender: Party.Connection) {
    const action: RegistryAction = JSON.parse(message);
    
    switch (action.type) {
      case 'GET_ROOMS':
        this.cleanupStaleRooms();
        this.sendRoomsList(sender);
        break;
        
      case 'REGISTER_ROOM':
        this.state.rooms[action.room.code] = {
          ...action.room,
          createdAt: Date.now(),
          lastUpdate: Date.now()
        };
        console.log(`📝 Room registered: ${action.room.code} by ${action.room.host}`);
        this.broadcastRoomsList();
        break;
        
      case 'UPDATE_ROOM':
        if (this.state.rooms[action.code]) {
          this.state.rooms[action.code].playerCount = action.playerCount;
          this.state.rooms[action.code].lastUpdate = Date.now();
          this.broadcastRoomsList();
        }
        break;
        
      case 'REMOVE_ROOM':
        delete this.state.rooms[action.code];
        console.log(`🗑️ Room removed: ${action.code}`);
        this.broadcastRoomsList();
        break;
        
      case 'CLEAR_ALL_ROOMS':
        this.state.rooms = {};
        console.log('🗑️ All rooms cleared');
        this.broadcastRoomsList();
        break;
    }
    
    // Persist state
    await this.room.storage.put("state", this.state);
  }

  cleanupStaleRooms() {
    const now = Date.now();
    let removed = 0;
    
    for (const code of Object.keys(this.state.rooms)) {
      const room = this.state.rooms[code];
      if (now - room.lastUpdate > ROOM_STALE_MS) {
        delete this.state.rooms[code];
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} stale room(s)`);
    }
  }

  sendRoomsList(conn: Party.Connection) {
    const roomsList = Object.values(this.state.rooms);
    conn.send(JSON.stringify({
      type: 'ROOMS_LIST',
      rooms: roomsList
    }));
  }

  broadcastRoomsList() {
    const roomsList = Object.values(this.state.rooms);
    this.room.broadcast(JSON.stringify({
      type: 'ROOMS_LIST',
      rooms: roomsList
    }));
  }
}
