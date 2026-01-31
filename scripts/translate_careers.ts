import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    console.error("❌ GOOGLE_API_KEY is missing in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.0-flash";

const FIGURES_FILE = path.join(__dirname, "../src/data/figures.json");

interface HistoricalFigure {
    id: string;
    name_ja: string;
    suitable_careers: string[];
    [key: string]: any;
}

async function translateCareers(careers: string[]): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const prompt = `
    Translate the following list of job titles from English to Japanese strings.
    Keep the nuance of modern roles.
    Input: ${JSON.stringify(careers)}
    Output strictly a JSON array of strings.
    Example Input: ["CEO", "Warrior"]
    Example Output: ["CEO", "戦士"]
  `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Simple cleanup to find JSON array
        const jsonStart = text.indexOf("[");
        const jsonEnd = text.lastIndexOf("]") + 1;
        if (jsonStart === -1 || jsonEnd === 0) return careers;

        const jsonStr = text.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Translation error:", error);
        return careers; // Fallback to original
    }
}

async function main() {
    if (!fs.existsSync(FIGURES_FILE)) {
        console.error("❌ figures.json not found");
        process.exit(1);
    }

    const figures: HistoricalFigure[] = JSON.parse(fs.readFileSync(FIGURES_FILE, "utf-8"));
    const total = figures.length;
    console.log(`🔍 Found ${total} figures. Starting translation...`);

    // Batch process to avoid hitting rate limits hard, or just sequential with delay
    // Since we have ~115 figures, doing 115 requests might take time.
    // We can batch them? Or just loop. 
    // Let's loop with delay.

    for (let i = 0; i < total; i++) {
        const fig = figures[i];
        console.log(`[${i + 1}/${total}] Translating for ${fig.name_ja}...`);

        // Check if likely already Japanese (contains Hiragana/Katakana/Kanji)
        // regex for Japanese chars
        const hasJapanese = fig.suitable_careers.some(c => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(c));

        if (hasJapanese) {
            console.log(`  -> Already Japanese, skipping.`);
            continue;
        }

        const translated = await translateCareers(fig.suitable_careers);
        fig.suitable_careers = translated;
        console.log(`  -> Done: ${translated.join(", ")}`);

        // Sleep 1 sec to be safe
        await new Promise(r => setTimeout(r, 1000));
    }

    fs.writeFileSync(FIGURES_FILE, JSON.stringify(figures, null, 2));
    console.log("✅ Translation complete. Saved to figures.json");
}

main();
