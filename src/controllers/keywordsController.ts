import { Request, Response } from "express";
import { invokeBedrockModel } from "../services/bedrockService";
import { SageRequest, SageRequestSchema } from "./types";

export async function generateKeywords(req: Request, res: Response) {
  try {
    console.log("Received request:", JSON.stringify(req.body));
    console.log("Received headers:", JSON.stringify(req.headers));
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
}
