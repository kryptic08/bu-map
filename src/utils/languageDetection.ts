/**
 * Language Detection and Validation Utility
 * Supports English and Tagalog language detection
 */

/**
 * List of common English words for validation
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
 * List of common Tagalog words for validation
 */
const COMMON_TAGALOG_WORDS = new Set([
  "ang", "sa", "ng", "ay", "na", "at", "o", "pero", "para", "ito", "yan", "yun",
  "ako", "ikaw", "siya", "kami", "tayo", "kayo", "sila",
  "am", "ay", "mayroon", "may", "wala", "walang",
  "pumunta", "magpunta", "go", "gumawa", "gawin", "make", "kumuha", "take",
  "tingnan", "makita", "look", "see", "nagsalita", "sabi", "say", "tanong", "ask",
  "tulong", "tumulong", "help", "kailangan", "need", "gusto", "want",
  "piso", "pesos", "building", "opisina", "office", "paaralan", "school",
  "gusali", "bahay", "house", "kwarto", "room", "piso", "floor", "mapa", "map",
  "daan", "kalsada", "road", "direksiyon", "direction", "route", "ruta",
  "hilaga", "north", "timog", "south", "silangan", "east", "kanluran", "west",
  "saan", "where", "kailan", "when", "bakit", "why", "paano", "how"
]);

/**
 * Character pattern for English and Tagalog
 * Matches ASCII letters, numbers, spaces, and common punctuation
 */
const LANGUAGE_CHAR_PATTERN = /^[a-zA-Z0-9\s\-.,!?';:()\[\]\/&\"ñáéíóúàèìòùâêîôûäëïöü]*$/;

/**
 * Validate if text is primarily in English or Tagalog
 * Uses multiple heuristics to check for language content
 */
export function isValidLanguage(text: string): boolean {
  return isEnglishText(text) || isTagalogText(text);
}

/**
 * Validate if text is primarily in English
 * Uses multiple heuristics to check for English language content
 */
export function isEnglishText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const normalized = text.toLowerCase().trim();

  // Check 1: Verify character set
  if (!LANGUAGE_CHAR_PATTERN.test(text)) {
    console.log("[Language Detection] Non-compatible characters detected:", text);
    return false;
  }

  // Check 2: Look for common English words (at least 30% of words should be English)
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) {
    return false;
  }

  const englishWordCount = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return COMMON_ENGLISH_WORDS.has(cleanWord);
  }).length;

  const englishRatio = englishWordCount / words.length;

  // Check 3: Most words should contain English letter patterns
  const englishLetterPattern = /[a-z]/i;
  const wordsWithEnglishLetters = words.filter(word => englishLetterPattern.test(word)).length;
  const letterRatio = wordsWithEnglishLetters / words.length;

  console.log("[Language Detection] English Analysis:", {
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
 * Validate if text is primarily in Tagalog
 * Uses multiple heuristics to check for Tagalog language content
 */
export function isTagalogText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  const normalized = text.toLowerCase().trim();

  // Check 1: Verify character set
  if (!LANGUAGE_CHAR_PATTERN.test(text)) {
    console.log("[Language Detection] Non-compatible characters detected:", text);
    return false;
  }

  // Check 2: Look for common Tagalog words
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) {
    return false;
  }

  const tagalogWordCount = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return COMMON_TAGALOG_WORDS.has(cleanWord);
  }).length;

  const tagalogRatio = tagalogWordCount / words.length;

  console.log("[Language Detection] Tagalog Analysis:", {
    text: text.substring(0, 50),
    totalWords: words.length,
    tagalogWords: tagalogWordCount,
    tagalogRatio: tagalogRatio.toFixed(2),
  });

  // Require at least 30% common Tagalog words
  const isTagalog = tagalogRatio >= 0.3;

  return isTagalog;
}

/**
 * Filter valid language words from text
 */
export function filterValidLanguageWords(text: string): string {
  if (!text) {
    return "";
  }

  const words = text.split(/\s+/);

  // Keep words that appear to be valid language (contain letters)
  const languageLetterPattern = /[a-z]/i;
  const filtered = words.filter(word => {
    return languageLetterPattern.test(word) && LANGUAGE_CHAR_PATTERN.test(word);
  });

  return filtered.join(" ");
}

/**
 * Get language confidence score (0-1)
 * Returns how confident we are that the text is valid (English or Tagalog)
 */
export function getLanguageConfidenceScore(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const englishScore = getEnglishConfidentScore(text);
  const tagalogScore = getTagalogConfidentScore(text);

  // Return the highest confidence score
  return Math.max(englishScore, tagalogScore);
}

/**
 * Get English confidence score (0-1)
 */
export function getEnglishConfidentScore(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const normalized = text.toLowerCase().trim();

  // Check character set compatibility
  const charScore = LANGUAGE_CHAR_PATTERN.test(text) ? 0.3 : 0;

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
 * Get Tagalog confidence score (0-1)
 */
export function getTagalogConfidentScore(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const normalized = text.toLowerCase().trim();

  // Check character set compatibility
  const charScore = LANGUAGE_CHAR_PATTERN.test(text) ? 0.3 : 0;

  // Check for common Tagalog words
  const words = normalized.split(/\s+/).filter(word => word.length > 0);
  const tagalogWordCount = words.filter(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    return COMMON_TAGALOG_WORDS.has(cleanWord);
  }).length;
  const wordScore = words.length > 0 ? (tagalogWordCount / words.length) * 0.7 : 0;

  return Math.min(1, charScore + wordScore);
}

/**
 * Detect language from text
 * Returns detected language code (en, tl)
 */
export function detectLanguage(text: string): string {
  if (isEnglishText(text)) {
    return "en";
  }
  
  if (isTagalogText(text)) {
    return "tl";
  }

  return "unknown";
}
