"use client";

import { useState, useRef, useEffect } from "react";
import { HistoricalFigure } from "@/lib/types";

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface ChatWindowProps {
    figure: HistoricalFigure;
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatWindow({ figure, isOpen, onClose }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: `やあ。${figure.name_ja}だ。何か悩みがあるなら聞こうか。` }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Transform messages for Gemini API history format
            // API expects: { role: 'user'|'model', parts: [{ text: string }] }
            const history = messages.slice(1).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    figureId: figure.id,
                    message: userMsg,
                    history: history
                })
            });

            if (!res.ok) throw new Error("Failed to send message");

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "申し訳ない。通信が途絶えてしまったようだ。" }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 fade-in">
            <div className="bg-[#fcfbf9] w-full max-w-lg rounded-xl shadow-2xl border border-[#d4c5b0] flex flex-col h-[600px] max-h-[80vh] relative overflow-hidden">
                {/* Header */}
                <div className="bg-primary text-white p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl">
                            🤴
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{figure.name_ja}</h3>
                            <p className="text-xs opacity-80">{figure.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/noise.png')]">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${m.role === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white text-primary border border-gray-100 rounded-bl-none'}
                            `}>
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-primary p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="相談事を入力..."
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 text-primary placeholder-gray-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        AIは不正確な情報を生成する可能性があります。
                    </p>
                </div>
            </div>
        </div>
    );
}
