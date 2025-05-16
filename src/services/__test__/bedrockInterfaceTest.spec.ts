import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { mockClient } from "aws-sdk-client-mock";

import { invokeBedrockModel } from "../bedrockService";

const bedrockMock = mockClient(BedrockRuntimeClient);

const sampleResponse = {
  id: "msg_bdrk_01QphUo9NdAKvmFJoKweNQZ",
  type: "message",
  role: "assistant",
  model: "claude-3-haiku-20240307",
  stop_sequence: null,
  usage: {
    input_tokens: 235,
    output_tokens: 135,
  },
  content: [
    {
      type: "text",
      text: '{\n  "keywords": [\n    "suggested1",\n    "suggested2"\n  ]\n}',
    },
  ],
  stop_reason: "end_turn",
};

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  readFileSync: jest.fn().mockReturnValue(
    JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "{{PROMPT_TEXT}}",
            },
          ],
        },
      ],
    })
  ),
}));

describe("invokeBedrockModel", () => {
  beforeEach(() => {
    bedrockMock.reset();
    console.log = jest.fn();
    console.error = jest.fn();

    global.TextDecoder = jest.fn().mockImplementation(() => ({
      decode: jest.fn().mockReturnValue(JSON.stringify(sampleResponse)),
    }));
  });

  afterAll(() => {
    bedrockMock.restore();
    jest.resetAllMocks();
  });

  it("should call Bedrock with correct parameters and handle response", async () => {
    bedrockMock.on(InvokeModelCommand).resolves({
      $metadata: { httpStatusCode: 200 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: {} as any,
    });

    const partner = "Samsung";
    const initialKeywords = ["initial1", "initial2"];

    const result = await invokeBedrockModel(partner, initialKeywords);

    const calls = bedrockMock.commandCalls(InvokeModelCommand);
    expect(calls.length).toBe(1);

    const callArgs = calls[0].args[0].input;
    expect(callArgs.modelId).toBe("anthropic.claude-3-haiku-20240307-v1:0");
    expect(callArgs.contentType).toBe("application/json");
    expect(callArgs.accept).toBe("application/json");

    expect(result.keywords).toContain("initial1");
    expect(result.keywords).toContain("initial2");
    expect(result.keywords).toContain("suggested1");
    expect(result.keywords).toContain("suggested2");

    const uniqueKeywords = [...new Set(result.keywords)];
    expect(result.keywords.length).toBe(uniqueKeywords.length);
  });
});
