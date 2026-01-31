import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
    console.error("Error: GOOGLE_API_KEY is not defined");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        // There isn't a direct "listModels" on the instance in some SDK versions, but let's try to infer or just test a standard one.
        // Actually, the error message suggested "Call ListModels". In the Node SDK, this is often done via the ModelService, but it's not always exposed simply.
        // Instead, let's try a very standard legacy model name like 'gemini-pro' to see if it works, 
        // BUT better yet, I will try to use the model manager if available or just test 'gemini-pro'.

        // Let's try to just run a simple prompt with 'gemini-pro' which should exist.
        console.log("Testing gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello");
        console.log("gemini-pro is working. Response:", result.response.text());

        console.log("Testing gemini-1.5-flash again...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resultFlash = await modelFlash.generateContent("Hello");
        console.log("gemini-1.5-flash is working. Response:", resultFlash.response.text());

    } catch (error) {
        console.error("Error testing models:", error);
    }
}

listModels();
