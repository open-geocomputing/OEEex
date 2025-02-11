import { AIModelInterface } from "./AIModelInterface.js";

export class GeminiModel extends AIModelInterface {
    constructor(llmsSetting) {
        super(llmsSetting);
        this.endpoint = `${this.host}/v1/models/${this.modelVersion}:generateText`;
        this.modelsEndpoint = `${this.host}/v1/models`;
        this.superPrompt =`You are an expert assistant in Google Earth Engine (GEE) coding. Any code request must be written exclusively in JavaScript for the browser-based Google Earth Engine Code Editor. Additionally comment should be written exlusively in ${this.language}. For explanatory text that needs to be structured, use Markdown syntax.\n`;
        this.defaultPrompts = {
            generate_code:  this.stringToFunction("Generate efficient code for:\n${prompt}"),
            explain_code: this.stringToFunction("Explain this code line by line:\n${code}"),
            high_level_explain_code: this.stringToFunction("Summarize the purpose of this code:\n${code}"),
            alter_code: this.stringToFunction("Modify the following code:\n${code}\nChanges: ${prompt}\n Prefer to provide a code pach if possible, alternatively you can provide a complete code."),
            fix_code: this.stringToFunction("Fix the errors in this code:\n${code}\nError: ${error}\n Provide only the code patch (diff file) to correct the code. Diff content should be dircetly in the patch parameter or the answer.")
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

    async generateCode(input) {
        const payload = {
            prompt: {
                text: this.superPrompt + this.getPrompt("generate_code", input, this.defaultPrompts)
            },
            temperature: 0.7,
            system_instruction: this.superPrompt,
            generationConfig: {
                response_mime_type: "application/json",
                response_schema: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                        explanation: { type: "string" }
                    },
                    required: ["code", "explanation"]
                }
            }
        };

        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.output) || "No response";
    }

    async explainCode(input) {
        const payload = {
            prompt: {
                text: this.superPrompt + this.getPrompt("explain_code", input, this.defaultPrompts)
            },
            temperature: 0.7,
            system_instruction: this.superPrompt,
            generationConfig: {
                response_mime_type: "application/json",
                response_schema: {
                    type: "object",
                    properties: {
                        explanations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    code_line: { type: "string" },
                                    comment: { type: "string" }
                                },
                                required: ["code_line", "comment"],
                                additionalProperties: false
                            }
                        }
                    },
                    required: ["explanations"],
                    additionalProperties: false
                }
            }
        };

        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.output) || "No response";
    }

    async highLevelExplainCode(input) {
        const payload = {
            prompt: {
                text: this.superPrompt + this.getPrompt("high_level_explain_code", input, this.defaultPrompts)
            },
            temperature: 0.7,
            system_instruction: this.superPrompt,
            generationConfig: {
                response_mime_type: "application/json",
                response_schema: {
                    type: "object",
                    properties: {
                        explanation: { type: "string" }
                    },
                    required: ["explanation"],
                    additionalProperties: false
                }
            }
        };

        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.output) || "No response";
    }

    async alterCode(input) {
        const payload = {
            prompt: {
                text: this.superPrompt + this.getPrompt("alter_code", input, this.defaultPrompts)
            },
            temperature: 0.7,
            system_instruction: this.superPrompt,
            generationConfig: {
                response_mime_type: "application/json",
                response_schema: {
                    type: "object",
                    properties: {
                        explanation: { type: "string" },
                        code: { type: "string" },
                        patch: { type: "string" }
                    },
                    required: ["explanation"],
                    oneOf: [
                        { required: ["code"] },
                        { required: ["patch"] }
                    ],
                    additionalProperties: false
                }
            }
        };

        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.output) || "No response";
    }

    async fixCode(input) {
        const payload = {
            prompt: {
                text: this.superPrompt + this.getPrompt("fix_code", input, this.defaultPrompts)
            },
            temperature: 0.7,
            system_instruction: this.superPrompt,
            generationConfig: {
                response_mime_type: "application/json",
                response_schema: {
                    type: "object",
                    properties: {
                        explanation: { type: "string" },
                        patch: { type: "string" }
                    },
                    required: ["explanation", "patch"],
                    additionalProperties: false
                }
            }
        };

        const response = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.output) || "No response";
    }


}
