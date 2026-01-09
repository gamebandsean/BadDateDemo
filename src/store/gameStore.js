import { create } from 'zustand'
import { daters } from '../data/daters'

// Initial Avatar state - starts with generic attributes so conversation can flow
const initialAvatar = {
  name: 'Avatar',
  age: 27,
  occupation: 'Professional',
  attributes: [
    'seems friendly',
    'has a nice smile',
    'appears well-dressed',
  ],
  personality: 'A pleasant person with enough baseline traits to hold a conversation, waiting to be shaped by the crowd.',
}

export const useGameStore = create((set, get) => ({
  // Game phase: 'lobby' | 'matchmaking' | 'chatting' | 'smalltalk' | 'voting' | 'applying' | 'hotseat' | 'results'
  phase: 'lobby',
  
  // Daters - now using rich character data
  daters: daters,
  currentDaterIndex: 0,
  selectedDater: null,
  
  // Chat phase
  chatMessages: [],
  discoveredTraits: [], // Traits revealed through conversation
  
  // Date phase
  avatar: { ...initialAvatar },
  dateConversation: [],
  compatibility: 50,
  dateTimer: 300, // 5 minutes in seconds
  
  // Attribute submission & voting
  submittedAttributes: [],
  attributeVotes: {},
  appliedAttributes: [],
  latestAttribute: null, // Most recently added attribute (for special reactions)
  latestAttributeReactionsLeft: 0, // How many heightened Dater reactions remain (1-2)
  attributeCooldown: false, // 10 second cooldown between attributes
  
  // Hot seat
  hotSeatPlayer: null,
  hotSeatAttribute: null,
  
  // Players (for demo, we'll simulate)
  players: [
    { id: 1, name: 'Player 1', isHotSeat: false },
    { id: 2, name: 'Player 2', isHotSeat: false },
    { id: 3, name: 'Player 3', isHotSeat: false },
  ],
  currentPlayerId: 1,
  
  // Actions
  setPhase: (phase) => set({ phase }),
  
  // Matchmaking actions - SIMPLIFIED: first right swipe = instant match
  swipeDater: (daterId, direction) => {
    const { daters, currentDaterIndex } = get()
    
    if (direction === 'right' || direction === 'yes') {
      // Instant match! Go straight to chat
      const matchedDater = daters.find(d => d.id === daterId)
      set({ 
        selectedDater: matchedDater, 
        phase: 'chatting', 
        chatMessages: [] 
      })
    } else {
      // Swiped left - move to next card
      if (currentDaterIndex < daters.length - 1) {
        set({ currentDaterIndex: currentDaterIndex + 1 })
      } else {
        // Wrapped around - go back to first
        set({ currentDaterIndex: 0 })
      }
    }
  },
  
  // Legacy function for compatibility
  selectFinalDater: (daterId) => {
    const { daters } = get()
    const selected = daters.find(d => d.id === daterId)
    set({ selectedDater: selected, phase: 'chatting', chatMessages: [] })
  },
  
  // Chat actions
  addChatMessage: (message, isPlayer = true) => {
    const { chatMessages, selectedDater } = get()
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: isPlayer ? 'player' : selectedDater.name,
      isPlayer: isPlayer,
      timestamp: new Date(),
    }
    set({ chatMessages: [...chatMessages, newMessage] })
  },
  
  addDiscoveredTrait: (trait) => {
    const { discoveredTraits } = get()
    // Avoid duplicates
    if (!discoveredTraits.includes(trait)) {
      set({ discoveredTraits: [...discoveredTraits, trait] })
    }
  },
  
  startDate: () => {
    set({ phase: 'smalltalk', dateConversation: [], submittedAttributes: [] })
  },
  
  // Date conversation
  addDateMessage: (speaker, message) => {
    const { dateConversation } = get()
    set({
      dateConversation: [
        ...dateConversation,
        { id: Date.now(), speaker, message, timestamp: new Date() },
      ],
    })
  },
  
  // Attribute submission - SINGLE PLAYER: immediately apply with cooldown
  submitAttribute: (attribute) => {
    const { avatar, appliedAttributes, attributeCooldown } = get()
    
    // Check cooldown
    if (attributeCooldown) return false
    
    // Immediately apply the attribute to the avatar
    set({
      avatar: {
        ...avatar,
        attributes: [...avatar.attributes, attribute],
      },
      appliedAttributes: [...appliedAttributes, attribute],
      latestAttribute: attribute, // Track for special reactions
      latestAttributeReactionsLeft: 2, // Dater gets 1-2 heightened reactions
      phase: 'applying', // Brief visual feedback
      attributeCooldown: true, // Start 10 second cooldown
    })
    
    // Return to small talk after brief delay
    setTimeout(() => set({ phase: 'smalltalk' }), 1500)
    
    // Clear cooldown after 10 seconds
    setTimeout(() => set({ attributeCooldown: false }), 10000)
    
    return true
  },
  
  // Called after Dater speaks to decrement heightened reaction counter
  consumeDaterReaction: () => {
    const { latestAttributeReactionsLeft } = get()
    if (latestAttributeReactionsLeft > 0) {
      const newCount = latestAttributeReactionsLeft - 1
      set({ 
        latestAttributeReactionsLeft: newCount,
        // Clear latestAttribute when no reactions left
        latestAttribute: newCount === 0 ? null : get().latestAttribute,
      })
    }
  },
  
  // Legacy voting functions (kept for compatibility, not used in single player)
  voteForAttribute: (attributeId) => {
    // No-op in single player mode
  },
  
  applyTopAttributes: () => {
    // No-op in single player mode
  },
  
  // Hot seat
  selectRandomHotSeat: () => {
    const { players } = get()
    const randomPlayer = players[Math.floor(Math.random() * players.length)]
    set({ hotSeatPlayer: randomPlayer })
  },
  
  applyHotSeatAttribute: (attribute) => {
    const { avatar, appliedAttributes } = get()
    set({
      avatar: {
        ...avatar,
        attributes: [...avatar.attributes, attribute],
      },
      appliedAttributes: [...appliedAttributes, attribute],
      hotSeatAttribute: attribute,
      phase: 'smalltalk',
    })
  },
  
  // Compatibility
  updateCompatibility: (change) => {
    const { compatibility } = get()
    const newCompat = Math.max(0, Math.min(100, compatibility + change))
    set({ compatibility: newCompat })
  },
  
  // Timer
  tickTimer: () => {
    const { dateTimer } = get()
    if (dateTimer > 0) {
      set({ dateTimer: dateTimer - 1 })
    } else {
      set({ phase: 'results' })
    }
  },
  
  // Reset game
  resetGame: () => {
    set({
      phase: 'lobby',
      currentDaterIndex: 0,
      selectedDater: null,
      chatMessages: [],
      avatar: { ...initialAvatar },
      dateConversation: [],
      compatibility: 50,
      dateTimer: 300,
      submittedAttributes: [],
      attributeVotes: {},
      appliedAttributes: [],
      hotSeatPlayer: null,
      hotSeatAttribute: null,
    })
  },
}))
