export class AIModelInterface {
    constructor(llmsSetting) {
        this.host = llmsSetting.interfaceParam.host || "";
        this.apiKey = llmsSetting.interfaceParam.apiKey || "";
        this.modelVersion = llmsSetting.interfaceParam.modelVersion || "";
        this.customPrompt = llmsSetting.interfaceParam.customPrompt || {};
    }

    setModelVersion(modelVersion) {
        this.modelVersion = modelVersion;
    }

    async request(taskType, input) {
        throw new Error("Method 'request' must be implemented in subclasses.");
    }

    async getAvailableModels() {
        throw new Error("Method 'getAvailableModels' must be implemented in subclasses.");
    }

    getPrompt(taskType, input, defaultPrompts) {
        return this.customPrompt[taskType] || defaultPrompts[taskType](input);
    }

    async generateCode(prompt) {
        return this.request("generate_code", { prompt });
    }

    async explainCode(code) {
        return this.request("explain_code", { code });
    }

    async highLevelExplainCode(code) {
        return this.request("high_level_explain_code", { code });
    }

    async alterCode(code, request) {
        return this.request("alter_code", { code, request });
    }

    async fixCode(code, error) {
        return this.request("fix_code", { code, error });
    }
}
