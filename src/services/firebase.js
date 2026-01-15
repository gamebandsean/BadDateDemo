import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, onValue, push, update, remove } from 'firebase/database'

// Firebase configuration - replace with your own from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Debug: log config
console.log('🔧 Firebase config check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasDatabaseURL: !!firebaseConfig.databaseURL,
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
  databaseURL: firebaseConfig.databaseURL
})

// Initialize Firebase
let app = null
let database = null

try {
  if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
    app = initializeApp(firebaseConfig)
    database = getDatabase(app)
    console.log('🔥 Firebase initialized successfully')
  } else {
    console.warn('⚠️ Firebase config missing - multiplayer disabled', firebaseConfig)
  }
} catch (error) {
  console.error('Firebase initialization error:', error)
}

// Check if Firebase is available
export const isFirebaseAvailable = () => !!database

// Room operations
export const createRoom = async (roomCode, hostData) => {
  if (!database) return false
  
  const roomRef = ref(database, `rooms/${roomCode}`)
  
  try {
    // Only store serializable dater data (no functions)
    const daterData = hostData.dater ? {
      id: hostData.dater.id,
      name: hostData.dater.name,
      age: hostData.dater.age,
      photo: hostData.dater.photo,
      tagline: hostData.dater.tagline,
      archetype: hostData.dater.archetype,
      traits: hostData.dater.traits || [],
      interests: hostData.dater.interests || [],
      dealbreakers: hostData.dater.dealbreakers || [],
      bio: hostData.dater.bio || ''
    } : null
    
    await set(roomRef, {
      code: roomCode,
      host: hostData.username,
      hostId: hostData.odId,
      dater: daterData,
      players: {
        [hostData.odId]: {
          id: hostData.odId,
          username: hostData.username,
          isHost: true,
          joinedAt: Date.now()
        }
      },
      gameState: {
        phase: 'lobby',
        livePhase: 'idle',
        cycleCount: 0,
        phaseTimer: 0,
        compatibility: 50,
        avatar: hostData.avatar || { attributes: [] },
        conversation: [],
        suggestedAttributes: [],
        numberedAttributes: [],
        attributeVotes: {},
        winningAttribute: null,
        sentimentCategories: {
          loves: [],
          likes: [],
          dislikes: [],
          dealbreakers: []
        }
      },
      chat: [],
      createdAt: Date.now()
    })
    
    return true
  } catch (error) {
    console.error('Error creating room:', error)
    return false
  }
}

export const joinRoom = async (roomCode, playerData) => {
  if (!database) return { success: false, error: 'Firebase not available' }
  
  const roomRef = ref(database, `rooms/${roomCode}`)
  
  try {
    const snapshot = await get(roomRef)
    
    if (!snapshot.exists()) {
      return { success: false, error: 'Room not found' }
    }
    
    const roomData = snapshot.val()
    
    // Check if game already started
    if (roomData.gameState?.phase !== 'lobby') {
      return { success: false, error: 'Game already in progress' }
    }
    
    // Add player to room
    const playerRef = ref(database, `rooms/${roomCode}/players/${playerData.odId}`)
    await set(playerRef, {
      id: playerData.odId,
      username: playerData.username,
      isHost: false,
      joinedAt: Date.now()
    })
    
    return { 
      success: true, 
      roomData: {
        ...roomData,
        players: { ...roomData.players, [playerData.playerId]: playerData }
      }
    }
  } catch (error) {
    console.error('Error joining room:', error)
    return { success: false, error: 'Failed to join room' }
  }
}

