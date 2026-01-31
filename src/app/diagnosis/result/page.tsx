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
    // 1. Talents - Full 10 axes Radar Chart
    const talentData = [
        { subject: '戦略性', A: userScores.talents.strategic * 10, B: figure.talents.strategic * 10, fullMark: 100 },
        { subject: '着想', A: userScores.talents.ideation * 10, B: figure.talents.ideation * 10, fullMark: 100 },
        { subject: '実行力', A: userScores.talents.execution * 10, B: figure.talents.execution * 10, fullMark: 100 },
        { subject: '影響力', A: userScores.talents.influence * 10, B: figure.talents.influence * 10, fullMark: 100 },
        { subject: '共感性', A: userScores.talents.empathy * 10, B: figure.talents.empathy * 10, fullMark: 100 },
        { subject: '分析思考', A: userScores.talents.analysis * 10, B: figure.talents.analysis * 10, fullMark: 100 },
        { subject: '適応性', A: userScores.talents.adaptability * 10, B: figure.talents.adaptability * 10, fullMark: 100 },
        { subject: '回復志向', A: userScores.talents.resilience * 10, B: figure.talents.resilience * 10, fullMark: 100 },
        { subject: '未来志向', A: userScores.talents.visionary * 10, B: figure.talents.visionary * 10, fullMark: 100 },
        { subject: 'カリスマ', A: userScores.talents.charisma * 10, B: figure.talents.charisma * 10, fullMark: 100 },
    ];

    // Helper for Personality Spectrum
    const PersonalityBar = ({ labelL, labelR, valA, valB }: { labelL: string, labelR: string, valA: number, valB: number }) => {
        // Normalize 0-10 to percentage 0-100%
        const posA = valA * 10;
        const posB = valB * 10;

        return (
            <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-muted mb-2">
                    <span>{labelL}</span>
                    <span>{labelR}</span>
                </div>
                <div className="relative h-4 bg-gray-200 rounded-full w-full">
                    {/* Center Marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-300 transform -translate-x-1/2" />

                    {/* User Marker */}
                    <div
                        className="absolute top-1/2 w-4 h-4 bg-accent rounded-full border-2 border-white shadow-md transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                        style={{ left: `${posA}%` }}
                        title="あなた"
                    />

                    {/* Figure Marker */}
                    <div
                        className="absolute top-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md transform -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                        style={{ left: `${posB}%` }}
                        title={figure.name_ja}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-1 px-1">
                    <span className="text-accent font-bold">You</span>
                    <span className="text-primary font-bold">{figure.name_ja}</span>
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen py-12 px-4 bg-background relative overflow-hidden">
            <div className="bg-pattern" />

            <div className="container max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 fade-in">
                    <p className="text-muted mb-2">あなたの魂と共鳴する偉人は...</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-primary font-bold mb-4">{figure.name_ja}</h1>
                    <p className="text-xl text-accent font-serif">{figure.title}</p>
                </div>

                {/* Profile Section */}
                <div className="glass-panel p-8 fade-in mb-8" style={{ animationDelay: '0.2s' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">人物像</h3>
                            <p className="leading-relaxed mb-6 font-medium text-lg">
                                {figure.description}
                            </p>
                            <div className="bg-primary/5 p-6 rounded-lg relative">
                                <span className="text-4xl text-primary absolute top-2 left-2 font-serif opacity-20">“</span>
                                <p className="text-xl font-serif text-center text-primary italic relative z-10 my-2">
                                    {figure.quote}
                                </p>
                                <span className="text-4xl text-primary absolute bottom-0 right-4 font-serif opacity-20">”</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 justify-center">
                            <div className="text-center p-4 bg-white/30 rounded-lg">
                                <p className="text-sm text-muted mb-1">時代</p>
                                <p className="font-bold text-lg">{figure.era}</p>
                            </div>
                            <div className="text-center p-4 bg-white/30 rounded-lg">
                                <p className="text-sm text-muted mb-1">MBTI</p>
                                <p className="font-bold text-lg">{figure.mbti_type}</p>
                            </div>
                            <div className="text-center p-4 bg-white/30 rounded-lg">
                                <p className="text-sm text-muted mb-1">共鳴度</p>
                                <p className="font-bold text-3xl text-accent">{match.similarityScore}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                    {/* Personality Spectrum */}
                    <div className="glass-panel p-8 fade-in" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-xl font-bold mb-6 text-center border-b border-gray-200 pb-2">性格特性の比較</h3>
                        <div className="space-y-4">
                            <PersonalityBar
                                labelL="内向的 (I)" labelR="外向的 (E)"
                                valA={userScores.personalities.ei} valB={figure.personalities.ei}
                            />
                            <PersonalityBar
                                labelL="直感的 (N)" labelR="感覚的 (S)"
                                valA={userScores.personalities.sn} valB={figure.personalities.sn}
                            />
                            <PersonalityBar
                                labelL="論理的 (T)" labelR="感情的 (F)"
                                valA={userScores.personalities.tf} valB={figure.personalities.tf}
                            />
                            <PersonalityBar
                                labelL="柔軟 (P)" labelR="几帳面 (J)"
                                valA={userScores.personalities.jp} valB={figure.personalities.jp}
                            />
                        </div>
                        <p className="text-xs text-muted mt-4 text-center">
                            <span className="inline-block w-3 h-3 bg-accent rounded-full mr-1"></span>あなた
                            <span className="inline-block w-3 h-3 bg-primary rounded-full ml-4 mr-1"></span>{figure.name_ja}
                        </p>
                    </div>

                    {/* Talent Radar */}
                    <div className="glass-panel p-8 fade-in flex flex-col items-center justify-center" style={{ animationDelay: '0.5s' }}>
                        <h3 className="text-xl font-bold mb-2 text-center border-b border-gray-200 pb-2 w-full">才能マップ</h3>
                        <div className="w-full h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={talentData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--c-text-muted)', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="あなた" dataKey="A" stroke="var(--c-accent)" fill="var(--c-accent)" fillOpacity={0.5} />
                                    <Radar name={figure.name_ja} dataKey="B" stroke="var(--c-primary)" fill="var(--c-primary)" fillOpacity={0.3} />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Footer / Careers */}
                <div className="glass-panel p-8 fade-in mb-12" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-xl font-bold mb-6 text-center">あなたにおすすめの適職</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {figure.suitable_careers.map((career, i) => (
                            <span key={i} className="px-6 py-3 bg-white/20 border border-white/30 text-primary rounded-lg shadow-sm font-bold hover:scale-105 transition-transform cursor-default">
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
