import { AIModelInterface } from "./AIModelInterface.js";

export class OllamaModel extends AIModelInterface {
    constructor(llmsSetting, extensionId=null) {
        super(llmsSetting);
        this.extensionId=extensionId;
        this.isLocalhost = this.host.includes("localhost") || this.host.includes("127.0.0.1");
        this.endpoint = `${this.host}/api/generate`;
        this.modelsEndpoint = `${this.host}/api/tags`;  
        this.superPrompt =`You are an expert assistant in Google Earth Engine (GEE) coding. Any code request must be written exclusively in JavaScript for the browser-based Google Earth Engine Code Editor. Additionally comment should be written exlusively in ${this.language}. For explanatory text that needs to be structured, use Markdown syntax.\n`;
        this.isStructurableOuptutCompatible=this.modelVersion.startsWith("llama");
        this.defaultPrompts = {
            generate_code:  this.stringToFunction("Generate efficient code for:\n${prompt}"),
            explain_code: this.stringToFunction("Explain this code line by line:\n${code}"),
            high_level_explain_code: this.stringToFunction("Summarize the purpose of this code:\n${code}"),
            alter_code: this.stringToFunction("Modify the following code:\n${code}\nChanges: ${prompt}\n Provide a complete code."),
            fix_code: this.stringToFunction("Fix the errors in this code:\n${code}\nError: ${errors}\n\nProvide only the code patch in unified diff (git diff) format. \nRequirements for the patch:\n- Use the standard headers: \"--- a/<filename>\" and \"+++ b/<filename>\".\n- Each hunk header must include proper line ranges (e.g., \"@@ -1,2 +1,2 @@\"), not just \"@@\".\n- Do NOT put line number in the front of each line.\n- Removed lines must start with \"-\", and added lines with \"+\".\n- Do not rewrite unchanged lines as removed/added.\n- Always include at least one line of unchanged context before and after the change, if possible.\n- The output must be a valid patch that can be applied directly with \"git apply\" or \"Diff.applyPatch\".")
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
        const format={
                type: "object",
                properties: {
                  code: {
                    type: "string"
                  },
                  explanation: {
                    type: "string"
                  }
                },
                required: [
                  "code",
                  "explanation"
                ]
              }

        const payload = {
            model: this.modelVersion,
            system: this.superPrompt+(!this.isStructurableOuptutCompatible? "\n The output should be a JSON that follow a structure compatible with this format structure: "+JSON.stringify(format):""),
            prompt: this.getPrompt("generate_code", input, this.defaultPrompts),
            stream: false,
            ...(this.isStructurableOuptutCompatible? {format:format}:{})
            };

        console.log(payload)
        const response = await this.fetchOllama(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(data)
        return JSON.parse(data.response);
    }

    async explainCode(input) {
        const format={
                type: "object",
                properties: {
                    explanations: {
                        type: "array",
                        description: "An array of code lines along with their associated comments.",
                        items: {
                            type: "object",
                            properties: {
                                code_line: {
                                    type: "string",
                                    description: "The line of code explained."
                                },
                                comment: {
                                    type: "string",
                                    description: "The associated comment explaining the line of code."
                                }
                            },
                            required: ["code_line", "comment"],
                            additionalProperties: false
                        }
                    }
                },
                required: ["explanations"],
                additionalProperties: false
            };

        const payload = {
            model: this.modelVersion,
            system: this.superPrompt+(!this.isStructurableOuptutCompatible? "\n The output should be a JSON that follow a structure compatible with this format structure: "+JSON.stringify(format)+"\n Do not put suround text, provide online the valide JSON.":""),
            prompt: this.getPrompt("explain_code", input, this.defaultPrompts),
            stream: false,
            ...(this.isStructurableOuptutCompatible? {format:format}:{}) 
        };

        const response = await this.fetchOllama(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log(data)
        return JSON.parse(data.response);
    }

    async highLevelExplainCode(input) {
        const format={
                type: "object",
                properties: {
                    explanation: { type: "string" }
                },
                required: ["explanation"],
                additionalProperties: false
            };

        const payload = {
            model: this.modelVersion,
            system: this.superPrompt+(!this.isStructurableOuptutCompatible? "\n The output should be a JSON that follow a structure compatible with this format structure: "+JSON.stringify(format):""),
            prompt: this.getPrompt("high_level_explain_code", input, this.defaultPrompts),
            stream: false,
            ...(this.isStructurableOuptutCompatible? {format:format}:{}) 
        };

        const response = await this.fetchOllama(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.response);
    }

    async alterCode(input) {
        const format={
                type: "object",
                properties: {
                    explanation: { type: "string" },
                    code: { type: "string" },
                    //patch: { type: "string" }
                },
                required: ["explanation","code"],
                additionalProperties: false
            }

        const payload = {
            model: this.modelVersion,
            system: this.superPrompt+(!this.isStructurableOuptutCompatible? "\n The output should be a JSON that follow a structure compatible with this format structure: "+JSON.stringify(format):""),
            prompt: this.getPrompt("alter_code", input, this.defaultPrompts),
            stream: false,
            ...(this.isStructurableOuptutCompatible? {format:format}:{}) 
        };

        const response = await this.fetchOllama(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        return JSON.parse(data.response);
    }

    async fixCode(input) {
        const format={
                type: "object",
                properties: {
                    explanation: { type: "string" },
                    patch: { type: "string" }
                },
                required: ["explanation", "patch"],
                additionalProperties: false
            };

        const payload = {
            model: this.modelVersion,
            system: this.superPrompt+(!this.isStructurableOuptutCompatible? "\n The output should be a JSON that follow a structure compatible with this format structure: "+JSON.stringify(format):""),
            prompt: this.getPrompt("fix_code", input, this.defaultPrompts),
            stream: false,
            ...(this.isStructurableOuptutCompatible? {format:format}:{}) 
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
