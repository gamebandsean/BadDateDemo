/**
 * Expression Service - Generates character portraits with dynamic expressions
 * 
 * Uses DiceBear avataaars style with emotion-based facial features
 * Images are preloaded and cached to prevent blank images during emotion changes
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

// Cache for preloaded images - stores loaded image URLs
// Key format: "character-emotion" -> URL (only added when fully loaded)
const imageCache = new Map()

// Track loading state
const loadingPromises = new Map()
let preloadComplete = {
  maya: false,
  avatar: false,
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
 * Load a single image and cache it
 * @param {string} character - Character identifier
 * @param {string} emotion - Emotion name
 * @returns {Promise<string>} - Resolves with URL when loaded
 */
function loadAndCacheImage(character, emotion) {
  const cacheKey = `${character}-${emotion}`
  
  // Already cached
  if (imageCache.has(cacheKey)) {
    return Promise.resolve(imageCache.get(cacheKey))
  }
  
  // Already loading
  if (loadingPromises.has(cacheKey)) {
    return loadingPromises.get(cacheKey)
  }
  
  const url = getExpressionPortrait(character, emotion)
  
  const loadPromise = new Promise((resolve, _reject) => {
    const img = new Image()
    
    img.onload = () => {
      imageCache.set(cacheKey, url)
      loadingPromises.delete(cacheKey)
      resolve(url)
    }
    
    img.onerror = (err) => {
      console.error(`❌ Failed to load ${character} ${emotion}:`, err)
      loadingPromises.delete(cacheKey)
      // Resolve with neutral as fallback
      const fallbackUrl = getExpressionPortrait(character, 'neutral')
      resolve(fallbackUrl)
    }
    
    img.src = url
  })
  
  loadingPromises.set(cacheKey, loadPromise)
  return loadPromise
}

/**
 * Preload all expression variants for a character
 * Returns a promise that resolves when ALL images are loaded
 * @param {string} character - Character identifier
 * @returns {Promise<void>}
 */
export async function preloadExpressions(character) {
  const emotions = Object.keys(EXPRESSION_MAP)
  
  console.log(`🖼️ Starting preload of ${emotions.length} expressions for ${character}...`)
  
  const loadPromises = emotions.map(emotion => loadAndCacheImage(character, emotion))
  
  try {
    await Promise.all(loadPromises)
    preloadComplete[character] = true
    console.log(`✅ Preloaded all ${emotions.length} expressions for ${character}`)
  } catch (error) {
    console.error(`❌ Error preloading expressions for ${character}:`, error)
  }
}

/**
 * Check if preloading is complete for a character
 * @param {string} character - Character identifier
 * @returns {boolean}
 */
export function isPreloadComplete(character) {
  return preloadComplete[character] || false
}

/**
 * Get a cached portrait URL, falling back to neutral if not loaded
 * This ensures we never show a blank image
 * @param {string} character - Character identifier
 * @param {string} emotion - Emotional state
 * @returns {string} - Cached URL or neutral fallback
 */
export function getCachedPortrait(character, emotion = 'neutral') {
  const cacheKey = `${character}-${emotion}`
  
  // Return cached URL if available
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)
  }
  
  // Try neutral fallback
  const neutralKey = `${character}-neutral`
  if (imageCache.has(neutralKey)) {
    // Start loading the requested emotion in the background
    loadAndCacheImage(character, emotion)
    return imageCache.get(neutralKey)
  }
  
  // Start loading both in background, return URL (may briefly show loading)
  loadAndCacheImage(character, emotion)
  loadAndCacheImage(character, 'neutral')
  
  // Return the URL anyway - it will load
  return getExpressionPortrait(character, emotion)
}

/**
 * Get Maya's portrait - uses cache to prevent blank images
 * @param {string} emotion - Emotional state
 * @returns {string} - Cached avatar URL
 */
export function getMayaPortraitCached(emotion = 'neutral') {
  return getCachedPortrait('maya', emotion)
}

/**
 * Get Avatar's portrait - uses cache to prevent blank images
 * @param {string} emotion - Emotional state
 * @returns {string} - Cached avatar URL
 */
