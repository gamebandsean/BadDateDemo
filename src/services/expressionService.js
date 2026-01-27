/**
 * Expression Service - Generates character portraits with dynamic expressions
 * 
 * Uses DiceBear avataaars style with emotion-based facial features
 */

// Base URLs for characters
const CHARACTER_SEEDS = {
  maya: 'MayaArchitect',
  avatar: 'PlayerAvatar',
  leo: 'LeoArtist',
  kickflip: 'KickflipXtreme',
}

const CHARACTER_BACKGROUNDS = {
  maya: 'b6e3f4',
  avatar: 'c0aede',
  leo: 'ffd5dc',
  kickflip: 'ffdfbf',
}

/**
 * DiceBear avataaars expression mapping
 * Maps emotional states to mouth and eyebrow combinations
 */
const EXPRESSION_MAP = {
  // === HAPPY / POSITIVE ===
  happy: {
    mouth: 'smile',
    eyebrows: 'raisedExcited',
    eyes: 'happy',
  },
  excited: {
    mouth: 'smile',
    eyebrows: 'raisedExcited',
    eyes: 'surprised',
  },
  loves: {
    mouth: 'smile',
    eyebrows: 'raisedExcited',
    eyes: 'hearts',
  },
  attracted: {
    mouth: 'twinkle',
    eyebrows: 'default',
    eyes: 'hearts',
  },
  flirty: {
    mouth: 'twinkle',
    eyebrows: 'raisedExcited',
    eyes: 'wink',
  },
  
  // === INTERESTED / CURIOUS ===
  interested: {
    mouth: 'smile',
    eyebrows: 'upDown',
    eyes: 'default',
  },
  curious: {
    mouth: 'serious',
    eyebrows: 'upDown',
    eyes: 'default',
  },
  likes: {
    mouth: 'smile',
    eyebrows: 'default',
    eyes: 'happy',
  },
  
  // === NEUTRAL ===
  neutral: {
    mouth: 'default',
    eyebrows: 'default',
    eyes: 'default',
  },
  confident: {
    mouth: 'twinkle',
    eyebrows: 'default',
    eyes: 'default',
  },
  
  // === UNCOMFORTABLE / UNCERTAIN ===
  uncomfortable: {
    mouth: 'grimace',
    eyebrows: 'sadConcerned',
    eyes: 'side',
  },
  uncertain: {
    mouth: 'concerned',
    eyebrows: 'upDown',
    eyes: 'side',
  },
  confused: {
    mouth: 'disbelief',
    eyebrows: 'upDown',
    eyes: 'dizzy',
  },
  nervous: {
    mouth: 'grimace',
    eyebrows: 'sadConcerned',
    eyes: 'default',
  },
  dislikes: {
    mouth: 'sad',
    eyebrows: 'flatNatural',
    eyes: 'roll',
  },
  
  // === NEGATIVE / INTENSE ===
  angry: {
    mouth: 'grimace',
    eyebrows: 'angry',
    eyes: 'squint',
  },
  furious: {
    mouth: 'screamOpen',
    eyebrows: 'angry',
    eyes: 'squint',
  },
  scared: {
    mouth: 'screamOpen',
    eyebrows: 'sadConcerned',
    eyes: 'surprised',
  },
  horrified: {
    mouth: 'screamOpen',
    eyebrows: 'sadConcerned',
    eyes: 'cry',
  },
  dealbreakers: {
    mouth: 'vomit',
    eyebrows: 'angry',
    eyes: 'xDizzy',
  },
  shocked: {
    mouth: 'disbelief',
    eyebrows: 'raisedExcited',
    eyes: 'surprised',
  },
  
  // === SAD ===
  sad: {
    mouth: 'sad',
    eyebrows: 'sadConcerned',
    eyes: 'cry',
  },
  disappointed: {
    mouth: 'sad',
    eyebrows: 'flatNatural',
    eyes: 'default',
  },
}

/**
 * Generate a DiceBear avatar URL with expression
 * @param {string} character - Character identifier (maya, avatar, leo, kickflip)
 * @param {string} emotion - Emotional state for expression
 * @param {object} options - Additional customization options
 * @returns {string} - Avatar URL with expression parameters
 */
export function getExpressionPortrait(character, emotion = 'neutral', options = {}) {
  const seed = options.seed || CHARACTER_SEEDS[character] || CHARACTER_SEEDS.avatar
  const backgroundColor = options.backgroundColor || CHARACTER_BACKGROUNDS[character] || 'c0aede'
  
  // Get expression features for this emotion
  const expression = EXPRESSION_MAP[emotion] || EXPRESSION_MAP.neutral
  
  // Build the URL with expression parameters
  const params = new URLSearchParams({
    seed,
    backgroundColor,
    mouth: expression.mouth,
    eyebrows: expression.eyebrows,
    eyes: expression.eyes,
  })
  
  return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`
}

/**
 * Get Maya's portrait with expression
 * @param {string} emotion - Emotional state
 * @returns {string} - Avatar URL
 */
export function getMayaPortrait(emotion = 'neutral') {
  return getExpressionPortrait('maya', emotion)
}

/**
 * Get the player's avatar portrait with expression
 * @param {string} emotion - Emotional state
 * @param {string} seed - Optional custom seed for unique avatar
 * @returns {string} - Avatar URL
 */
export function getAvatarPortrait(emotion = 'neutral', seed = null) {
  return getExpressionPortrait('avatar', emotion, seed ? { seed } : {})
}

/**
 * Preload all expression variants for a character (for faster switching)
 * @param {string} character - Character identifier
 */
export function preloadExpressions(character) {
  const emotions = Object.keys(EXPRESSION_MAP)
  
  emotions.forEach(emotion => {
    const url = getExpressionPortrait(character, emotion)
    const img = new Image()
    img.src = url
  })
  
  console.log(`🖼️ Preloaded ${emotions.length} expressions for ${character}`)
}

/**
 * Get all available emotions
 * @returns {string[]} - List of emotion names
 */
export function getAvailableEmotions() {
  return Object.keys(EXPRESSION_MAP)
}

// Export the expression map for reference
export { EXPRESSION_MAP, CHARACTER_SEEDS, CHARACTER_BACKGROUNDS }
