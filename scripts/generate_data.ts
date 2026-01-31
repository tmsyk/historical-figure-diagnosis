import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not defined in .env.local or environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using 2.0 Flash as available

const OUTPUT_FILE = path.join(process.cwd(), "src/data/figures.json");

// Definitions
const CATEGORIES = [
  "日本の武将・政治家 (戦国〜幕末)",
  "世界の政治家・リーダー (古代〜現代)",
  "実業家・経営者 (世界・日本)",
  "科学者・発明家 (世界・日本)",
  "芸術家・クリエイター (画家、音楽家、作家)",
  "哲学者・思想家・活動家",
];

const PROMPT_TEMPLATE = `
You are a historian and psychologist. Generate a list of 20 distinct historical figures for the category: "{CATEGORY}".
Output strictly valid JSON list.

Each figure object must have:
- id: string (unique, e.g., "oda_nobunaga")
- name_ja: string (Japanese name)
- name_en: string (English name)
- category: string ("{CATEGORY}")
- era: string (e.g., "戦国時代", "19th Century")
- title: string (short title, e.g., "天下布武の覇王")
- personalities: {
   // MBTI-based axes (1-10 scale)
   // 1(Left) <---> 10(Right)
   // EI: Introvert(1) <-> Extrovert(10)
   // SN: Sensing(1) <-> Intuition(10)
   // TF: Feeling(1) <-> Thinking(10)
   // JP: Perceiving(1) <-> Judging(10)
   ei: number,
   sn: number,
   tf: number,
   jp: number
}
- talents: {
   // 1-10 scale
   strategic: number, // 戦略性
   ideation: number, // 着想
   execution: number, // 実行力
   influence: number, // 影響力
   empathy: number, // 共感性
   analysis: number, // 分析思考
   adaptability: number, // 適応性
   resilience: number, // 回復志向・忍耐
   visionary: number, // 未来志向
   charisma: number // カリスマ
}
- mbti_type: string (e.g., "ENTJ")
- description: string (2-3 sentences explaining their personality and achievements in Japanese)
- quote: string (Famous quote in Japanese)
- suitable_careers: string[] (List of 3 modern suitable jobs)

Ensure diversity in the list.
JSON Output:
`;

async function generateCategory(category: string) {
  console.log(`Generating figures for category: ${category}...`);
  try {
    const result = await model.generateContent(PROMPT_TEMPLATE.replace("{CATEGORY}", category));
    const response = await result.response;
    let text = response.text();

    // Clean up markdown code blocks if present
    text = text.replace(/^```json\n/, "").replace(/\n```$/, "").replace(/^```\n/, ""); // Basic cleanup

    // Find JSON array brackets just in case
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start === -1 || end === -1) {
      throw new Error("No JSON array found in response");
    }
    const jsonStr = text.substring(start, end + 1);

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Failed to generate for ${category}:`, error);
    return [];
  }
}

async function main() {
  let allFigures: any[] = [];

  for (const category of CATEGORIES) {
    const figures = await generateCategory(category);
    console.log(`> Generated ${figures.length} figures for ${category}`);
    allFigures = [...allFigures, ...figures];
    // Sleep briefly to avoid rate limits if any
    await new Promise(r => setTimeout(r, 2000));
  }

  // Deduplicate by ID
  const seen = new Set();
  const uniqueFigures = allFigures.filter(f => {
    const duplicate = seen.has(f.id);
    seen.add(f.id);
    return !duplicate;
  });

  console.log(`Total unique figures generated: ${uniqueFigures.length}`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueFigures, null, 2));
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main();
