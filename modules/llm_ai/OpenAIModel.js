import { AIModelInterface } from "./AIModelInterface.js";

export class OpenAIModel extends AIModelInterface {
	constructor(llmsSetting) {
		super(llmsSetting);
		this.endpoint = `${this.host}/chat/completions`;
		this.modelsEndpoint = `${this.host}/models`;
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
				model: this.modelVersion,
				messages: [
					{ role: "user", content: this.superPrompt},
					{ role: "user", content: this.getPrompt(taskType, input, this.defaultPrompts) }
				]
			})
		});

		const data = await response.json();
		return data.choices?.[0]?.message?.content || "No response";
	}

	async generateCode(input) {
		//console.log("input",input, this.getPrompt("generate_code", input, this.defaultPrompts))
		const response = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: this.modelVersion,
				messages: [
					{ role: "developer", content: this.superPrompt},
					{ role: "user", content: this.getPrompt("generate_code", input, this.defaultPrompts) }
				],
				response_format: {
					type: "json_schema",
					json_schema:{
						name: "codeAnswer",
						strict: true,
						schema: {
							type: "object",
							properties: {
								explanation: {
									type: "string"
								},
								code: {
									type: "string"
								}
							},
							required: [
								"explanation",
								"code"
							],
							additionalProperties: false
						}
					}
				},
			})
		});

		const data = await response.json();
		return JSON.parse(data.choices?.[0]?.message?.content) || "No response";
	}

	async explainCode(input) {
		//console.log("input",input, this.getPrompt("explain_code", input, this.defaultPrompts))
		const response = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: this.modelVersion,
				messages: [
					{ role: "developer", content: this.superPrompt},
					{ role: "user", content: this.getPrompt("explain_code", input, this.defaultPrompts) }
				],
				response_format: {
					type: "json_schema",
					json_schema:{
						name: "code_explanation",
						schema: {
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
												description: "A line of code to be explained."
											},
											comment: {
												type: "string",
												description: "The associated comment explaining the line of code."
											}
										},
										required: [
											"code_line",
											"comment"
										],
										additionalProperties: false
									}
								}
							},
							required: [
								"explanations"
							],
							additionalProperties: false
						},
						strict: true
					}
				}
			})
		});

		const data = await response.json();
		return JSON.parse(data.choices?.[0]?.message?.content) || "No response";
	}

	async highLevelExplainCode(input) {
		//console.log("input",input, this.getPrompt("high_level_explain_code", input, this.defaultPrompts))
		const response = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: this.modelVersion,
				messages: [
					{ role: "developer", content: this.superPrompt},
					{ role: "user", content: this.getPrompt("high_level_explain_code", input, this.defaultPrompts) }
				],
				response_format: {
					type: "json_schema",
					json_schema:{
						name: "codeAnswer",
						strict: true,
						schema: {
							type: "object",
							properties: {
								explanation: {
									type: "string"
								}
							},
							required: [
								"explanation"
							],
							additionalProperties: false
						}
					}
				},
			})
		});

		const data = await response.json();
		return JSON.parse(data.choices?.[0]?.message?.content) || "No response";
	}

	async alterCode(input) {
		//console.log("input",input, this.getPrompt("alter_code", input, this.defaultPrompts))
		const response = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: this.modelVersion,
				messages: [
					{ role: "developer", content: this.superPrompt},
					{ role: "user", content: this.getPrompt("alter_code", input, this.defaultPrompts) }
				],
				response_format: {
					type: "json_schema",
					json_schema:{
						name: "codeAnswer",
						strict: true,
						schema: {
							type: "object",
							properties: {
								explanation: {
									type: "string"
								},
								code: {
									type: "string"
								},
								patch: {
									type: "string"
								}
							},
							required: [
								"explanation"
							],
							oneOf: [
							    { "required": ["code"] },
							    { "required": ["patch"] }
							  ],
							additionalProperties: false
						}
					}
				},
			})
		});

		const data = await response.json();
		return JSON.parse(data.choices?.[0]?.message?.content) || "No response";
	}

	async fixCode(input) {
		//console.log("input",input, this.getPrompt("fix_code", input, this.defaultPrompts))
		const response = await fetch(this.endpoint, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${this.apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: this.modelVersion,
				messages: [
					{ role: "developer", content: this.superPrompt},
					{ role: "user", content: this.getPrompt("fix_code", input, this.defaultPrompts) }
				],
				response_format: {
					type: "json_schema",
					json_schema:{
						name: "codeAnswer",
						strict: true,
						schema: {
							type: "object",
							properties: {
								explanation: {
									type: "string"
								},
								patch: {
									type: "string"
								}
							},
							required: [
								"explanation",
								"patch"
							],
							additionalProperties: false
						}
					}
				},
			})
		});

		const data = await response.json();
		return JSON.parse(data.choices?.[0]?.message?.content) || "No response";
	}

	async getAvailableModels() {
        // OpenAI requires authentication to list models
		const response = await fetch(this.modelsEndpoint, {
			method: "GET",
			headers: { "Authorization": `Bearer ${this.apiKey}` }
		});
		const data = await response.json();
		return data.data?.map(model => model.id) || [];
	}
}
