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
 * 1. Reasonable general compatibility (Similarity > 60% approx, distance < 0.4).
 * 2. Complements User's Weaknesses: High scores in areas where user is low.
 */
export function findPartner(input: UserInput, allMatches: MatchResult[]): MatchResult | null {
    // 1. Identify User's Weaknesses (Talents < 6)
    const weakTalents = Object.entries(input.talents)
        .filter(([_, score]) => score < 6)
        .map(([key]) => key);

    if (weakTalents.length === 0) {
        // If user has no weaknesses, just pick the 2nd best overall match
        return allMatches.length > 1 ? allMatches[1] : null;
    }

    // 2. Score candidates based on how well they fill these gaps
    let bestPartner: MatchResult | null = null;
    let maxComplementScore = -1;

    // Only consider the top 50% of matches to ensure some basic compatibility
    const candidates = allMatches.slice(0, Math.floor(allMatches.length / 2));

    for (const match of candidates) {
        if (match.distance === 0) continue; // Skip self if perfect match (unlikely)

        let complementScore = 0;
        // @ts-ignore
        const figureTalents = match.figure.talents as Record<string, number>;

        weakTalents.forEach(talent => {
            const score = figureTalents[talent] || 5;
            complementScore += score; // Higher is better
        });

        if (complementScore > maxComplementScore) {
            maxComplementScore = complementScore;
            bestPartner = match;
        }
    }

    return bestPartner || (allMatches.length > 1 ? allMatches[1] : null);
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
