# Dater Response Logic

This document explains how the Dater character generates responses during dates in Bad Date.

## Overview

The Dater uses Claude (Anthropic's LLM) to generate contextual, personality-driven responses. The system is designed to create believable, entertaining reactions to the Avatar's increasingly chaotic attributes.

---

## Response Generation Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Avatar Says    │ ──▶ │  Build Context   │ ──▶ │  Claude API     │
│  Something      │     │  & Prompt        │     │  Generates      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                         │
┌─────────────────┐     ┌──────────────────┐            ▼
│  Update Score   │ ◀── │  Parse Response  │ ◀──────────┘
│  & Sentiment    │     │  & Sentiment     │
└─────────────────┘     └──────────────────┘
```

---

## The Dater's Personality System

Each Dater has a rich personality profile defined in `src/data/daters.js`:

### Core Profile Fields

| Field | Purpose | Example (Leo) |
|-------|---------|---------------|
| `name` | Display name | "Leo" |
| `pronouns` | Gender identity | "he/him" |
| `archetype` | One-line personality summary | "The Passionate Artist" |
| `description` | Detailed personality description | Passionate, idealistic, romanticizes the mundane |
| `backstory` | Life history that shapes reactions | Left corporate job to pursue art |
| `upbringing` | Childhood/family background | Middle-class Portland, accountant parents |
| `hometown` | Geographic origin | "Portland, Oregon" |
| `friends` | Social circle description | Tight-knit group of creatives |
| `spirituality` | Beliefs about meaning/religion | Spiritual but not religious, finds divine in art |
| `values` | Core principles | Authenticity, anti-materialism, beauty |
| `beliefs` | Worldview statements | "Art can change the world" |
| `admires` | Role models | Van Gogh, Anthony Bourdain, Miyazaki |

### Behavioral Configuration

| Field | Purpose | Options |
|-------|---------|---------|
| `formality` | Speech register | Low / Medium / High |
| `complexity` | Vocabulary level | Low / Medium / High |
| `quirk` | Unique conversational habit | "Relates everything to art/design" |
| `talkingTraits` | Adjectives for speech style | ["Earnest", "Emotional", "Whimsical"] |
| `characterReferences` | Pop culture comparisons | ["Jesse (Before Sunrise)", "Ted Mosby"] |

### Compatibility Factors

| Field | Purpose | Example |
|-------|---------|---------|
| `idealPartner` | What attracts them | ["emotionally honest", "adventurous", "creative"] |
| `dealbreakers` | What repels them | ["cynicism", "materialism", "closed-mindedness"] |

### Personality Stats

Fine-grained behavior sliders:

```javascript
stats: {
  chattiness: 'Conversational',    // How much they talk
  steering: 'Guiding',             // Do they lead conversation?
  adaptability: 'Flexible',        // How rigid in topics?
  inquisitiveness: 'Curious',      // How many questions?
  empathy: 'Intuitive',            // Emotional awareness
  supportiveness: 'Nurturing',     // Validation style
  reassurance: 'Hopeful',          // Optimism level
  depth: 'Profound',               // Surface vs deep topics
  agreeableness: 'Accepting',      // Conflict tolerance
  vulnerability: 'Open',           // Self-disclosure
  directness: 'Honest',            // Bluntness
  sensitivity: 'Sensitive',        // Easily offended?
  flirtatiousness: 'Forward',      // Romance signals
  shyness: 'Receptive',            // Social comfort
}
```

---

## Prompt Construction

### Phase-Specific Context

The system builds different prompts for different game phases:

#### Chat Phase (Pre-Date)
```
Goal: Let players interrogate the Dater to gather intel
Behavior: Answer questions from personality, redirect non-questions
Constraint: Don't ask questions back, keep responses brief
```

#### Date Phase (Active Date)
```
Goal: React realistically to Avatar's attributes
Behavior: Be a believable human, not a polite doormat
Constraint: Can't leave the date, but can express discomfort
```

### The Complete Prompt Structure

```
1. IDENTITY
   "You are {name} ({pronouns}), '{archetype}'"

2. PERSONALITY LAYERS
   - WHO YOU ARE: {description}
   - YOUR STORY: {backstory}
   - WHERE YOU COME FROM: {hometown}. {upbringing}
   - YOUR FRIENDS: {friends}
   - YOUR SPIRITUALITY: {spirituality}
   - YOUR VALUES: {values}
   - YOUR BELIEFS: {beliefs}
   - PEOPLE YOU ADMIRE: {admires}

3. BEHAVIORAL GUIDANCE
   - YOUR QUIRK: {quirk}
   - TALKING STYLE: {talkingTraits}
   - THINK OF YOURSELF AS: {characterReferences}
   - PERSONALITY STATS: {stats}

4. COMPATIBILITY CONTEXT
   - WHAT YOU'RE LOOKING FOR: {idealPartner}
   - YOUR DEALBREAKERS: {dealbreakers}

5. PHASE-SPECIFIC INSTRUCTIONS
   (Chat context OR Date context)

6. CRITICAL RULES
   - Brevity (1-2 sentences max)
   - No action tags (*smiles*)
   - Stay in character
   - Match formality level
```

---

## Attribute Visibility System

The Dater's response changes based on whether they can **see** the Avatar's attribute or must **infer** it.

### Visible Attributes

Attributes are considered visible if they contain keywords like:
- Body parts: `eye`, `arm`, `leg`, `head`, `face`, `tail`, `wings`
- Physical states: `tall`, `short`, `fat`, `thin`, `muscular`
- Appearance: `hair`, `bald`, `skin`, `tattoo`, `scar`
- Transformations: `robot`, `zombie`, `vampire`, `spider`, `ghost`
- Active states: `fire`, `glowing`, `floating`, `melting`, `dripping`
- Clothing: `wearing`, `costume`, `hat`, `mask`

**When visible:** Dater reacts to what they can physically SEE.

```
⚠️ THESE ARE LITERAL AND REAL - NOT METAPHORS
- If they're "on fire" - real flames
- If they have "tentacles" - real tentacles
- Don't question if it's real or metaphorical - you can SEE it!
```

### Non-Visible Attributes

For attributes that aren't visually apparent (personality traits, hidden secrets, etc.):

**When non-visible:** Dater must INFER from what the Avatar says.

```
🔍 ACTIVE LISTENING MODE - INFER FROM WHAT THEY JUST SAID
- What are they implying or hinting at?
- Is there a hidden meaning, joke, or revelation?
- React based on YOUR INTERPRETATION
```

---

## Reaction Intensity System

### Normal Conversation
- Standard personality-driven responses
- Reference visible attributes naturally
- Keep them engaged in the conversation

### New Attribute Added (2-3x Intensity)
When a new attribute is just applied:

```
Your reaction should be HONEST and INTENSE (2-3x normal).
You're allowed to be negative! Some things are just bad!
Still keep it to 1-2 sentences, but make them COUNT.
```

**Reaction Guidelines:**

| Attribute Type | Expected Reaction |
|----------------|-------------------|
| HORRIFYING | Be horrified! "Oh my god, what is happening to your face?!" |
| DANGEROUS | Be concerned! "Should we call someone? You're literally on fire!" |
| GROSS | Be grossed out! "Is that... is something dripping off you?" |
| SCARY | Be scared! "I don't... I don't know how to process what I'm seeing." |
| WEIRD | Be weirded out! "Okay, I have SO many questions right now." |
| ATTRACTIVE | Be into it! "Okay, that's actually kind of hot." |

---

## The "Stuck on Date" Constraint

A key design principle: **The Dater cannot leave the date.**

This creates comedic tension:

```
BUT YOU'RE STUCK HERE:
- Even when horrified, you can't physically leave
- Make excuses, be polite-but-horrified
- You might nervously laugh, try to change the subject
- You can express regret about agreeing to this date
- Curiosity or morbid fascination might keep you engaged
```

---

## Sentiment & Compatibility Scoring

The Dater's response includes sentiment analysis that affects the compatibility score:

### Sentiment Range
- **Strong Positive (+8 to +10):** Loves this → Category: "Loves"
- **Positive (+1 to +7):** Likes this → Category: "Likes"
- **Negative (-1 to -7):** Dislikes this → Category: "Dislikes"
- **Strong Negative (-8 to -10):** Dealbreaker → Category: "Dealbreakers"

### Factor Categories
Sentiment affects one of 5 compatibility factors:
- `physicalAttraction` - Looks, appearance, physical traits
- `similarInterests` - Hobbies, activities, passions
- `similarValues` - Moral beliefs, life priorities
- `similarTastes` - Preferences, styles, aesthetics
- `similarIntelligence` - Mental connection, wit, depth

---

## Fallback System

When the API is unavailable, the system uses fallback responses:

### Fallback Selection Logic
1. Check if message is a question (contains `?` or question words)
2. If not a question → Redirect to ask something
3. If question → Match keywords to response categories:
   - Job/work → Career responses
   - Fun/hobby → Activity responses
   - Looking for/type → Partner preference responses
   - Hate/dealbreaker → Negative responses
   - From/where → Origin responses

---

## Example Response Generation

### Scenario
Avatar has attributes: `["is a vampire", "obsessed with cheese"]`
New attribute just added: `"has three heads"`

### Prompt Additions

```
WHAT YOU CAN PHYSICALLY SEE: is a vampire, has three heads

⚠️ THESE ARE LITERAL AND REAL - NOT METAPHORS
- Don't question if it's real or metaphorical - you can SEE it!

🚨 SOMETHING JUST CHANGED: "has three heads"
⚠️ THIS IS LITERAL, NOT A METAPHOR!

REACT HONESTLY - NOT EVERYTHING IS OKAY:
- If this is WEIRD → Be weirded out! "Okay, I have SO many questions right now."

Your reaction should be HONEST and INTENSE (2-3x normal).
```

### Expected Output Style
```
"Wait— did you just grow two more heads?! I... I don't even know where to look right now."
```

---

## Key Design Principles

1. **Authenticity over Politeness**
   - Daters should react like real people, not AI assistants
   - Negative reactions are valid and encouraged for bad situations

2. **Personality Consistency**
   - Every response should feel like it comes from that specific character
   - Quirks, values, and dealbreakers should influence reactions

3. **Comedy through Constraint**
   - The "can't leave" rule creates escalating absurdity
   - Daters must cope with chaos, not escape it

4. **Visible vs. Inferred**
   - Physical traits get immediate visual reactions
   - Hidden traits require conversational inference

5. **Intensity Scaling**
   - New attributes get heightened reactions
   - Normal conversation is more subdued

---

## File References

- **Dater Profiles:** `src/data/daters.js`
- **Response Generation:** `src/services/llmService.js`
- **Game State:** `src/store/gameStore.js`
- **Date UI:** `src/components/DateScene.jsx`
