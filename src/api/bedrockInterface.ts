import {BedrockRuntimeClient, InvokeModelCommand} from "@aws-sdk/client-bedrock-runtime";
import express, {Request, Response} from "express"
import {SageRequest, SageRequestSchema} from "./types";

const app = express();
app.use(express.json());

const bedrockClient = new BedrockRuntimeClient({
    region: "eu-west-1",
});

export async function invokeBedrockModel(partner: string, initialKeywords: string[]) {
    const modelId = "anthropic.claude-3-sonnet-20240229-v1:0";
    const contentType = "application/json";
    const acceptType = "application/json";

    const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `I have a discount platform with partners that can go on different categories: fashion; food & drink; technology; beauty; travel & lifestyle; wellbeing; health & fitness. 
                        Generate from 5 to 20 common UK-specific search terms that university students would use when looking for items that this partner may have for these students. 
                        I dont want the partner name on its keywords and try to keep these keywords to single keywords. These should be general and specific product keywords that I could direct to the following brand: ${partner}.
                        So for instance I would like to iphone or ipad to redirect me to Apple. Or galaxy to redirect me to Samsung. 
                        Use proper British terminology. Please avoid composite words into one single word such as galaxybook.
                        ${initialKeywords.length > 0 ? `In order to help you some initial keywords i tought for this partner are: ${initialKeywords.join(", ")}. ` : ""}
                        I want the response to be as less verbose as possible on json format [{ "keywords" : ["keyword1", "keyword2"...]}] `,
                    },
                ],
            },
        ],
    };

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

        console.log('responseBody:', responseBody);

        const suggestions = JSON.parse(responseBody.content[0].text);
        suggestions.keywords = [...new Set([...suggestions.keywords, ...initialKeywords])];

        console.log('suggestions:', suggestions);
        return suggestions;
    } catch (error) {
        console.error("Error invoking Bedrock model:", error);
        throw error;
    }
}

app.post("/generate-keywords", async (req: Request, res: Response) => {
    try {
        const validatedMessage: SageRequest = SageRequestSchema.parse(req.body);

        const result = await invokeBedrockModel(
            validatedMessage.partnerName,
            validatedMessage.initialKeywords
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error,
        });
    }
});

app.get("/health", (req: Request, res: Response) => {
    console.log("Health check endpoint hit");
    res.status(200).send("Healthy");
});

export function startServer() {
    const PORT = 3000;
    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });

    return server;
}

if (require.main === module) {
    startServer();
}