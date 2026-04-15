/**
 * Language Detection and English Validation Utility
 * Validates text to ensure it contains primarily English content
 */

/**
 * List of common English words for validation
 * Used to verify that transcribed text is in English
 */
const COMMON_ENGLISH_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from",
  "is", "are", "am", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "can", "could", "may", "might", "must",
  "i", "you", "he", "she", "it", "we", "they", "what", "which", "who", "when", "where", "why", "how",
  "this", "that", "these", "those", "my", "your", "his", "her", "its", "our", "their",
  "go", "come", "see", "make", "take", "find", "give", "know", "think", "say", "tell", "ask", "work", "use", "help",
  "get", "here", "there", "need", "show", "help", "call", "try", "look", "want", "turn", "start", "stop", "place", "destination",
  "floor", "room", "building", "campus", "map", "route", "direction", "north", "south", "east", "west"
]);

/**
 * English character pattern
 * Matches basic ASCII letters, numbers, spaces, and common punctuation
 */
const ENGLISH_CHAR_PATTERN = /^[a-zA-Z0-9\s\-.,!?';:()\[\]\/&\"]*$/;

/**
 * Validate if text is primarily in English
 * Uses multiple heuristics to check for English language content
 */
export function isEnglishText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const normalized = text.toLowerCase().trim();

  // Check 1: Verify character set (ASCII-based)
  if (!ENGLISH_CHAR_PATTERN.test(text)) {
    console.log("[Language Detection] Non-ASCII characters detected:", text);
    return false;
  }

  // Check 2: Look for common English words (at least 30% of words should be English)
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) {
    return false;
  }

  const englishWordCount = words.filter(word => {
    // Remove punctuation for matching
    const cleanWord = word.replace(/[^\w]/g, '');
    return COMMON_ENGLISH_WORDS.has(cleanWord);
  }).length;

  const englishRatio = englishWordCount / words.length;

  // Check 3: Most words should contain English letter patterns
  const englishLetterPattern = /[a-z]/i;
  const wordsWithEnglishLetters = words.filter(word => englishLetterPattern.test(word)).length;
  const letterRatio = wordsWithEnglishLetters / words.length;

  console.log("[Language Detection] Analysis:", {
    text: text.substring(0, 50),
    totalWords: words.length,
    englishWords: englishWordCount,
    englishRatio: englishRatio.toFixed(2),
    wordsWithLetters: wordsWithEnglishLetters,
    letterRatio: letterRatio.toFixed(2),
  });

  // Require at least 40% common English words OR 80% words with English letters
  const isEnglish = englishRatio >= 0.4 || letterRatio >= 0.8;

  return isEnglish;
}

/**
 * Filter English words from text, removing non-English tokens
 */
export function filterEnglishWords(text: string): string {
  if (!text) {
    return "";
  }

  const words = text.split(/\s+/);

  // Keep words that appear to be English (contain English letters)
  const englishLetterPattern = /[a-z]/i;
  const filtered = words.filter(word => {

    return englishLetterPattern.test(word) && ENGLISH_CHAR_PATTERN.test(word);
  });

  return filtered.join(" ");
}

/**
 * Get language confidence score (0-1)
 * Returns how confident we are that the text is in English
 */
export function getEnglishConfidentScore(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const normalized = text.toLowerCase().trim();

  // Check character set compatibility
  const charScore = ENGLISH_CHAR_PATTERN.test(text) ? 0.3 : 0;

  // Check for common English words
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  const englishWordCount = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return COMMON_ENGLISH_WORDS.has(cleanWord);
  }).length;
  const wordScore = words.length > 0 ? (englishWordCount / words.length) * 0.4 : 0;

  // Check for English letter patterns
  const englishLetterPattern = /[a-z]/i;
  const wordsWithLetters = words.filter(word => englishLetterPattern.test(word)).length;
  const letterScore = words.length > 0 ? (wordsWithLetters / words.length) * 0.3 : 0;

  return Math.min(1, charScore + wordScore + letterScore);
}

/**
 * Detect language from text
 * Returns detected language code (en, es, fr, etc.)
 */
export function detectLanguage(text: string): string {
  if (isEnglishText(text)) {
    return "en";
  }

  // For now, we only support English detection
  // In a real-world scenario, you might use a proper language detection library
  return "unknown";
}
