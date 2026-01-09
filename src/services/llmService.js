// LLM Service for Claude API integration
import { buildDaterAgentPrompt } from '../data/daters'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

/**
 * Call Claude API for a response
 */
export async function getChatResponse(messages, systemPrompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  
  if (!apiKey) {
    console.warn('No Anthropic API key found. Using fallback responses.')
    return null
  }
  
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('Claude API error:', JSON.stringify(error, null, 2))
      return null
    }
    
    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Error calling Claude API:', error)
    return null
  }
}

/**
 * Get Dater response in chat phase
 */
export async function getDaterChatResponse(dater, conversationHistory) {
  const systemPrompt = buildDaterAgentPrompt(dater, 'chat')
  
  // Convert conversation history to Claude format
  const messages = conversationHistory.map(msg => ({
    role: msg.isPlayer ? 'user' : 'assistant',
    content: msg.text,
  }))
  
  const response = await getChatResponse(messages, systemPrompt)
  return response
}

/**
 * Get Dater response during the date
 */
export async function getDaterDateResponse(dater, avatar, conversationHistory, latestAttribute = null) {
  const systemPrompt = buildDaterAgentPrompt(dater, 'date')
  
  // Add context about the Avatar's revealed attributes
  const avatarContext = avatar.attributes.length > 0
    ? `\n\nYOUR DATE'S REVEALED TRAITS SO FAR: ${avatar.attributes.join(', ')}. React to these naturally based on whether they align with what you're looking for or hit your dealbreakers.`
    : ''
  
  // Special instruction if a new attribute was just revealed
  const latestAttrContext = latestAttribute
    ? `\n\n🚨 BREAKING NEWS - YOUR DATE JUST REVEALED: "${latestAttribute}"

YOU MUST REACT TO THIS DIRECTLY AND DRAMATICALLY:
- This is a BIG moment - react with genuine shock, excitement, horror, fascination, or delight
- Actually acknowledge what they just said - don't ignore it!
- If it's weird/alarming (like "giant spider"), be visibly taken aback or intrigued
- If it's positive for you, show real excitement
- If it hits a dealbreaker, show visible concern or discomfort
- Your reaction should be 2-3x more intense than your normal responses
- Still keep it to 1-2 sentences, but make them COUNT`
    : ''
  
  const fullPrompt = systemPrompt + avatarContext + latestAttrContext
  
  // Convert conversation history to Claude format
  let messages = conversationHistory.map(msg => ({
    role: msg.speaker === 'dater' ? 'assistant' : 'user',
    content: msg.message,
  }))
  
  // Claude requires at least one message - add a prompt if empty
  if (messages.length === 0) {
    messages = [{ role: 'user', content: 'The date just started. Say something to break the ice!' }]
  }
  
  // Ensure conversation ends with user message (Avatar's turn just happened)
  if (messages[messages.length - 1]?.role === 'assistant') {
    messages.push({ role: 'user', content: '...' })
  }
  
  const response = await getChatResponse(messages, fullPrompt)
  return response
}

/**
 * Get Avatar response during the date (for auto-conversation)
 */
export async function getAvatarDateResponse(avatar, dater, conversationHistory, latestAttribute = null) {
  const { name, age, occupation, attributes } = avatar
  
  const attributesList = attributes.length > 0 
    ? `YOUR TRAITS: ${attributes.join(', ')}`
    : 'You are a mystery - share generic pleasantries.'
  
  // Special instruction if a new attribute was just added
  const latestAttrInstruction = latestAttribute
    ? `\n\n⚠️ NEW TRAIT JUST ADDED: You just gained the trait "${latestAttribute}". Work this into your response SUBTLY and naturally - don't announce it, just let it color what you say. Be appropriate to the conversation flow.`
    : ''
  
  const systemPrompt = `You are ${name}, a ${age}-year-old ${occupation} on a first date with ${dater.name}.

${attributesList}

CONTEXT: You're on a first date at a nice restaurant. You're charming and engaged.

RULES:
- Keep responses VERY brief (1 short sentence only)
- Just speak naturally - avoid *action descriptions* like *smiles* or *leans in*
- Only use an action tag VERY rarely (once every 5+ messages at most)
- Answer questions concisely
- Occasionally ask a brief follow-up question
- Stay light - it's a first date!${latestAttrInstruction}`
  
  // Convert conversation history - from Avatar's perspective, Dater messages are "user"
  let messages = conversationHistory.map(msg => ({
    role: msg.speaker === 'avatar' ? 'assistant' : 'user',
    content: msg.message,
  }))
  
  // Claude requires at least one message - add a prompt if empty
  if (messages.length === 0) {
    messages = [{ role: 'user', content: 'Your date just said hello. Respond warmly!' }]
  }
  
  // Ensure conversation ends with user message (Dater's turn just happened)
  if (messages[messages.length - 1]?.role === 'assistant') {
    messages.push({ role: 'user', content: '...' })
  }
  
  const response = await getChatResponse(messages, systemPrompt)
  return response
}

/**
 * Fallback responses when API is not available - based on dater personality
 */
