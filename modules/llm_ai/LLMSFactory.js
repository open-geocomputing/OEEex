import { OpenAIModel } from "./OpenAIModel.js";
import { GeminiModel } from "./GeminiModel.js";
import { OllamaModel } from "./OllamaModel.js";

export function createAIModel(llmsSetting, extensionId=null) {
    switch (llmsSetting.interface) {
        case "openai":
            return new OpenAIModel(llmsSetting);
        case "gemini":
            return new GeminiModel(llmsSetting, extensionId);
        case "ollama":
            return new OllamaModel(llmsSetting, extensionId);
        default:
            throw new Error("Unsupported AI model interface");
    }
}
