import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

const run = async () => {
    try {
        // Read .env manually to avoid dependencies
        const envPath = path.resolve(process.cwd(), '.env');
        let key = '';

        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            const match = content.match(/VITE_GEMINI_API_KEY=(.*)/);
            if (match) {
                key = match[1].trim();
            }
        }

        if (!key) throw new Error("No VITE_GEMINI_API_KEY found in .env");

        console.log("Using Key:", key.substring(0, 5) + "..." + key.substring(key.length - 5));

        const client = new GoogleGenAI({ apiKey: key });

        console.log("Fetching models...");
        const response = await client.models.list();

        console.log("\n--- AVAILABLE MODELS ---");
        for await (const model of response) {
            console.log(`- ${model.name} (Display: ${model.displayName})`);
            console.log(`  Supported: ${model.supportedGenerationMethods?.join(', ')}`);
        }
    } catch (e: any) {
        console.error("Error listing models:", e);
        if (e.response) {
            console.error("API Response:", await e.response.text());
        }
    }
};

run();
