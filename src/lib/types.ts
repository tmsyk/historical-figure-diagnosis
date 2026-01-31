export interface Personalities {
    ei: number; // 1-10: Introvert <-> Extrovert
    sn: number; // 1-10: Sensing <-> Intuition
    tf: number; // 1-10: Feeling <-> Thinking
    jp: number; // 1-10: Perceiving <-> Judging
}

export interface Talents {
    strategic: number;
    ideation: number;
    execution: number;
    influence: number;
    empathy: number;
    analysis: number;
    adaptability: number;
    resilience: number;
    visionary: number;
    charisma: number;
}

export interface HistoricalFigure {
    id: string;
    name_ja: string;
    name_en: string;
    category: string;
    era: string;
    title: string;
    personalities: Personalities;
    talents: Talents;
    mbti_type: string;
    description: string;
    quote: string;
    suitable_careers: string[];
}

export interface UserInput {
    personalities: Personalities;
    talents: Talents;
}
