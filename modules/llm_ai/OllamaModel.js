import { AIModelInterface } from "./AIModelInterface.js";

export class OllamaModel extends AIModelInterface {
    constructor(llmsSetting, extensionId=null) {
        super(llmsSetting);
        this.extensionId=extensionId;
        this.isLocalhost = this.host.includes("localhost") || this.host.includes("127.0.0.1");
        this.endpoint = `${this.host}/api/generate`;
        this.modelsEndpoint = `${this.host}/api/tags`;
        this.superPrompt ="You are an expert assistant in Google Earth Engine (GEE) coding. Any code request must be written exclusively in JavaScript for the browser-based Google Earth Engine Code Editor.\n";
        this.defaultPrompts = {
            generate_code:  this.stringToFunction("Generate efficient code for:\n${prompt}"),
            explain_code: this.stringToFunction("Explain this code line by line:\n${code}"),
            high_level_explain_code: this.stringToFunction("Summarize the purpose of this code:\n${code}"),
            alter_code: this.stringToFunction("Modify the following code:\n${code}\nChanges: ${prompt}"),
            fix_code: this.stringToFunction("Fix the errors in this code:\n${code}\nError: ${error}")
        };
    }

    async fetchOllama() {
        if (this.isLocalhost) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(this.extensionId,
                    {action:"ollamaRequest",arguments:[...arguments]},
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
        } else {
            return fetch.apply(null, arguments);
        }
    }

    async request(taskType, input) {
        const payload = {
            model: this.modelVersion,
            prompt: this.superPrompt+this.getPrompt(taskType, input, this.defaultPrompts),
            stream: false
        };

        const response = await this.fetchOllama(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data.response || "No response";
    }

    async generateCode(input) {
        const payload = {
            model: this.modelVersion,
            system: this.superPrompt,
            prompt: this.getPrompt("generate_code", input, this.defaultPrompts),
            stream: false,
            format: {
                type: "object",
                properties: {
                  code: {
                    type: "string"
                  },
                  explanation: {
                    "type": "string"
                  }
                },
                required: [
                  "code",
                  "explanation"
                ]
              }
            };

        const response = await this.fetchOllama(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return JSON.parse(data.response);
    }

    async getAvailableModels() {
        const response = await this.fetchOllama(this.modelsEndpoint);
        const data = await response.json();
        return data.models?.map(model => model.name) || [];
    }
}
