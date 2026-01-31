import { Talents } from "@/lib/types";

export const TALENT_TO_SKILLS: Record<keyof Talents, string[]> = {
    strategic: ["戦略的思考 (Strategic Thinking)", "ゲーム理論", "KPI設定とロードマップ策定", "マインドマップ活用術"],
    ideation: ["デザイン思考", "ブレインストーミング手法", "ラテラル・シンキング", "ゼロ・トゥ・ワン思考"],
    execution: ["GTD (Getting Things Done)", "タスク管理術", "アジャイル開発手法", "タイムマネジメント"],
    influence: ["交渉術 (Negotiation)", "パブリックスピーキング", "ストーリーテリング", "説得の心理学"],
    empathy: ["アクティブ・リスニング", "コーチング", "EQ (心の知能指数) トレーニング", "NVC (非暴力コミュニケーション)"],
    analysis: ["ロジカルシンキング", "データ分析 (SQL/Python)", "統計学基礎", "クリティカル・シンキング"],
    adaptability: ["アンラーニング (学習棄却)", "レジリエンス・トレーニング", "シチュエーショナル・リーダーシップ", "即興演劇 (インプロ)"],
    resilience: ["ストレスマネジメント", "マインドフルネス瞑想", "認知行動療法入門", "失敗からの学習法"],
    visionary: ["未来予測手法", "ビジョナリー・リーダシップ", "SFプロトタイピング", "トレンド分析"],
    charisma: ["パーソナル・ブランディング", "帝王学", "非言語コミュニケーション", "リーダーシップ論"]
};

/**
 * Get recommended skills based on the figure's top talents.
 * We look at the figure's talents (not the user's) because we want to tell the user
 * "To become more like this figure (or to utilize this type), learn these."
 * OR: "To suppress weaknesses?"
 * 
 * User request: "Skills to learn from now on".
 * Usually this means enhancing strengths or fixing weaknesses.
 * Let's pick the Figure's Top 3 Talents (which the user presumably shares or aspires to).
 */
export function getRecommendedSkills(talents: Talents): string[] {
    // 1. Sort talents by score descending
    const sortedTalents = (Object.entries(talents) as [keyof Talents, number][])
        .sort((a, b) => b[1] - a[1]);

    // 2. Take top 3
    const top3 = sortedTalents.slice(0, 3);

    // 3. Collect unique skills
    const skills = new Set<string>();
    top3.forEach(([key, _]) => {
        const candidates = TALENT_TO_SKILLS[key];
        // Pick 2 random skills from the list to add variety, or just all?
        // Let's pick all for now, maybe slice 2.
        candidates.slice(0, 2).forEach(s => skills.add(s));
    });

    return Array.from(skills);
}
