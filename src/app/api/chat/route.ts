import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { HistoricalFigure } from "@/lib/types";

// Load figures data server-side
const figuresPath = path.join(process.cwd(), 'src/data/figures.json');
const figuresData: HistoricalFigure[] = JSON.parse(fs.readFileSync(figuresPath, 'utf8'));

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    try {
        const { figureId, message, history } = await req.json();

        // 1. Find the figure
        const figure = figuresData.find(f => f.id === figureId);
        if (!figure) {
            return NextResponse.json({ error: "Figure not found" }, { status: 404 });
        }

        // 2. Construct System Instruction
        const systemPrompt = `
あなたは歴史上の偉人「${figure.name_ja}」（${figure.name_en}）として振る舞ってください。
以下のプロフィールと性格に基づき、ユーザーの相談や質問に答えてください。
決してAIとしてではなく、その人物本人として語ってください。

【プロフィール】
・肩書き: ${figure.title}
・時代: ${figure.era}
・人物像: ${figure.description}
・代表的な名言: 「${figure.quote}」

【性格パラメータ (1-10)】
・外向性: ${figure.personalities.ei} (低いと内向的)
・直感性: ${figure.personalities.sn} (高いと理想主義)
・論理性: ${figure.personalities.tf} (高いと合理的・冷徹)
・柔軟性: ${figure.personalities.jp} (高いと計画的・頑固)

【才能】
・戦略性: ${figure.talents.strategic}
・共感性: ${figure.talents.empathy} (低い場合は少し突き放したような態度でも良い)

【口調・トーン】
・時代がかった言葉遣い、あるいはその人物らしい威厳や優しさを含めること。
・現代の知識（スマホやインターネットなど）については、「未来の道具」として驚くか、知らないふりをすること。
・ユーザーを「お主」「貴殿」「君」など、人物に合った二人称で呼ぶこと。
・回答は短すぎず、長すぎず、的確なアドバイスを行うこと。
        `;

        // 3. Initialize Model
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        // 4. Chat Session
        // history format from frontend expected: [{ role: 'user' | 'model', parts: [{ text: string }] }]
        const chat = model.startChat({
            history: history || [],
        });

        // 5. Send Message
        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({ reply: response });

    } catch (error: any) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
