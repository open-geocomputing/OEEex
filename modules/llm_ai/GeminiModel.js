import { AIModelInterface } from "./AIModelInterface.js";

export class GeminiModel extends AIModelInterface {
    constructor(llmsSetting, extensionId=null) {
        super(llmsSetting);
        this.extensionId=extensionId;
        this.endpoint = `${this.host}models/${this.modelVersion}:generateContent`;
        this.modelsEndpoint = `${this.host}/models`;
        this.superPrompt =`You are an expert assistant in Google Earth Engine (GEE) coding. Any code request must be written exclusively in JavaScript for the browser-based Google Earth Engine Code Editor. Additionally comment should be written exlusively in ${this.language}. For explanatory text that needs to be structured, use Markdown syntax.\n`;
        this.defaultPrompts = {
            generate_code:  this.stringToFunction("Generate efficient code for:\n${prompt}"),
            explain_code: this.stringToFunction("Explain this code line by line:\n${code}"),
            high_level_explain_code: this.stringToFunction("Summarize the purpose of this code:\n${code}"),
            alter_code: this.stringToFunction("Modify the following code:\n${code}\nChanges: ${prompt}\n Prefer to provide a code pach if possible, alternatively you can provide a complete code."),
            fix_code: this.stringToFunction("Fix the errors in this code:\n${code}\nError: ${errors}\n Provide only the code patch (diff file) to correct the code. Diff content should be dircetly in the patch parameter or the answer.")
        };
    }

    async fetchGemini() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(this.extensionId,
                {action:"geminiRequest",arguments:[...arguments]},
                (serializedResponse) => {
                    if(!serializedResponse)
                        reject("Extension connection error")
                    const { status, statusText, headers, body } = JSON.parse(serializedResponse);

                    let response = new Response(body, {
                        status,
                        statusText,
                        headers,
                      });
                    resolve(response)
                }
            );
        });
    }

    async request(taskType, input) {
        const response = await this.fetchGemini(this.endpoint+`?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: { text: this.getPrompt(taskType, input, this.defaultPrompts) },
                temperature: 0.7,
                system_instruction:this.superPrompt
            })
        });

        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts[0]?.text) || "No response";
    }

    async getAvailableModels() {
        return ["gemini-pro", "gemini-1.5"]; // Placeholder: Google API does not list models
    }

    async generateCode(input) {
        const payload = {
            contents: [
            {
              role: "user",
              parts: [
                {
                  text: this.getPrompt("generate_code", input, this.defaultPrompts)
                }
              ]
            }
          ],
          systemInstruction: {
            role: "user",
            parts: [
              {
                text: this.superPrompt
              }
            ]
          },
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        code: { type: "string" },
                        explanation: { type: "string" }
                    },
                    required: ["code", "explanation"]
                }
            }
        };

        const response = await this.fetchGemini(this.endpoint+`?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts[0]?.text) || "No response";
    }

    async explainCode(input) {
         const payload = {
            contents: [
            {
              role: "user",
              parts: [
                {
                  text: this.getPrompt("explain_code", input, this.defaultPrompts)
                }
              ]
            }
          ],
          systemInstruction: {
            role: "user",
            parts: [
              {
                text: this.superPrompt
              }
            ]
          },
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    explanations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          code_line: {
                            type: "string"
                          },
                          comment: {
                            type: "string"
                          }
                        },
                        required: [
                          "code_line",
                          "comment"
                        ]
                      }
                    }
                  },
                  required: [
                    "explanations"
                  ]
                }
            }
        };

        const response = await this.fetchGemini(this.endpoint+`?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts[0]?.text) || "No response";
    }

    async highLevelExplainCode(input) {
        const payload = {
            contents: [
            {
              role: "user",
              parts: [
                {
                  text: this.getPrompt("high_level_explain_code", input, this.defaultPrompts)
                }
              ]
            }
          ],
          systemInstruction: {
            role: "user",
            parts: [
              {
                text: this.superPrompt
              }
            ]
          },
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        explanation: { type: "string" }
                    },
                    required: ["explanation"]
                }
            }
        };

        const response = await this.fetchGemini(this.endpoint+`?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts[0]?.text) || "No response";
    }

    async alterCode(input) {

        const payload = {
            contents: [
            {
              role: "user",
              parts: [
                {
                  text: this.getPrompt("alter_code", input, this.defaultPrompts)
                }
              ]
            }
          ],
          systemInstruction: {
            role: "user",
            parts: [
              {
                text: this.superPrompt
              }
            ]
          },
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
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
                    ]
                }
            }
        };


        const response = await this.fetchGemini(this.endpoint+`?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts[0]?.text) || "No response";
    }

    async fixCode(input) {

        const payload = {
            contents: [
            {
              role: "user",
              parts: [
                {
                  text: this.getPrompt("fix_code", input, this.defaultPrompts)
                }
              ]
            }
          ],
          systemInstruction: {
            role: "user",
            parts: [
              {
                text: this.superPrompt
              }
            ]
          },
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        patch: { type: "string" },
                        explanation: { type: "string" }
                    },
                    required: ["patch", "explanation"]
                }
            }
        };


        const response = await this.fetchGemini(this.endpoint+`?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.candidates?.[0]?.content?.parts[0]?.text) || "No response";
    }


}
