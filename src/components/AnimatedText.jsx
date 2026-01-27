import { useState, useEffect, useMemo, useRef } from 'react'

/**
 * Emotion-to-speed mapping for LETTER-BY-LETTER animation
 * Maps emotional states to character delays (in ms)
 * 
 * Normal speaking: ~150 words/min, ~5 chars/word = ~750 chars/min = 80ms per char
 * Fast speaking: ~200 words/min = ~60ms per char
 * Slow/dramatic: ~100 words/min = ~120ms per char
 */
const EMOTION_SPEEDS = {
  // Positive/energetic emotions - FAST
  excited: 25,
  happy: 30,
  flirty: 35,
  loves: 30,
  attracted: 35,
  
  // Neutral/normal emotions - MEDIUM
  neutral: 40,
  interested: 38,
  likes: 40,
  curious: 38,
  confident: 35,
  
  // Uncertain/processing emotions - SLOWER
  confused: 60,
  thinking: 55,
  uncertain: 55,
  uncomfortable: 50,
  dislikes: 45,
  
  // Negative/intense emotions - SLOW (dramatic effect)
  scared: 70,
  horrified: 80,
  shocked: 50,
  dealbreakers: 75,
  angry: 30, // Angry is clipped and fast
  furious: 28,
  
  // Sad emotions - SLOW
  sad: 65,
  disappointed: 55,
  nervous: 50,
  
  // Default
  default: 40,
}

/**
 * Emotion-to-color mapping
 * Colors only - NO SCALE CHANGES (font size stays consistent)
 */
const EMOTION_COLORS = {
  // Positive
  excited: '#FFD700', // Gold
  happy: '#FFC107', // Warm yellow
  loves: '#FF69B4', // Hot pink
  attracted: '#FF6B9D', // Soft pink
  flirty: '#FF99AA', // Flirty pink
  likes: '#66BB66', // Soft green
  
  // Negative/intense
  angry: '#FF4444', // Bright red
  furious: '#CC0000', // Dark red
  scared: '#9966FF', // Purple
  horrified: '#8B0000', // Dark red
  dealbreakers: '#DC143C', // Crimson
  shocked: '#FF6600', // Orange
  
  // Uncertain
  nervous: '#88AACC', // Muted blue
  sad: '#6699AA', // Sad blue
  uncomfortable: '#AA9988', // Muted brown
  dislikes: '#CC8866', // Muted orange
  
  // Neutral - no color change
  neutral: null,
  curious: null,
  interested: null,
  confident: null,
  confused: null,
  uncertain: null,
  thinking: null,
  
  default: null,
}

/**
 * AnimatedText - Animates text LETTER BY LETTER
 * Speed determined by emotional state
 * Font size is ALWAYS consistent (no scaling)
 * 
 * @param {string} text - The full text to animate
 * @param {string} emotion - Emotional state that affects speed and color
 * @param {number} charDelay - Override delay between characters (optional)
 * @param {function} onComplete - Callback when animation completes
 */
export default function AnimatedText({ text, emotion = 'neutral', charDelay, onComplete }) {
  const [visibleCharCount, setVisibleCharCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef(null)
  const textRef = useRef(text)
  
  // Calculate delay based on emotion (or use override)
  const calculatedDelay = useMemo(() => {
    if (charDelay !== undefined) return charDelay
    return EMOTION_SPEEDS[emotion] || EMOTION_SPEEDS.default
  }, [emotion, charDelay])
  
  // Get color for this emotion
  const textColor = useMemo(() => {
    return EMOTION_COLORS[emotion] || EMOTION_COLORS.default
  }, [emotion])
  
  // Store current text in ref for interval access
  useEffect(() => {
    textRef.current = text
  }, [text])
  
  // Animation effect - runs when text changes
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Reset state
    setVisibleCharCount(0)
    setIsComplete(false)
    
    if (!text || text.length === 0) return
    
    const totalChars = text.length
    let count = 0
    
    // Start animating characters one by one
    intervalRef.current = setInterval(() => {
      count++
      if (count <= totalChars) {
        setVisibleCharCount(count)
      } else {
        // All characters shown
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setIsComplete(true)
        if (onComplete) onComplete()
      }
    }, calculatedDelay)
    
    // Cleanup on unmount or text change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [text, calculatedDelay, onComplete])
  
  if (!text) return null
  
  // Get the visible portion of text
  const visibleText = text.substring(0, visibleCharCount)
  // Get the remaining (hidden) text - this maintains the size
  const hiddenText = text.substring(visibleCharCount)
  
  return (
    <span className="animated-text" style={{ position: 'relative', display: 'inline' }}>
      {/* Visible animated text */}
      <span 
        style={{ 
          color: textColor || 'inherit',
        }}
      >
        {visibleText}
      </span>
      {/* Hidden remaining text - maintains bubble size for FULL text */}
      <span 
        style={{ 
          visibility: 'hidden',
        }}
      >
        {hiddenText}
      </span>
    </span>
  )
}

// Export for use in other components
export { EMOTION_SPEEDS, EMOTION_COLORS }
