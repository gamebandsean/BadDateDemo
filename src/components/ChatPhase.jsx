import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { getDaterChatResponse, getFallbackDaterResponse } from '../services/llmService'
import './ChatPhase.css'

function ChatPhase() {
  const { selectedDater, chatMessages, addChatMessage, startDate } = useGameStore()
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const greetingSentRef = useRef(false)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])
  
  // Initial greeting from Dater
  useEffect(() => {
    if (chatMessages.length === 0 && !greetingSentRef.current) {
      greetingSentRef.current = true
      setTimeout(() => {
        addChatMessage(`Hey! 👋 Nice to match with you! I'm ${selectedDater.name}. What brings you to Bad Date tonight?`, false)
      }, 1000)
    }
  }, [])
  
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return
    
    const playerMsg = inputValue.trim()
    addChatMessage(playerMsg, true)
    setInputValue('')
    
    // Show typing indicator
    setIsTyping(true)
    
    // Try LLM response first, fallback to hardcoded
    try {
      // Build conversation history for LLM
      const conversationHistory = [
        ...chatMessages,
        { text: playerMsg, isPlayer: true }
      ]
      
      const llmResponse = await getDaterChatResponse(selectedDater, conversationHistory)
      
      if (llmResponse) {
        setIsTyping(false)
        addChatMessage(llmResponse, false)
      } else {
        // Fallback to hardcoded responses
        setTimeout(() => {
          setIsTyping(false)
          const fallbackResponse = getFallbackDaterResponse(selectedDater, playerMsg)
          addChatMessage(fallbackResponse, false)
        }, 1000)
      }
    } catch (error) {
      console.error('Error getting LLM response:', error)
      // Fallback
      setTimeout(() => {
        setIsTyping(false)
        const fallbackResponse = getFallbackDaterResponse(selectedDater, playerMsg)
        addChatMessage(fallbackResponse, false)
      }, 1000)
    }
  }
  
  return (
    <div className="chat-phase">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-profile">
            <img src={selectedDater.photo} alt={selectedDater.name} />
            <div className="profile-info">
              <h3>{selectedDater.name}</h3>
              <span className="online-status">
                <span className="status-dot" /> Online
              </span>
            </div>
          </div>
          <div className="chat-actions">
            <motion.button
              className="btn btn-primary"
              onClick={startDate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Start the Date!
            </motion.button>
          </div>
        </div>
        
        <div className="chat-messages">
          <div className="chat-intro">
            <span className="match-badge">🎉 It's a Match!</span>
            <p>Chat with {selectedDater.name} to learn more about them before your date. The more you discover, the better you can shape your avatar!</p>
          </div>
          
          <AnimatePresence>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`message ${msg.sender === 'player' ? 'sent' : 'received'}`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {msg.sender !== 'player' && (
                  <img src={selectedDater.photo} alt="" className="message-avatar" />
                )}
                <div className="message-content">
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div 
              className="message received typing-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img src={selectedDater.photo} alt="" className="message-avatar" />
              <div className="message-content">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Ask ${selectedDater.name} something...`}
            autoFocus
            disabled={isTyping}
          />
          <motion.button
            type="submit"
            className="send-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!inputValue.trim() || isTyping}
          >
            ➤
          </motion.button>
        </form>
      </div>
      
      <div className="chat-tips">
        <h4>💡 Pro Tips</h4>
        <ul>
          <li>Ask about their job, interests, and dealbreakers</li>
          <li>Discover what they're looking for in a partner</li>
          <li>Use this intel to shape your avatar later!</li>
        </ul>
        
        <div className="api-status">
          {import.meta.env.VITE_ANTHROPIC_API_KEY ? (
            <span className="status-active">🤖 AI-Powered Responses</span>
          ) : (
            <span className="status-fallback">📝 Demo Mode (add API key for AI)</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPhase
