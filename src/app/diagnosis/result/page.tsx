"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserInput, HistoricalFigure } from "@/lib/types";
import { findBestMatches, findPartner, findRival, MatchResult } from "@/lib/matching";
import { getRecommendedSkills } from "@/lib/skillMapping";
import ChatWindow from "@/components/ChatWindow"; // Import ChatWindow
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export default function ResultPage() {
    const router = useRouter();
    const [match, setMatch] = useState<MatchResult | null>(null);
    const [userScores, setUserScores] = useState<UserInput | null>(null);
    const [partner, setPartner] = useState<MatchResult | null>(null);
    const [rival, setRival] = useState<MatchResult | null>(null);
    const [allMatches, setAllMatches] = useState<MatchResult[]>([]);
    const [shareUrl, setShareUrl] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(window.location.href);
        }

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
            setAllMatches(results);
            setPartner(findPartner(input, results));
            setRival(findRival(results));
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
    const skills = getRecommendedSkills(figure.talents);
    const shareText = `私の魂の偉人は【${figure.name_ja}】でした！あなたも診断してみよう。 #歴史的偉人診断`;

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

    const PersonalityBar = ({ labelL, labelR, valA, valB }: { labelL: string, labelR: string, valA: number, valB: number }) => {
        const posA = Math.min(100, Math.max(0, valA * 10));
        const posB = Math.min(100, Math.max(0, valB * 10));

        return (
            <div className="mb-6 last:mb-0">
                <div className="flex justify-between text-xs font-bold text-muted mb-2">
                    <span>{labelL}</span>
                    <span>{labelR}</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full w-full">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-300 transform -translate-x-1/2" />
                    <div className="absolute top-1/2 w-4 h-4 bg-accent rounded-full border-2 border-white shadow-md transform -translate-y-1/2 -translate-x-1/2 z-20" style={{ left: `${posA}%` }} title="あなた" />
                    <div className="absolute top-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md transform -translate-y-1/2 -translate-x-1/2 z-10" style={{ left: `${posB}%` }} title={figure.name_ja} />
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen py-12 px-4 bg-background relative overflow-hidden">
            <div className="bg-pattern" />

            <div className="container max-w-5xl mx-auto">
                <div className="text-center mb-12 fade-in">
                    <p className="text-muted mb-2">あなたの魂と共鳴する偉人は...</p>
                    <h1 className="text-4xl md:text-5xl font-serif text-primary font-bold mb-4">{figure.name_ja}</h1>
                    <p className="text-xl text-accent font-serif">{figure.title}</p>
                </div>

                <div className="glass-panel p-8 fade-in mb-8" style={{ animationDelay: '0.2s' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 pb-2">人物像</h3>
                            <p className="leading-relaxed mb-8 font-medium text-lg">{figure.description}</p>
                            <div className="bg-primary/5 p-8 rounded-lg min-h-[120px] flex items-center justify-center">
                                <p className="text-xl md:text-2xl font-serif text-center text-primary italic leading-relaxed">
                                    <span className="text-3xl opacity-30 mr-2">“</span>
                                    {figure.quote}
                                    <span className="text-3xl opacity-30 ml-2">”</span>
                                </p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="glass-panel p-8 fade-in flex flex-col" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-xl font-bold mb-8 text-center border-b border-gray-200 pb-2">性格特性の比較</h3>
                        <div className="space-y-8 flex-grow justify-center flex flex-col">
                            <PersonalityBar labelL="内向的 (I)" labelR="外向的 (E)" valA={userScores.personalities.ei} valB={figure.personalities.ei} />
                            <PersonalityBar labelL="直感的 (N)" labelR="感覚的 (S)" valA={userScores.personalities.sn} valB={figure.personalities.sn} />
                            <PersonalityBar labelL="論理的 (T)" labelR="感情的 (F)" valA={userScores.personalities.tf} valB={figure.personalities.tf} />
                            <PersonalityBar labelL="柔軟 (P)" labelR="几帳面 (J)" valA={userScores.personalities.jp} valB={figure.personalities.jp} />
                        </div>
                        <div className="flex justify-center gap-6 text-sm text-muted mt-8">
                            <div className="flex items-center gap-2">
                                <span className="block w-3 h-3 bg-accent rounded-full border border-white shadow-sm"></span>
                                <span>あなた</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="block w-3 h-3 bg-primary rounded-full border border-white shadow-sm"></span>
                                <span>{figure.name_ja}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 fade-in flex flex-col items-center" style={{ animationDelay: '0.5s' }}>
                        <h3 className="text-xl font-bold mb-2 text-center border-b border-gray-200 pb-2 w-full">才能マップ</h3>
                        <div style={{ width: '100%', height: '400px', marginTop: '1rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={talentData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--c-text-muted)', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="あなた" dataKey="A" stroke="var(--c-accent)" fill="var(--c-accent)" fillOpacity={0.5} />
                                    <Radar name={figure.name_ja} dataKey="B" stroke="var(--c-primary)" fill="var(--c-primary)" fillOpacity={0.3} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {partner && (
                        <div className="glass-panel p-6 fade-in border-l-4 border-l-accent" style={{ animationDelay: '0.5s' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Business Partner</span>
                                    <h3 className="text-lg font-bold">最高の相棒</h3>
                                </div>
                                <span className="text-2xl font-serif">🤝</span>
                            </div>
                            <p className="text-xl font-serif font-bold text-primary mb-1">{partner.figure.name_ja}</p>
                            <p className="text-sm text-muted mb-3">{partner.figure.title}</p>
                            <p className="text-sm opacity-80 line-clamp-2">{partner.figure.description}</p>
                        </div>
                    )}
                    {rival && (
                        <div className="glass-panel p-6 fade-in border-l-4 border-l-secondary" style={{ animationDelay: '0.6s' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">Rival</span>
                                    <h3 className="text-lg font-bold">手強いライバル</h3>
                                </div>
                                <span className="text-2xl font-serif">⚡️</span>
                            </div>
                            <p className="text-xl font-serif font-bold text-primary mb-1">{rival.figure.name_ja}</p>
                            <p className="text-sm text-muted mb-3">{rival.figure.title}</p>
                            <p className="text-sm opacity-80 line-clamp-2">{rival.figure.description}</p>
                        </div>
                    )}
                </div>

                <div className="glass-panel p-8 fade-in mb-12" style={{ animationDelay: '0.7s' }}>
                    <h3 className="text-xl font-bold mb-6 text-center border-b border-gray-200 pb-2">他に相性の良い偉人</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {allMatches.slice(1, 3).map((m, i) => (
                            <div key={m.figure.id} className="flex items-center gap-4 p-4 bg-white/40 rounded-lg shadow-sm">
                                <div className="text-2xl font-bold text-accent opacity-50">#{i + 2}</div>
                                <div>
                                    <h4 className="font-bold text-lg text-primary">{m.figure.name_ja}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <span>共鳴度: <span className="font-bold text-accent">{m.similarityScore}%</span></span>
                                        <span>•</span>
                                        <span>{m.figure.title}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8 fade-in mb-12" style={{ animationDelay: '0.8s' }}>
                    <h3 className="text-xl font-bold mb-6 text-center border-b border-gray-200 pb-2">これから学ぶべきスキル</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {skills.map((skill, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white/40 rounded-lg">
                                <span className="text-accent text-xl">📚</span>
                                <span className="font-bold text-primary">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8 fade-in mb-12 text-center" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-xl font-bold mb-6">あなたにおすすめの適職</h3>
                    <p className="text-lg text-primary font-medium leading-loose">
                        {figure.suitable_careers.join('、')}
                    </p>
                </div>

                <div className="text-center mb-12 fade-in" style={{ animationDelay: '1.0s' }}>
                    <h4 className="text-sm font-bold text-muted mb-4">結果をシェアする</h4>
                    <div className="flex justify-center gap-4 mb-8">
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-black text-white rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <span>X (Twitter)</span>
                        </a>
                        <a
                            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-[#06C755] text-white rounded-full font-bold shadow-md hover:bg-[#05b34c] transition-colors flex items-center gap-2"
                        >
                            <span>LINE</span>
                        </a>
                    </div>
                </div>

                <div className="text-center mb-16 fade-in" style={{ animationDelay: '1.1s' }}>
                    <p className="mb-4 text-primary font-serif font-bold text-lg">悩み事はありませんか？<br />彼なら何か答えを知っているかもしれません。</p>
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="px-8 py-4 bg-gradient-to-r from-accent to-yellow-600 text-white rounded-full font-bold text-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
                    >
                        <span>💬 {figure.name_ja}に相談する</span>
                    </button>
                </div>

                <div className="text-center fade-in" style={{ animationDelay: '1.2s' }}>
                    <button onClick={() => router.push('/')} className="btn-primary text-sm px-8 py-3 bg-gray-600 hover:bg-gray-700">
                        トップに戻る
                    </button>
                </div>
            </div>

            <ChatWindow figure={figure} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </main>
    );
}
