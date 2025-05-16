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
  path.join(__dirname, "/modelFormat/anthropicRequest.json"),
  "utf-8"
);

export async function invokeBedrockModel(
  partner: string,
  initialKeywords: string[]
) {
  const contentType = "application/json";
  const acceptType = "application/json";
  const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

  const promptText = generateKeywordPrompt(partner, initialKeywords);

  const requestObj = JSON.parse(claudeRequestTemplate);

  requestObj.messages[0].content[0].text = promptText;

  const command = new InvokeModelCommand({
    modelId,
    contentType,
    accept: acceptType,
    body: JSON.stringify(requestObj),
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBodyBytes = response.body;
    const responseBodyString = new TextDecoder().decode(responseBodyBytes);
    const responseBody = JSON.parse(responseBodyString);

    const suggestions = JSON.parse(responseBody.content[0].text);
    console.log("Suggestions:", suggestions);
    suggestions.keywords = [
      ...new Set([...suggestions.keywords, ...initialKeywords]),
    ];

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

          Task: Generate relevant search keywords for the brand ${partner} that university students in the UK would use when looking for discounts.

          ${initialKeywords.length > 0 ? `Initial keywords provided by someone who knows which keywords to assign to a partner are: ${initialKeywords.join(", ")}. Use them as reference` : ""}

          CRITICAL REQUIREMENTS:
          - Generate between 10-20 UK-specific NEW search terms
          - Focus on specific product names, models, and features that the brand ${partner} sells
          - Each keyword should be STRICTLY related to a specific product sold by the partner
          - NEVER include the brand name or any variation of it in ANY keyword,  just if it's part of a product name
          - Avoid using generic terms like "discount", "offer", "sale", "voucher", "code", "deal", "student", "students", "university", "college", "campus" or any other generic term
          - Avoid using any terms that are not directly related to the product
          - Avoid product version numbers
          - Prioritise single-word terms whenever possible
          - Use proper British terminology

          Response format:
            1.Return ONLY a valid JSON object with this exact structure:
            {
              "keywords": ["keyword1", "keyword2", "keyword3", ...]
            }
            2. Do NOT include any other text or explanations
          `; 
}