export function getFallbackDaterResponse(dater, playerMessage) {
  const lowerMsg = playerMessage.toLowerCase()
  const { talkingTraits, quirk, backstory, idealPartner, dealbreakers } = dater
  
  // Check if the message contains a question
  const isQuestion = lowerMsg.includes('?') || 
    lowerMsg.startsWith('what') || lowerMsg.startsWith('how') || 
    lowerMsg.startsWith('why') || lowerMsg.startsWith('do you') ||
    lowerMsg.startsWith('are you') || lowerMsg.startsWith('where') ||
    lowerMsg.startsWith('when') || lowerMsg.startsWith('who')
  
  // If not a question, redirect them to ask one
  if (!isQuestion) {
    const redirects = [
      "Haha that's nice! But hey, this is your chance to learn about ME. What do you want to know? 😉",
      "Interesting... but save the mystery for the date! Ask me something instead!",
      "Cool cool, but I'm more curious what questions you have for me!",
      "Enough about you for now 😄 What do you want to know about me?",
      "That's great but come on, ask me something! What are you curious about?",
    ]
    return redirects[Math.floor(Math.random() * redirects.length)]
  }
  
  // Generate response based on dater's personality
  if (lowerMsg.includes('job') || lowerMsg.includes('work') || lowerMsg.includes('do for')) {
    // Extract job info from backstory
    if (dater.name === 'Leo') {
      return "I'm a freelance graphic designer, but my real passion is painting. I left the corporate world behind to focus on what actually matters to me."
    } else if (dater.name === 'Maya') {
      return "I'm an architect. I design buildings, but honestly I find the design of conversations just as interesting."
    } else if (dater.name === 'Kickflip') {
      return "I'm a content creator! Extreme sports, stunts, anything that gets the adrenaline pumping. My channel's blowing up right now!"
    }
  }
  
  if (lowerMsg.includes('fun') || lowerMsg.includes('hobby') || lowerMsg.includes('free time')) {
    if (dater.name === 'Leo') {
      return "Painting, traveling, collecting experiences. I once spent a month in Portugal just painting sunsets. It was magical."
    } else if (dater.name === 'Maya') {
      return "I sketch buildings, read, and occasionally deconstruct romantic comedies for their logical flaws. It's more fun than it sounds."
    } else if (dater.name === 'Kickflip') {
      return "Parkour, surfing, BASE jumping - basically anything that could kill me! Last week I raced motorcycles through a canyon. SO sick!"
    }
  }
  
  if (lowerMsg.includes('looking for') || lowerMsg.includes('ideal') || lowerMsg.includes('type')) {
    return `Honestly? Someone who's ${idealPartner.slice(0, 2).join(' and ')}. That's what really matters to me.`
  }
  
  if (lowerMsg.includes('deal breaker') || lowerMsg.includes('hate') || lowerMsg.includes('can\'t stand')) {
    return `I really can't deal with ${dealbreakers[0]}. That's a non-starter for me.`
  }
  
  // Default responses based on talking traits
  const defaults = [
    `That's a good question! ${quirk.split('.')[0]}.`,
    "Hmm, let me think about that...",
    "Interesting that you'd ask that!",
    "I appreciate you wanting to know more about me.",
  ]
  
  return defaults[Math.floor(Math.random() * defaults.length)]
}

// Track used fallback lines to avoid repetition
const usedDaterLines = new Set()
const usedAvatarLines = new Set()

/**
 * Fallback date conversation (initial greeting handled separately)
 * @param {string} expectedSpeaker - 'dater' or 'avatar'
 */
export function getFallbackDateDialogue(expectedSpeaker, avatar, dater) {
  const daterLines = [
    "Tell me something about yourself that would surprise me.",
    "What's the most spontaneous thing you've ever done?",
    "I'm curious - what are you looking for in a partner?",
    "What do you think makes a good connection?",
    "So what do you like to do for fun?",
    "What's your favorite way to spend a weekend?",
    "If you could travel anywhere tomorrow, where would you go?",
    "What's something you're really passionate about?",
    "Do you have any hidden talents?",
    "What made you decide to try dating apps?",
  ]
  
  const avatarLines = [
    "Thanks! I've been really looking forward to meeting you.",
    "Well, there's a lot to unpack there... where do I start?",
    "That's a great question. Let me think about that.",
    "I'm an open book, really. Ask me anything!",
    "Honestly, I'm just happy to be here with good company.",
    "Ha! That's a fun question. Okay so...",
    "You know, I've never really thought about it that way before.",
    "I love how curious you are! It's refreshing.",
    "That actually reminds me of something...",
    "Hmm, good question. I'd have to say...",
  ]
  
  // Get an unused line for the current speaker
  const getUnusedLine = (lines, usedSet) => {
    const unused = lines.filter((_, i) => !usedSet.has(i))
    if (unused.length === 0) {
      usedSet.clear() // Reset if all used
      return lines[Math.floor(Math.random() * lines.length)]
    }
    const idx = lines.indexOf(unused[Math.floor(Math.random() * unused.length)])
    usedSet.add(idx)
    return lines[idx]
  }
  
  if (expectedSpeaker === 'dater') {
    return { speaker: 'dater', message: getUnusedLine(daterLines, usedDaterLines) }
  } else {
    return { speaker: 'avatar', message: getUnusedLine(avatarLines, usedAvatarLines) }
  }
}
