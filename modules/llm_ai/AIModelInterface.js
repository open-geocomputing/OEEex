if (window.trustedTypes && window.trustedTypes.createPolicy) { // Feature testing
    window.trustedTypes.createPolicy('default', {
        createHTML: (string) => string,
        createScriptURL: string => string, // warning: this is unsafe!
        createScript: string => string, // warning: this is unsafe!
    });
}

export class AIModelInterface {
   
    stringToFunction(s){
        let f= (input) => new Function(
          ...Object.keys(input),  // Extract input keys as function parameters
          `return \`${s}\`;`      // Template literal processing
        )(...Object.values(input)); // Pass values dynamically
        return f;
    }

    constructor(llmsSetting) {
        this.host = llmsSetting.interfaceParam.host || "";
        this.apiKey = llmsSetting.interfaceParam.apiKey || "";
        this.modelVersion = llmsSetting.interfaceParam.modelVersion || "";
        this.language = llmsSetting.language || "English";
        this.customPrompt = Object.fromEntries(
          Object.entries(llmsSetting.interfaceParam.customPrompt || {})
          .filter(([_, value]) => value)
          .map(([key, value]) => [key, this.stringToFunction(value)])
        );
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
        return (this?.customPrompt[taskType] ? this.customPrompt[taskType](input) : defaultPrompts[taskType](input));
    }

    async generateCode(input) {
        return this.request("generate_code",input);
    }

    async explainCode(input) {
        return this.request("explain_code", input);
    }

    async highLevelExplainCode(input) {
        return this.request("high_level_explain_code", input);
    }

    async alterCode(input) {
        return this.request("alter_code", input);
    }

    async fixCode(input) {
        return this.request("fix_code", input);
    }
}
