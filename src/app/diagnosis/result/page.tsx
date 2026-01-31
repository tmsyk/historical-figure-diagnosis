"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserInput, HistoricalFigure } from "@/lib/types";
import { findBestMatches, MatchResult } from "@/lib/matching";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export default function ResultPage() {
    const router = useRouter();
    const [match, setMatch] = useState<MatchResult | null>(null);
    const [userScores, setUserScores] = useState<UserInput | null>(null);

    useEffect(() => {
        const data = localStorage.getItem("diagnosis_result");
        if (!data) {
            router.push("/");
            return;
        }
        const input: UserInput = JSON.parse(data);
        setUserScores(input);

        const results = findBestMatches(input);
        if (results.length > 0) {
            setMatch(results[0]);
        }
    }, [router]);

    if (!match || !userScores) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-primary animate-pulse">
                <p className="text-xl font-serif">運命の相手を探しています...</p>
            </div>
        );
    }

    const { figure } = match;

    // Prepare Chart Data
    // Normalizing to show straightforward comparison
    const chartData = [
        { subject: '外向性', A: userScores.personalities.ei * 10, B: figure.personalities.ei * 10, fullMark: 100 },
        { subject: '直観', A: userScores.personalities.sn * 10, B: figure.personalities.sn * 10, fullMark: 100 },
        { subject: '論理', A: userScores.personalities.tf * 10, B: figure.personalities.tf * 10, fullMark: 100 },
        { subject: '計画', A: userScores.personalities.jp * 10, B: figure.personalities.jp * 10, fullMark: 100 },
        { subject: '戦略', A: userScores.talents.strategic * 10, B: figure.talents.strategic * 10, fullMark: 100 },
        { subject: '実行', A: userScores.talents.execution * 10, B: figure.talents.execution * 10, fullMark: 100 },
    ];

    return (
        <main className="min-h-screen py-12 px-4 bg-background relative overflow-hidden">
            <div className="bg-pattern" />

            <div className="container max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 fade-in">
                    <p className="text-muted mb-2">あなたの魂と共鳴する偉人は...</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-primary font-bold mb-4">{figure.name_ja}</h1>
                    <p className="text-xl text-accent font-serif">{figure.title}</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Card: Profile */}
                    <div className="glass-panel p-8 fade-in" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">人物像</h3>
                        <p className="leading-relaxed mb-6 font-medium">
                            {figure.description}
                        </p>

                        <div className="bg-primary/5 p-6 rounded-lg mb-6 relative">
                            <span className="text-4xl text-primary absolute top-2 left-2 font-serif opacity-20">“</span>
                            <p className="text-xl font-serif text-center text-primary italic relative z-10 my-2">
                                {figure.quote}
                            </p>
                            <span className="text-4xl text-primary absolute bottom-0 right-4 font-serif opacity-20">”</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-muted">ERA: {figure.era}</span>
                            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-muted">MBTI: {figure.mbti_type}</span>
                        </div>
                    </div>

                    {/* Card: Analysis & Chart */}
                    <div className="glass-panel p-8 fade-in flex flex-col items-center justify-center" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-xl font-bold mb-4 w-full border-b border-gray-200 pb-2">パラメーター比較</h3>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--c-text-muted)', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="あなた" dataKey="A" stroke="var(--c-accent)" fill="var(--c-accent)" fillOpacity={0.4} />
                                    <Radar name={figure.name_ja} dataKey="B" stroke="var(--c-primary)" fill="var(--c-primary)" fillOpacity={0.4} />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-center text-muted mt-4">
                            一致度: <span className="text-2xl font-bold text-accent">{match.similarityScore}%</span>
                        </p>
                    </div>
                </div>

                {/* Footer / Careers */}
                <div className="glass-panel p-8 fade-in mb-12" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-xl font-bold mb-6 text-center">現代での適職</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {figure.suitable_careers.map((career, i) => (
                            <span key={i} className="px-6 py-3 bg-white/20 border border-white/30 text-primary rounded-lg shadow-sm font-bold">
                                {career}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="text-center fade-in" style={{ animationDelay: '0.8s' }}>
                    <button onClick={() => router.push('/')} className="btn-primary text-sm px-8 py-3 bg-gray-600 hover:bg-gray-700">
                        トップに戻る
                    </button>
                </div>

            </div>
        </main>
    );
}
