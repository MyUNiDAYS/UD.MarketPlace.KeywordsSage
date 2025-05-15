import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import * as fs from "fs";
import * as path from "path";

const bedrockClient = new BedrockRuntimeClient({
  region: "eu-west-1",
});

const claudeRequestTemplate = fs.readFileSync(
  path.join(__dirname, "/modelFormat/claudeRequest.json"),
  "utf-8"
);

export async function invokeBedrockModel(
  partner: string,
  initialKeywords: string[]
) {
  const contentType = "application/json";
  const acceptType = "application/json";
  const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";

  const promptText = generateKeywordPrompt(partner, initialKeywords);
  const requestBody = claudeRequestTemplate.replace(
    "{{PROMPT_TEXT}}",
    promptText
  );

  const command = new InvokeModelCommand({
    modelId,
    contentType,
    accept: acceptType,
    body: JSON.stringify(requestBody),
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBodyBytes = response.body;
    const responseBodyString = new TextDecoder().decode(responseBodyBytes);
    const responseBody = JSON.parse(responseBodyString);

    console.log("responseBody:", responseBody);

    const suggestions = JSON.parse(responseBody.content[0].text);
    suggestions.keywords = [
      ...new Set([...suggestions.keywords, ...initialKeywords]),
    ];

    console.log("suggestions:", suggestions);
    return suggestions;
  } catch (error) {
    console.error("Error invoking Bedrock model:", error);
    throw error;
  }
}

function generateKeywordPrompt(
  partner: string,
  initialKeywords: string[]
): string {
  return `You are a keyword generator for a university student discount platform.

Task: Generate relevant search keywords for the brand "${partner}" that university students in the UK would use when looking for discounts.

CRITICAL REQUIREMENTS:
- Generate between 5-20 UK-specific search terms
- Focus ONLY on specific product names, models, and features that the brand "${partner}" sells
- Each keyword should be STRICTLY related to a specific product sold by the partner
- NEVER include the brand name "${partner}" or any variation of it in ANY keyword
- Avoid product version numbers
- Prioritize single-word terms whenever possible
- Use proper British terminology
- Each keyword should have its own line

${initialKeywords.length > 0 ? `Initial keywords from marketing team: ${JSON.stringify(initialKeywords)}` : ""}

Response format:
Return ONLY a valid JSON object with this exact structure:
{
  "keywords": ["keyword1", "keyword2", "keyword3", ...]
}

Do not include any explanations or additional text outside the JSON object.`;
}
