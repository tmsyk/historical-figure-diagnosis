"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Question } from "./types_ui";
import { UserInput, Personalities, Talents } from "../lib/types";
import styles from "./DiagnosisForm.module.css";

// Questions Definition (18 questions)
const QUESTIONS: Question[] = [
    // --- Personality (MBTI Axes) ---
    { id: "p1", type: "personality", targetKey: "ei", direction: "positive", text: "パーティーや交流会では、自分から積極的に多くの人と話す方だ。" },
    { id: "p2", type: "personality", targetKey: "ei", direction: "negative", text: "一人の時間がないとストレスを感じる。" },
    { id: "p3", type: "personality", targetKey: "sn", direction: "positive", text: "具体的な事実よりも、将来の可能性やアイデアに惹かれる。" },
    { id: "p4", type: "personality", targetKey: "sn", direction: "negative", text: "物事は現実的に、着実に進めるのが好きだ。" },
    { id: "p5", type: "personality", targetKey: "tf", direction: "positive", text: "決断を下す際、論理的整合性を重視する。" },
    { id: "p6", type: "personality", targetKey: "tf", direction: "negative", text: "相手の感情やその場の調和を最優先に考える。" },
    { id: "p7", type: "personality", targetKey: "jp", direction: "positive", text: "計画通りに物事を進め、白黒はっきりさせたい。" },
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

const ITEMS_PER_PAGE = 5;

export default function DiagnosisForm() {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentPage, setCurrentPage] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination logic
    const totalQuestions = QUESTIONS.length;
    const totalPages = Math.ceil(totalQuestions / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const currentQuestions = QUESTIONS.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Check if all questions on current page are answered
    const isPageComplete = currentQuestions.every(q => answers[q.id] !== undefined);

    const handleAnswer = (questionId: string, score: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: score }));
    };

    const handleNext = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        } else {
            finishDiagnosis();
        }
    };

    const finishDiagnosis = async () => {
        setIsSubmitting(true);

        // Calculate final scores
        const personalities: Personalities = { ei: 5, sn: 5, tf: 5, jp: 5 };
        const talents: Talents = {
            strategic: 5, ideation: 5, execution: 5, influence: 5, empathy: 5,
            analysis: 5, adaptability: 5, resilience: 5, visionary: 5, charisma: 5
        };

        const counts: Record<string, number> = {};

        QUESTIONS.forEach(q => {
            const rawScore = answers[q.id];
            if (!rawScore) return;

            let value = rawScore * 2; // Map 1-5 to 2-10
            if (q.direction === "negative") {
                value = 12 - value; // Flip score
            }

            const key = q.targetKey;

            if (q.type === "personality") {
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
        localStorage.setItem("diagnosis_result", JSON.stringify(result));
        router.push("/diagnosis/result");
    };

    const progress = Math.min(100, ((Object.keys(answers).length) / totalQuestions) * 100);

    if (isSubmitting) {
        return (
            <div className={styles.loading}>
                歴史の扉を開いています...
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Progress Bar */}
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className={styles.formPanel}>
                <div className={styles.questionGroup}>
                    {currentQuestions.map((q, index) => {
                        const globalIndex = startIndex + index + 1;
                        return (
                            <div key={q.id} className={styles.questionItem}>
                                <p className={styles.questionText}>Q{globalIndex}. {q.text}</p>
                                <div className={styles.optionsGrid}>
                                    {[1, 2, 3, 4, 5].map((score) => (
                                        <button
                                            key={score}
                                            onClick={() => handleAnswer(q.id, score)}
                                            className={`${styles.optionBtn} ${answers[q.id] === score ? styles.optionBtnSelected : ''}`}
                                        >
                                            {score === 1 && "違う"}
                                            {score === 2 && "やや違う"}
                                            {score === 3 && "どちらでも"}
                                            {score === 4 && "ややそう"}
                                            {score === 5 && "そう思う"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.actions}>
                    <button
                        onClick={handleNext}
                        disabled={!isPageComplete}
                        className={styles.nextBtn}
                    >
                        {currentPage === totalPages - 1 ? "診断結果を見る" : "次へ進む"}
                    </button>
                </div>
            </div>
        </div>
    );
}
