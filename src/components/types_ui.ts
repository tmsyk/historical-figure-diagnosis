export type QuestionType = "personality" | "talent";

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    targetKey: string; // "ei", "strategic", etc.
    direction: "positive" | "negative"; // positive: 10, negative: 1
}