export const leaveRoom = async (roomCode, playerId) => {
  if (!database) return
  
  const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`)
  try {
    await remove(playerRef)
  } catch (error) {
    console.error('Error leaving room:', error)
  }
}

// Listen to room changes
export const subscribeToRoom = (roomCode, callback) => {
  if (!database) return () => {}
  
  const roomRef = ref(database, `rooms/${roomCode}`)
  return onValue(roomRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

// Listen to players in room
export const subscribeToPlayers = (roomCode, callback) => {
  if (!database) return () => {}
  
  const playersRef = ref(database, `rooms/${roomCode}/players`)
  return onValue(playersRef, (snapshot) => {
    if (snapshot.exists()) {
      const playersObj = snapshot.val()
      const playersArray = Object.values(playersObj).sort((a, b) => a.joinedAt - b.joinedAt)
      callback(playersArray)
    } else {
      callback([])
    }
  })
}

// Update game state
export const updateGameState = async (roomCode, updates) => {
  if (!database) return
  
  const gameStateRef = ref(database, `rooms/${roomCode}/gameState`)
  try {
    await update(gameStateRef, updates)
  } catch (error) {
    console.error('Error updating game state:', error)
  }
}

// Listen to game state changes
export const subscribeToGameState = (roomCode, callback) => {
  if (!database) return () => {}
  
  const gameStateRef = ref(database, `rooms/${roomCode}/gameState`)
  return onValue(gameStateRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    }
  })
}

// Chat operations
export const sendChatMessage = async (roomCode, message) => {
  if (!database) return
  
  const chatRef = ref(database, `rooms/${roomCode}/chat`)
  try {
    await push(chatRef, {
      ...message,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error sending chat message:', error)
  }
}

export const subscribeToChat = (roomCode, callback) => {
  if (!database) return () => {}
  
  const chatRef = ref(database, `rooms/${roomCode}/chat`)
  return onValue(chatRef, (snapshot) => {
    if (snapshot.exists()) {
      const chatObj = snapshot.val()
      const chatArray = Object.values(chatObj).sort((a, b) => a.timestamp - b.timestamp)
      callback(chatArray)
    } else {
      callback([])
    }
  })
}

// Attribute suggestions
export const submitAttribute = async (roomCode, suggestion) => {
  if (!database) return
  
  const suggestionsRef = ref(database, `rooms/${roomCode}/gameState/suggestedAttributes`)
  try {
    await push(suggestionsRef, suggestion)
  } catch (error) {
    console.error('Error submitting attribute:', error)
  }
}

export const clearSuggestions = async (roomCode) => {
  if (!database) return
  
  const suggestionsRef = ref(database, `rooms/${roomCode}/gameState/suggestedAttributes`)
  try {
    await set(suggestionsRef, null)
  } catch (error) {
    console.error('Error clearing suggestions:', error)
  }
}

// Voting
export const submitVote = async (roomCode, odId, voteNumber) => {
  if (!database) return
  
  const voteRef = ref(database, `rooms/${roomCode}/gameState/attributeVotes/${odId}`)
  try {
    await set(voteRef, voteNumber)
  } catch (error) {
    console.error('Error submitting vote:', error)
  }
}

export const clearVotes = async (roomCode) => {
  if (!database) return
  
  const votesRef = ref(database, `rooms/${roomCode}/gameState/attributeVotes`)
  try {
    await set(votesRef, null)
  } catch (error) {
    console.error('Error clearing votes:', error)
  }
}

// Conversation updates
export const addConversationMessage = async (roomCode, message) => {
  if (!database) return
  
  const convRef = ref(database, `rooms/${roomCode}/gameState/conversation`)
  try {
    await push(convRef, message)
  } catch (error) {
    console.error('Error adding conversation message:', error)
  }
}

export const clearConversation = async (roomCode) => {
  if (!database) return
  
  const convRef = ref(database, `rooms/${roomCode}/gameState/conversation`)
  try {
    await set(convRef, null)
  } catch (error) {
    console.error('Error clearing conversation:', error)
  }
}

// Sentiment categories
export const updateSentimentCategories = async (roomCode, categories) => {
  if (!database) return
  
  const sentimentRef = ref(database, `rooms/${roomCode}/gameState/sentimentCategories`)
  try {
    await set(sentimentRef, categories)
  } catch (error) {
    console.error('Error updating sentiment categories:', error)
  }
}

// Delete room
export const deleteRoom = async (roomCode) => {
  if (!database) return
  
  const roomRef = ref(database, `rooms/${roomCode}`)
  try {
    await remove(roomRef)
  } catch (error) {
    console.error('Error deleting room:', error)
  }
}

// Generate a unique player ID
export const generatePlayerId = () => {
  return 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

export { database }
