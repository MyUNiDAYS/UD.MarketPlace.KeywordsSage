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
  return `I have a discount platform with partners that can go on different categories: fashion; food & drink; technology; beauty; travel & lifestyle; wellbeing; health & fitness. 
            Generate from 5 to 20 common UK-specific search terms that university students would use when looking for items that this partner may have for these students. 
            I dont want the partner name on its keywords and try to keep these keywords to single keywords. These should be general and specific product keywords that I could direct to the following brand: ${partner}.
            So for instance I would like to iphone or ipad to redirect me to Apple. Or galaxy to redirect me to Samsung. 
            Use proper British terminology. Please avoid composite words into one single word such as galaxybook.
            ${initialKeywords.length > 0 ? `In order to help you some initial keywords i tought for this partner are: ${initialKeywords.join(", ")}. ` : ""}
            I want the response to be as less verbose as possible on json format [{ "keywords" : ["keyword1", "keyword2"...]}] `;
}
