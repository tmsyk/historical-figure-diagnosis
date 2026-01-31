import { HistoricalFigure, UserInput, Personalities, Talents } from "./types";
import figuresData from "../data/figures.json";

// Typed accessor for figures data
const figures: HistoricalFigure[] = figuresData as HistoricalFigure[];

/**
 * Calculate Euclidean distance between two sets of scores.
 * Lower distance means higher similarity.
 */
function calculateDistance(
    userScores: Record<string, number>,
    figureScores: Record<string, number>
): number {
    let sumSq = 0;
    for (const key in userScores) {
        const diff = userScores[key] - (figureScores[key] || 0); // Default to 0 if missing, though shouldn't happen
        sumSq += diff * diff;
    }
    return Math.sqrt(sumSq);
}

export interface MatchResult {
    figure: HistoricalFigure;
    similarityScore: number; // 0-100% representation
    distance: number;
}

/**
 * Find the closest matching historical figure.
 * 
 * Strategy:
 * 1. Calculate weighted distance.
 *    - Personality match (MBTI axes) is fundamental.
 *    - Talent match is complementary.
 * 2. Return sorted list of top matches.
 */
export function findBestMatches(input: UserInput, topN: number = -1): MatchResult[] {
    const results = figures.map((figure) => {
        // 1. Personality Distance (4 axes)
        const pDist = calculateDistance(
            input.personalities as unknown as Record<string, number>,
            figure.personalities as unknown as Record<string, number>
        );

        // 2. Talent Distance (10 axes)
        const tDist = calculateDistance(
            input.talents as unknown as Record<string, number>,
            figure.talents as unknown as Record<string, number>
        );

        // Total Distance (Weighting can be adjusted)
        // Currently treating Personality and Talent equally in terms of raw scale,
        // but since Talents has 10 dims and Personality has 4, Talents naturally has more weight in raw Euclidean.
        // Let's normalize or weight them.
        // Max distance for Personality (4 dims, max diff 9 per dim): sqrt(4 * 81) = 18
        // Max distance for Talents (10 dims, max diff 9 per dim): sqrt(10 * 81) = 28.46

        // Let's balance them: 50% Personality, 50% Talent significance.
        const normalizedPDist = pDist / 18;
        const normalizedTDist = tDist / 28.46;

        // Combined distance score (lower is better)
        const combinedScore = (normalizedPDist * 0.6) + (normalizedTDist * 0.4); // Emphasize Personality slightly more

        // Convert to Percentage Similarity (approximate)
        // 0 distance = 100%
        // 1.0 distance (max difference) = 0%
        const similarity = Math.max(0, (1 - combinedScore) * 100);

        return {
            figure,
            similarityScore: parseFloat(similarity.toFixed(1)),
            distance: combinedScore
        };
    });

    // Sort by smallest distance (highest similarity)
    results.sort((a, b) => a.distance - b.distance);

    if (topN > 0) {
        return results.slice(0, topN);
    }
    return results;
}

/**
 * Find a "Partner" (Complementary Match).
 * Logic:
 * 1. Focus on filling "Weaknesses" (Talents < 5).
 * 2. Search deeper into the list (not just top matches) to find someone who covers these weak spots.
 * 3. But maintain some basic compatibility (don't pick a total opposite).
 */
export function findPartner(input: UserInput, allMatches: MatchResult[]): MatchResult | null {
    if (allMatches.length < 2) return null;

    // 1. Identify User's Weaknesses
    const weakTalents = Object.entries(input.talents)
        .filter(([_, score]) => score < 6)
        .map(([key]) => key);

    // If perfectly balanced, just return 2nd best
    if (weakTalents.length === 0) return allMatches[1];

    let bestPartner: MatchResult | null = null;
    let maxComplementScore = -1;

    // Search top 30 candidates (to ensure some personality alignment)
    const candidates = allMatches.slice(1, 31);

    for (const match of candidates) {
        let complementScore = 0;
        // @ts-ignore
        const figureTalents = match.figure.talents as Record<string, number>;

        // Calculate how much they help with weaknesses
        weakTalents.forEach(talent => {
            const score = figureTalents[talent] || 5;
            if (score >= 7) {
                // Bonus for having high skill in user's weak area
                complementScore += (score * 2);
            }
        });

        // Penalize for being too distant (keep them somewhat relatable)
        const distancePenalty = match.distance * 10;
        const finalScore = complementScore - distancePenalty;

        if (finalScore > maxComplementScore) {
            maxComplementScore = finalScore;
            bestPartner = match;
        }
    }

    return bestPartner || allMatches[1];
}

/**
 * Find a "Rival" (Opposite / Competitive).
 * Logic: Use the furthest distance (lowest similarity).
 */
export function findRival(allMatches: MatchResult[]): MatchResult | null {
    if (allMatches.length === 0) return null;
    return allMatches[allMatches.length - 1];
}

export function getAllCategories(): string[] {
    return Array.from(new Set(figures.map(f => f.category)));
}
