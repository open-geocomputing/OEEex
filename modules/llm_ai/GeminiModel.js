import { AIModelInterface } from "./AIModelInterface.js";

export class GeminiModel extends AIModelInterface {
    constructor(llmsSetting) {
        super(llmsSetting);
        this.endpoint = `${this.host}/v1/models/${this.modelVersion}:generateText`;
        this.modelsEndpoint = `${this.host}/v1/models`;
        this.superPrompt =`You are an expert assistant in Google Earth Engine (GEE) coding. Any code request must be written exclusively in JavaScript for the browser-based Google Earth Engine Code Editor.\n`;
        this.defaultPrompts = {
            enerate_code:  this.stringToFunction("Generate efficient code for:\n${prompt}"),
            explain_code: this.stringToFunction("Explain this code line by line:\n${code}"),
            high_level_explain_code: this.stringToFunction("Summarize the purpose of this code:\n${code}"),
            alter_code: this.stringToFunction("Modify the following code:\n${code}\nChanges: ${request}"),
            fix_code: this.stringToFunction("Fix the errors in this code:\n${code}\nError: ${error}")
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
