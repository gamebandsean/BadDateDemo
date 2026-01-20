import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { isFirebaseAvailable, createRoom, joinRoom, generatePlayerId, subscribeToAvailableRooms } from '../services/firebase'
import './LiveLobby.css'

// Live Mode entry screen - Room Browser Version

function LiveLobby() {
  const setPhase = useGameStore((state) => state.setPhase)
  const setUsername = useGameStore((state) => state.setUsername)
  const setRoomCode = useGameStore((state) => state.setRoomCode)
  const setIsHost = useGameStore((state) => state.setIsHost)
  const setPlayerId = useGameStore((state) => state.setPlayerId)
  const setSelectedDater = useGameStore((state) => state.setSelectedDater)
  const setPlayers = useGameStore((state) => state.setPlayers)
  const daters = useGameStore((state) => state.daters)
  
  const [view, setView] = useState('main') // 'main', 'host', 'join'
  const [availableRooms, setAvailableRooms] = useState([])
  const [username, setUsernameLocal] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [firebaseReady, setFirebaseReady] = useState(isFirebaseAvailable())
  
  useEffect(() => {
    // Check again after a short delay in case Firebase is still initializing
    const timer = setTimeout(() => {
      setFirebaseReady(isFirebaseAvailable())
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
  // Subscribe to available rooms when in join view
  useEffect(() => {
    if (view === 'join' && firebaseReady) {
      const unsubscribe = subscribeToAvailableRooms((rooms) => {
        setAvailableRooms(rooms)
      })
      return () => unsubscribe()
    }
  }, [view, firebaseReady])
  
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }
  
  const handleCreate = async () => {
    setIsLoading(true)
    setError('')
    
    const roomCode = generateRoomCode()
    const playerName = username.trim() || `Player${Math.floor(Math.random() * 1000)}`
    const odId = generatePlayerId()
    const randomDater = daters[Math.floor(Math.random() * daters.length)]
    
    if (firebaseReady) {
      const success = await createRoom(roomCode, {
        username: playerName,
        odId: odId,
        dater: randomDater,
        avatar: { attributes: [] }
      })
      
      if (!success) {
        setError('Failed to create room. Try again.')
        setIsLoading(false)
        return
      }
    }
    
    // Update local state
    setUsername(playerName)
    setRoomCode(roomCode)
    setIsHost(true)
    setPlayerId(odId)
    setSelectedDater(randomDater)
    setPlayers([{ id: odId, username: playerName, isHost: true }])
    setPhase('live-game-lobby')
    setIsLoading(false)
  }
  
  const handleJoinRoom = async (roomCode) => {
    if (!username.trim()) {
      setError('Please enter your name first')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    const playerName = username.trim()
    const odId = generatePlayerId()
    
    if (firebaseReady) {
      const result = await joinRoom(roomCode, {
        username: playerName,
        odId: odId
      })
      
      if (!result.success) {
        setError(result.error || 'Failed to join room')
        setIsLoading(false)
        return
      }
      
      // Set dater from room data
      if (result.roomData?.dater) {
        setSelectedDater(result.roomData.dater)
      }
    }
    
    // Update local state
    setUsername(playerName)
    setRoomCode(roomCode)
    setIsHost(false)
    setPlayerId(odId)
    setPhase('live-game-lobby')
    setIsLoading(false)
  }

  // Main view - Choose Host or Join
  if (view === 'main') {
    return (
      <div className="live-lobby">
        <motion.div 
          className="live-lobby-card"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="live-lobby-header">
            <button 
              className="back-btn"
              onClick={() => setPhase('lobby')}
            >
              ← Back
            </button>
            <h2 className="live-lobby-title">
              <span className="title-icon">📺</span>
              Live Mode
            </h2>
            <p className="live-lobby-subtitle">Play with friends in real-time!</p>
          </div>
          
          {!firebaseReady && (
            <div className="firebase-warning">
              ⚠️ Multiplayer unavailable - Firebase not configured
            </div>
          )}
          
          {/* Username Input */}
          <div className="username-section">
            <label className="input-label">Your Name</label>
            <input
              type="text"
              className="username-input"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsernameLocal(e.target.value)}
              maxLength={15}
            />
          </div>
          
          {/* Main Action Buttons */}
          <div className="main-buttons">
            <motion.button
              className="mode-btn create-btn"
              onClick={() => setView('host')}
              disabled={!firebaseReady}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-icon">✨</span>
              <span className="btn-text">Host a Date</span>
            </motion.button>
            
            <motion.button
              className="mode-btn join-btn"
              onClick={() => setView('join')}
              disabled={!firebaseReady}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="btn-icon">🔗</span>
              <span className="btn-text">Join a Date</span>
            </motion.button>
          </div>
          
          <div className="live-info">
            <div className="info-item">
              <span className="info-icon">👥</span>
              <span>2-20 players</span>
            </div>
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <span>~10 min per game</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Host view - Create room
  if (view === 'host') {
    return (
      <div className="live-lobby">
        <motion.div 
          className="live-lobby-card"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="live-lobby-header">
            <button 
              className="back-btn"
              onClick={() => setView('main')}
            >
              ← Back
            </button>
            <h2 className="live-lobby-title">
              <span className="title-icon">✨</span>
              Host a Date
            </h2>
            <p className="live-lobby-subtitle">Create a room for others to join</p>
          </div>
          
          {/* Username Input */}
          <div className="username-section">
            <label className="input-label">Your Name</label>
            <input
              type="text"
              className="username-input"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsernameLocal(e.target.value)}
              maxLength={15}
            />
          </div>
          
          {error && (
            <motion.div 
              className="error-message-inline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
          
          <motion.button
            className="mode-btn create-btn full-width"
            onClick={handleCreate}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="btn-icon">🎬</span>
            <span className="btn-text">{isLoading ? 'Creating...' : 'Create Room'}</span>
          </motion.button>
          
          <p className="host-hint">
            Once created, other players can see and join your room from the "Join a Date" screen.
          </p>
        </motion.div>
      </div>
    )
  }

  // Join view - Room browser
  if (view === 'join') {
    return (
      <div className="live-lobby">
        <motion.div 
          className="live-lobby-card room-browser-card"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="live-lobby-header">
            <button 
              className="back-btn"
              onClick={() => setView('main')}
            >
              ← Back
            </button>
            <h2 className="live-lobby-title">
              <span className="title-icon">🔗</span>
              Join a Date
            </h2>
            <p className="live-lobby-subtitle">Select a room to join</p>
          </div>
          
          {/* Username Input */}
          <div className="username-section">
            <label className="input-label">Your Name</label>
            <input
              type="text"
              className="username-input"
              placeholder="Enter your name first..."
              value={username}
              onChange={(e) => {
                setUsernameLocal(e.target.value)
                setError('')
              }}
              maxLength={15}
            />
          </div>
          
          {error && (
            <motion.div 
              className="error-message-inline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
          
          {/* Room List */}
          <div className="room-browser">
            <div className="room-browser-header">
              <span>Available Rooms</span>
              <span className="room-count">{availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''}</span>
            </div>
            
            <div className="room-list">
              {availableRooms.length === 0 ? (
                <div className="no-rooms">
                  <span className="no-rooms-icon">🔍</span>
                  <p>No rooms available</p>
                  <p className="no-rooms-hint">Ask a friend to host, or create your own!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {availableRooms.map((room, index) => (
                    <motion.button
                      key={room.code}
                      className="room-item"
                      onClick={() => handleJoinRoom(room.code)}
                      disabled={isLoading || !username.trim()}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="room-info">
                        <div className="room-host">
                          <span className="host-icon">👑</span>
                          <span className="host-name">{room.host}'s Room</span>
                        </div>
                        <div className="room-details">
                          <span className="room-dater">💕 Dating: {room.daterName}</span>
                          <span className="room-players">👥 {room.playerCount}/20</span>
                        </div>
                      </div>
                      <div className="join-arrow">→</div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
          
          {!username.trim() && availableRooms.length > 0 && (
            <p className="join-hint">Enter your name above to join a room</p>
          )}
        </motion.div>
      </div>
    )
  }

  return null
}

export default LiveLobby
