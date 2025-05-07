import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { mockClient } from "aws-sdk-client-mock";
import { TextEncoder, TextDecoder } from "util";

// Import the function to test (you might need to adjust the import path)
// If the function is not exported, you'll need to modify your actual code to export it for testing
import { invokeBedrockModel } from "../bedrockInterface";

// Mock the Bedrock client
const bedrockMock = mockClient(BedrockRuntimeClient);

// Mock TextDecoder
global.TextDecoder = TextDecoder as any;

describe("invokeBedrockModel", () => {
    beforeEach(() => {
        bedrockMock.reset();
        console.log = jest.fn();
        console.error = jest.fn();
    });

    it("should call Bedrock with correct parameters", async () => {

        const mockResponse = {
            body: new TextEncoder().encode(JSON.stringify({
                content: [{ text: '{"keywords": ["test1", "test2"]}' }]
            }))
        };
        bedrockMock.on(InvokeModelCommand).resolves(mockResponse);


        const partner = "Test Partner";
        const initialKeywords = ["initial1", "initial2"];
        await invokeBedrockModel(partner, initialKeywords);

        const calls = bedrockMock.commandCalls(InvokeModelCommand);
        expect(calls.length).toBe(1);

        const callArgs = calls[0].args[0].input;
        expect(callArgs.modelId).toBe("anthropic.claude-3-7-sonnet-20250219-v1:0");
        expect(callArgs.contentType).toBe("application/json");
        expect(callArgs.accept).toBe("application/json");

        const body = JSON.parse(callArgs.body);
        expect(body.messages[0].content[0].text).toContain("Test Partner");
        expect(body.messages[0].content[0].text).toContain("initial1, initial2");
    });

    it("should merge initial keywords with generated keywords", async () => {
        // Setup mock response with one overlapping keyword
        const mockResponse = {
            body: new TextEncoder().encode(JSON.stringify({
                content: [{ text: '{"keywords": ["test1", "test2", "initial1"]}' }]
            }))
        };
        bedrockMock.on(InvokeModelCommand).resolves(mockResponse);

        // Call the function
        const partner = "Test Partner";
        const initialKeywords = ["initial1", "initial2"];
        const result = await invokeBedrockModel(partner, initialKeywords);

        // Check result contains unique keywords from both sources
        expect(result).toEqual({
            keywords: expect.arrayContaining(["test1", "test2", "initial1", "initial2"])
        });

        // Check for uniqueness (no duplicates)
        expect(result.keywords.length).toBe(4);
        expect(result.keywords.filter(k => k === "initial1").length).toBe(1);
    });

    it("should handle empty initial keywords array", async () => {
        // Setup mock response
        const mockResponse = {
            body: new TextEncoder().encode(JSON.stringify({
                content: [{ text: '{"keywords": ["test1", "test2"]}' }]
            }))
        };
        bedrockMock.on(InvokeModelCommand).resolves(mockResponse);

        // Call the function
        const partner = "Test Partner";
        const initialKeywords: string[] = [];
        const result = await invokeBedrockModel(partner, initialKeywords);

        // Check Bedrock call doesn't include initial keywords text
        const calls = bedrockMock.commandCalls(InvokeModelCommand);
        const callArgs = calls[0].args[0].input;
        const body = JSON.parse(callArgs.body);
        expect(body.messages[0].content[0].text).not.toContain("In order to help you some initial keywords");

        // Check result only contains generated keywords
        expect(result).toEqual({
            keywords: ["test1", "test2"]
        });
    });

    it("should handle malformed response from Bedrock", async () => {
        // Setup mock response with invalid JSON
        const mockResponse = {
            body: new TextEncoder().encode(JSON.stringify({
                content: [{ text: 'Invalid JSON' }]
            }))
        };
        bedrockMock.on(InvokeModelCommand).resolves(mockResponse);

        // Call the function and expect it to throw
        const partner = "Test Partner";
        const initialKeywords = ["initial1"];

        await expect(invokeBedrockModel(partner, initialKeywords)).rejects.toThrow();
        expect(console.error).toHaveBeenCalled();
    });

    it("should handle Bedrock API errors", async () => {
        // Setup mock to throw an error
        const errorMessage = "Bedrock API error";
        bedrockMock.on(InvokeModelCommand).rejects(new Error(errorMessage));

        // Call the function and expect it to throw
        const partner = "Test Partner";
        const initialKeywords = ["initial1"];

        await expect(invokeBedrockModel(partner, initialKeywords)).rejects.toThrow(errorMessage);
        expect(console.error).toHaveBeenCalled();
    });
});