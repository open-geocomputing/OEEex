const STUDIO_ORIGINS = Object.freeze([
  "https://code.earthengine.studio",
  "https://code-dev.earthengine.studio",
]);

export const STUDIO_UPLOAD_RULE_IDS = Object.freeze([1101, 1102]);

export function createStudioUploadRules() {
  return STUDIO_ORIGINS.map((origin, index) => ({
    id: STUDIO_UPLOAD_RULE_IDS[index],
    priority: 10000,
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        {
          header: "Access-Control-Allow-Origin",
          operation: "set",
          value: origin,
        },
        {
          header: "Access-Control-Allow-Credentials",
          operation: "set",
          value: "true",
        },
        {
          header: "Access-Control-Allow-Methods",
          operation: "set",
          value: "GET, POST, OPTIONS",
        },
      ],
    },
    condition: {
      regexFilter:
        "^https://code\\.earthengine\\.google\\.com/(?:assets/upload/(?:geturl|finish)(?:[/?].*)?|_ah/upload/.*)$",
      initiatorDomains: [new URL(origin).hostname],
      requestMethods: ["get", "post", "options"],
      resourceTypes: ["xmlhttprequest"],
    },
  }));
}

export async function enableStudioUploadCorsWorkaround() {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [...STUDIO_UPLOAD_RULE_IDS],
    addRules: createStudioUploadRules(),
  });
}
