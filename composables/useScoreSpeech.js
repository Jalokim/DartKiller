import { ref } from 'vue'
import { useSpeechSynthesis } from '@vueuse/core'

export function useScoreSpeech() {
  // Text to be spoken - we'll update this when needed
  const text = ref('')

  // Initialize speech synthesis with default options
  const speech = useSpeechSynthesis(text, {
    lang: 'en-US',
    pitch: 0.8,
    rate: 1.1,
    volume: 1,
  })

  // Array of insults for when a player doesn't reach target score
  const failInsults = [
    'Ha ha ha, loser. Only threw ',
    'What a weakling! Only ',
    'Pathetic. Barely ',
    'And you call yourself a player? Only ',
    'Failure! Just ',
    'Can\'t you count? Only ',
    'My grandma throws better! Only ',
    'What a disaster! Only ',
    'That\'s not how you win! Only ',
    'No chance! Merely ',
  ]

  /**
   * Speak a score or message
   * @param {string|number} message - The message or score to speak
   */
  function speak(message) {
    try {
      if (!speech.isSupported.value) {
        console.log('Speech synthesis not supported')
        return
      }

      text.value = `${message}`
      speech.speak()
    } catch (error) {
      console.error('Error with speech synthesis:', error)
    }
  }

  /**
   * Speak a score with optional context
   * @param {number} score - The score to speak
   * @param {Object} options - Optional configuration
   * @param {boolean} options.isFailure - If the score represents a failure
   * @param {string} options.prefix - Custom prefix to add before the score
   * @param {string} options.suffix - Custom suffix to add after the score
   */
  function speakScore(score, options = {}) {
    const { isFailure = false, prefix = '', suffix = '' } = options
    
    let finalMessage = ''
    
    // Add custom prefix if provided
    if (prefix) {
      finalMessage += prefix
    }
    // Add random insult if it's a failure and no custom prefix is provided
    else if (isFailure && !prefix) {
      const randomIndex = Math.floor(Math.random() * failInsults.length)
      finalMessage += failInsults[randomIndex]
    }
    
    // Add the score
    finalMessage += score
    
    // Add special suffix for 69
    if (score === 69 && !suffix) {
      finalMessage += ', nice!'
    } 
    // Add custom suffix if provided
    else if (suffix) {
      finalMessage += suffix
    }
    
    speak(finalMessage)
  }

  return {
    speak,
    speakScore,
    isSupported: speech.isSupported
  }
} 