export function getAvatarPortraitCached(emotion = 'neutral') {
  return getCachedPortrait('avatar', emotion)
}

/**
 * Map any emotion string to the closest reactionImages category.
 * Daters with custom portraits have 5 images: neutral, loves, likes, dislikes, dealbreakers.
 * This maps the full range of game emotions to one of those 5.
 */
const EMOTION_TO_REACTION_CATEGORY = {
  // Direct matches
  neutral: 'neutral',
  loves: 'loves',
  likes: 'likes',
  dislikes: 'dislikes',
  dealbreakers: 'dealbreakers',
  // Positive emotions → likes
  happy: 'likes',
  excited: 'likes',
  interested: 'likes',
  curious: 'likes',
  confident: 'likes',
  flirty: 'likes',
  attracted: 'loves',
  // Negative-mild → dislikes
  uncomfortable: 'dislikes',
  uncertain: 'dislikes',
  confused: 'dislikes',
  nervous: 'dislikes',
  sad: 'dislikes',
  disappointed: 'dislikes',
  // Negative-strong → dealbreakers
  angry: 'dealbreakers',
  furious: 'dealbreakers',
  scared: 'dealbreakers',
  horrified: 'dealbreakers',
  shocked: 'dislikes',
}

/**
 * Get the portrait URL for ANY dater based on their current emotion.
 * - If the dater has `reactionImages` (custom portraits), maps the emotion to the
 *   nearest category (neutral/loves/likes/dislikes/dealbreakers) and returns that image.
 * - Otherwise, falls back to the DiceBear expression system.
 *
 * @param {object} dater - The full dater object from daters.js
 * @param {string} emotion - Current emotional state
 * @returns {string} - Image URL for the dater's current expression
 */
export function getDaterPortrait(dater, emotion = 'neutral') {
  // If the dater has custom reaction images, use them
  if (dater?.reactionImages) {
    const category = EMOTION_TO_REACTION_CATEGORY[emotion] || 'neutral'
    return dater.reactionImages[category] || dater.reactionImages.neutral || dater.photo
  }

  // Fallback: DiceBear system for legacy daters
  const characterKey = dater?.name?.toLowerCase() || 'maya'
  if (CHARACTER_SEEDS[characterKey]) {
    return getCachedPortrait(characterKey, emotion)
  }

  // Last resort: return the dater's static photo
  return dater?.photo || getCachedPortrait('maya', emotion)
}

/**
 * Preload a dater's reaction images (for daters with custom portraits).
 * Loads all 5 reaction images into the browser cache.
 *
 * @param {object} dater - The full dater object
 * @returns {Promise<void>}
 */
export async function preloadDaterImages(dater) {
  if (!dater?.reactionImages) {
    // No custom images — use the DiceBear preload path
    const key = dater?.name?.toLowerCase() || 'maya'
    if (CHARACTER_SEEDS[key]) {
      return preloadExpressions(key)
    }
    return
  }

  const urls = Object.values(dater.reactionImages)
  console.log(`🖼️ Preloading ${urls.length} reaction images for ${dater.name}...`)

  const loadPromises = urls.map(url => new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { resolve(url) }
    img.onerror = () => {
      console.error(`❌ Failed to preload ${url}`)
      resolve(url)
    }
    img.src = url
  }))

  await Promise.all(loadPromises)
  console.log(`✅ All reaction images preloaded for ${dater.name}`)
}

/**
 * Get all available emotions
 * @returns {string[]} - List of emotion names
 */
export function getAvailableEmotions() {
  return Object.keys(EXPRESSION_MAP)
}

/**
 * Wait for all preloading to complete
 * @returns {Promise<void>}
 */
export async function waitForPreload() {
  const characters = ['maya', 'avatar']
  await Promise.all(characters.map(c => {
    if (!preloadComplete[c]) {
      return preloadExpressions(c)
    }
    return Promise.resolve()
  }))
}

// Export the expression map for reference
export { EXPRESSION_MAP, CHARACTER_SEEDS, CHARACTER_BACKGROUNDS }
