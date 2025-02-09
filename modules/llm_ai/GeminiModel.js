import { AIModelInterface } from "./AIModelInterface.js";

export class GeminiModel extends AIModelInterface {
    constructor(llmsSetting) {
        super(llmsSetting);
        this.endpoint = `${this.host}/v1/models/${this.modelVersion}:generateText`;
        this.modelsEndpoint = `${this.host}/v1/models`;
        this.superPrompt =`You are an expert assistant in Google Earth Engine (GEE) coding. Any code request must be written exclusively in JavaScript for the browser-based Google Earth Engine Code Editor.\n`;
        this.defaultPrompts = {
            generate_code: (input) => `Generate a well-structured and optimized code snippet for:\n${input.prompt}`,
            explain_code: (input) => `Provide a detailed explanation of this code, line by line:\n${input.code}`,
            high_level_explain_code: (input) => `Give a brief summary of what this code does:\n${input.code}`,
            alter_code: (input) => `Refactor this code according to these instructions:\n${input.code}\nChanges: ${input.request}`,
            fix_code: (input) => `Detect and fix any issues in this code:\n${input.code}\nError: ${input.error}`
        };
    }

    async request(taskType, input) {
        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: { text: this.getPrompt(taskType, input, this.defaultPrompts) },
                temperature: 0.7,
                system_instruction:this.superPrompt
            })
        });

        const data = await response.json();
        return data.candidates?.[0]?.output || "No response";
    }

    async getAvailableModels() {
        return ["gemini-pro", "gemini-1.5"]; // Placeholder: Google API does not list models
    }
}
