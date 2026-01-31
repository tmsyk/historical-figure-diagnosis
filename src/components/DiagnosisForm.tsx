"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "./types_ui";
import { UserInput, Personalities, Talents } from "../lib/types";

// Questions Definition (18 questions to cover 4 personality axes + 10 talents)
// This is a simplified set for the MVP.
const QUESTIONS: Question[] = [
    // --- Personality (MBTI Axes) ---
    // EI: Introvert vs Extrovert
    { id: "p1", type: "personality", targetKey: "ei", direction: "positive", text: "パーティーや交流会では、自分から積極的に多くの人と話す方だ。" },
    { id: "p2", type: "personality", targetKey: "ei", direction: "negative", text: "一人の時間がないとストレスを感じる。" },
    // SN: Sensing vs Intuition
    { id: "p3", type: "personality", targetKey: "sn", direction: "positive", text: "具体的な事実よりも、将来の可能性やアイデアに惹かれる。" },
    { id: "p4", type: "personality", targetKey: "sn", direction: "negative", text: "物事は現実的に、着実に進めるのが好きだ。" },
    // TF: Feeling vs Thinking
    { id: "p5", type: "personality", targetKey: "tf", direction: "positive", text: "決断を下す際、論理的整合性を重視する。" }, // Thinking is high score (10) in our model? Let's check matching.ts.
    // Wait, in matching.ts/types.ts/generate_data.ts, I didn't specify mapping strictly.
    // Let's assume:
    // EI: 1=I, 10=E
    // SN: 1=S, 10=N
    // TF: 1=F, 10=T (Typical MBTI scaling often puts F/T on opposite ends. Let's stick to T=10, F=1 based on 'Thinking' being valid 'hard' skill often associated with high numeric values in games? Actually, let's treat it as a spectrum.)
    // Let's define: 1=Feeling, 10=Thinking for "tf" axis.
    { id: "p6", type: "personality", targetKey: "tf", direction: "negative", text: "相手の感情やその場の調和を最優先に考える。" },
    // JP: Perceiving vs Judging
    { id: "p7", type: "personality", targetKey: "jp", direction: "positive", text: "計画通りに物事を進め、白黒はっきりさせたい。" }, // Judging = 10
    { id: "p8", type: "personality", targetKey: "jp", direction: "negative", text: "その場の状況に合わせて柔軟に対応するのが得意だ。" },

    // --- Talents (10 Dimensions) ---
    { id: "t1", type: "talent", targetKey: "strategic", direction: "positive", text: "複雑な問題に対して、最適な解決策やルートが瞬時に見える。" },
    { id: "t2", type: "talent", targetKey: "ideation", direction: "positive", text: "全く関係なさそうな物事を結びつけて、新しいアイデアを出すのが得意だ。" },
    { id: "t3", type: "talent", targetKey: "execution", direction: "positive", text: "一度決めた目標は、どんな障害があっても必ずやり遂げる。" },
    { id: "t4", type: "talent", targetKey: "influence", direction: "positive", text: "自分の意見で人を動かし、チームをリードすることにやりがいを感じる。" },
    { id: "t5", type: "talent", targetKey: "empathy", direction: "positive", text: "言葉にされない他人の感情や痛みを、自分のことのように感じ取れる。" },
    { id: "t6", type: "talent", targetKey: "analysis", direction: "positive", text: "データや証拠に基づいて、冷静に原因を分析するのが好きだ。" },
    { id: "t7", type: "talent", targetKey: "adaptability", direction: "positive", text: "急な予定変更やトラブルが起きても、動じずに対応できる。" },
    { id: "t8", type: "talent", targetKey: "resilience", direction: "positive", text: "失敗や批判を受けても、すぐに立ち直り、それを糧にできる。" },
    { id: "t9", type: "talent", targetKey: "visionary", direction: "positive", text: "数年〜数十年先の未来を具体的にイメージし、人に語ることができる。" },
    { id: "t10", type: "talent", targetKey: "charisma", direction: "positive", text: "初対面の人でも、なぜか自分に好意を持ってくれることが多い。" },
];

