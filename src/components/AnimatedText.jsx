import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Emotion-to-speed mapping
 * Maps emotional states to word animation delays (in ms)
 * Lower = faster speech, Higher = slower speech
 */
const EMOTION_SPEEDS = {
  // Positive/energetic emotions - FAST
  excited: 30,
  happy: 35,
  flirty: 40,
  loves: 35,
  attracted: 40,
  
  // Neutral/normal emotions - MEDIUM
  neutral: 50,
  interested: 45,
  likes: 50,
  curious: 45,
  
  // Uncertain/processing emotions - SLOWER
  confused: 80,
  thinking: 70,
  uncertain: 75,
  uncomfortable: 65,
  dislikes: 60,
  
  // Negative/intense emotions - VERY SLOW (dramatic effect)
  scared: 100,
  horrified: 110,
  shocked: 90,
  dealbreakers: 95,
  angry: 55, // Angry is clipped and fast, actually
  
  // Default
  default: 50,
}

/**
 * AnimatedText - Animates text in word by word
 * Speed adjusts based on emotional state
 * 
 * @param {string} text - The text to animate
 * @param {string} emotion - Emotional state that affects speed
 * @param {number} wordDelay - Override delay between words (optional)
 * @param {function} onComplete - Callback when animation completes
 */
export default function AnimatedText({ text, emotion = 'neutral', wordDelay, onComplete }) {
  const [visibleWords, setVisibleWords] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  
  // Calculate delay based on emotion (or use override)
  const calculatedDelay = useMemo(() => {
    if (wordDelay !== undefined) return wordDelay
    return EMOTION_SPEEDS[emotion] || EMOTION_SPEEDS.default
  }, [emotion, wordDelay])
  
  // Split text into words, preserving punctuation
  const words = text ? text.split(/(\s+)/).filter(word => word.trim() !== '') : []
  
  useEffect(() => {
    // Reset when text changes
    setVisibleWords([])
    setIsComplete(false)
    
    if (!text || words.length === 0) return
    
    let currentIndex = 0
    
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setVisibleWords(prev => [...prev, words[currentIndex]])
        currentIndex++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        if (onComplete) onComplete()
      }
    }, calculatedDelay)
    
    return () => clearInterval(interval)
  }, [text, calculatedDelay]) // Re-run when text or delay changes
  
  if (!text) return null
  
  return (
    <span className="animated-text">
      {visibleWords.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'inline' }}
        >
          {word}{' '}
        </motion.span>
      ))}
      {/* Invisible placeholder to maintain bubble size */}
      <span style={{ visibility: 'hidden', position: 'absolute' }}>
        {text}
      </span>
    </span>
  )
}

// Export for use in other components
export { EMOTION_SPEEDS }
