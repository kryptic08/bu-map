import type { Destination, PresetDestination } from "../types/navigation";

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching of voice input
 */
function levenshteinDistance(a: string, b: string): number {
  const track = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) {
    track[0][i] = i;
  }

  for (let j = 0; j <= b.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= b.length; j += 1) {
    for (let i = 1; i <= a.length; i += 1) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }

  return track[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-100)
 * Higher score means better match
 */
function calculateStringSimilarity(source: string, target: string): number {
  const distance = levenshteinDistance(source, target);
  const maxLength = Math.max(source.length, target.length);
  if (maxLength === 0) {
    return 100;
  }

  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.max(0, similarity);
}

export function resolvePresetFromPrompt(
  prompt: string,
  destinations: PresetDestination[],
): PresetDestination | null {
  const normalizedPrompt = normalizeText(prompt);
  console.log("[Voice Parsing] Received prompt:", prompt);
  console.log("[Voice Parsing] Normalized prompt:", normalizedPrompt);

  if (!normalizedPrompt) {
    console.log("[Voice Parsing] Empty normalized prompt");
    return null;
  }

  const promptTokens = normalizedPrompt
    .split(/\s+/)
    .filter((token) => token.length > 1);

  console.log("[Voice Parsing] Extracted tokens:", promptTokens);

  if (promptTokens.length === 0) {
    console.log("[Voice Parsing] No valid tokens found");
    return null;
  }

  interface MatchResult {
    place: PresetDestination;
    score: number;
    matchType: "exact" | "token" | "fuzzy";
    details: string;
  }

  let bestMatch: MatchResult | null = null;
  const allScores: MatchResult[] = [];

  for (const place of destinations) {
    const searchableText = normalizeText(
      `${place.label} ${place.keywords.join(" ")}`,
    );

    // Strategy 1: Exact substring match (highest priority)
    if (searchableText.includes(normalizedPrompt)) {
      const score = 100;
      const result: MatchResult = {
        place,
        score,
        matchType: "exact",
        details: `Exact match: "${normalizedPrompt}" found in "${searchableText}"`,
      };
      allScores.push(result);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = result;
      }
      continue;
    }

    // Strategy 2: Token-based matching (medium priority)
    let tokenScore = 0;
    const matchedTokens: string[] = [];

    for (const token of promptTokens) {
      if (searchableText.includes(token)) {
        tokenScore += 1;
        matchedTokens.push(token);
      }
    }

    if (tokenScore > 0) {
      const normalizedScore = (tokenScore / promptTokens.length) * 100;
      const result: MatchResult = {
        place,
        score: normalizedScore,
        matchType: "token",
        details: `Token match (${tokenScore}/${promptTokens.length}): matched tokens=[${matchedTokens.join(", ")}]`,
      };
      allScores.push(result);
      if (!bestMatch || normalizedScore > bestMatch.score) {
        bestMatch = result;
      }
      continue;
    }

    // Strategy 3: Fuzzy matching using Levenshtein distance (lowest priority)
    let bestFuzzyScore = 0;
    let bestFuzzyMatch = "";

    // Try fuzzy matching against destination label
    const labelSimilarity = calculateStringSimilarity(
      normalizedPrompt,
      place.label.toLowerCase(),
    );
    if (labelSimilarity > bestFuzzyScore) {
      bestFuzzyScore = labelSimilarity;
      bestFuzzyMatch = place.label;
    }

    // Try fuzzy matching against keywords
    for (const keyword of place.keywords) {
      const keySimilarity = calculateStringSimilarity(
        normalizedPrompt,
        keyword.toLowerCase(),
      );
      if (keySimilarity > bestFuzzyScore) {
        bestFuzzyScore = keySimilarity;
        bestFuzzyMatch = keyword;
      }
    }

    // Only consider fuzzy matches with reasonable confidence (>60%)
    if (bestFuzzyScore > 60) {
      const result: MatchResult = {
        place,
        score: bestFuzzyScore,
        matchType: "fuzzy",
        details: `Fuzzy match (${bestFuzzyScore.toFixed(1)}%): matched "${bestFuzzyMatch}"`,
      };
      allScores.push(result);
      if (!bestMatch || bestFuzzyScore > bestMatch.score) {
        bestMatch = result;
      }
    }
  }

  // Log all matches for debugging
  console.log(
    "[Voice Parsing] All matches:",
    allScores.map((m) => ({
      destination: m.place.label,
      score: m.score.toFixed(1),
      type: m.matchType,
      details: m.details,
    })),
  );

  if (!bestMatch) {
    console.log(
      "[Voice Parsing] No matching destination found. Available destinations:",
      destinations.map((d) => d.label),
    );
    return null;
  }

  console.log(
    `[Voice Parsing] Best match found: "${bestMatch.place.label}" (score: ${bestMatch.score.toFixed(1)}%, type: ${bestMatch.matchType})`,
  );
  console.log(`[Voice Parsing] Match details: ${bestMatch.details}`);

  return bestMatch.place;
}

export function resolvePresetFromDestination(
  destination: Destination | null,
  destinations: PresetDestination[],
): PresetDestination | null {
  if (!destination) {
    return null;
  }

  return (
    destinations.find(
      (preset) =>
        Math.abs(preset.lat - destination.lat) < 0.000001 &&
        Math.abs(preset.lon - destination.lon) < 0.000001,
    ) ?? null
  );
}