export default function DiagnosisForm() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalSteps = QUESTIONS.length;
    const currentQuestion = QUESTIONS[currentStep];

    const handleAnswer = (score: number) => {
        // Score is 1-5 (input)
        // We map this to 1-10 scale for the backend parameters
        // 1 (Strongly Disagree) -> 2
        // 5 (Strongly Agree) -> 10
        // Actually, simple multiplication by 2 works.

        setAnswers(prev => ({ ...prev, [currentQuestion.id]: score }));

        if (currentStep < totalSteps - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300); // Small delay for UX
        } else {
            finishDiagnosis({ ...answers, [currentQuestion.id]: score });
        }
    };

    const finishDiagnosis = async (finalAnswers: Record<string, number>) => {
        setIsSubmitting(true);

        // Calculate final scores
        const personalities: Personalities = { ei: 5, sn: 5, tf: 5, jp: 5 };
        const talents: Talents = {
            strategic: 5, ideation: 5, execution: 5, influence: 5, empathy: 5,
            analysis: 5, adaptability: 5, resilience: 5, visionary: 5, charisma: 5
        };

        // Helper to add score (simple averaging if multiple questions hit same key)
        const counts: Record<string, number> = {};

        QUESTIONS.forEach(q => {
            const rawScore = finalAnswers[q.id]; // 1-5
            if (!rawScore) return;

            let value = rawScore * 2; // Map to 2-10
            // If direction is negative (reversed), flip it. 
            // 1-5 input. Reversed: 1->10, 5->2? 
            // Correct logic: If 'negative', 5 means low score on the target axis.
            // e.g. "I love being alone" (Negative for Extroversion). Agree(5) -> Low Extroversion(2). Disagree(1) -> High Extroversion(10).
            if (q.direction === "negative") {
                value = 12 - value; // (12 - 10 = 2), (12 - 2 = 10)
            }

            const key = q.targetKey;

            if (q.type === "personality") {
                // @ts-ignore
                personalities[key] = (personalities[key] === 5 && !counts[key]) ? value : (personalities[key] + value) / 2;
                // The above averaging logic is primitive for this demo, assumes initial 5 is overwritten or averaged. 
                // Better:
                if (!counts[key]) {
                    // @ts-ignore
                    personalities[key] = value;
                    counts[key] = 1;
                } else {
                    // @ts-ignore
                    personalities[key] = (personalities[key] * counts[key] + value) / (counts[key] + 1);
                    counts[key]++;
                }
            } else {
                // @ts-ignore
                talents[key] = value;
            }
        });

        const result: UserInput = { personalities, talents };

        // Save to LocalStorage
        localStorage.setItem("diagnosis_result", JSON.stringify(result));

        // Navigate to results
        router.push("/diagnosis/result");
    };

    const progress = ((currentStep + 1) / totalSteps) * 100;

    if (isSubmitting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-xl font-serif text-primary animate-pulse">
                    歴史の扉を開いています...
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="glass-panel p-8 md:p-12 mb-8 text-center fade-in">
                <h2 className="text-xl md:text-2xl font-bold mb-8 text-primary min-h-[3em] flex items-center justify-center">
                    Q{currentStep + 1}. {currentQuestion.text}
                </h2>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button onClick={() => handleAnswer(1)} className="w-full md:w-auto px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors text-sm">
                        あてはまらない
                    </button>
                    <button onClick={() => handleAnswer(2)} className="w-full md:w-auto px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors text-sm">
                        やや違う
                    </button>
                    <button onClick={() => handleAnswer(3)} className="w-full md:w-auto px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors text-sm">
                        どちらでもない
                    </button>
                    <button onClick={() => handleAnswer(4)} className="w-full md:w-auto px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-colors text-sm">
                        ややそう思う
                    </button>
                    <button onClick={() => handleAnswer(5)} className="w-full md:w-auto px-6 py-3 rounded-full bg-primary text-white hover:bg-opacity-90 transition-colors shadow-md">
                        あてはまる
                    </button>
                </div>
            </div>
        </div>
    );
}
