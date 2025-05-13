import { Request, Response } from "express";
import { SageRequest, SageRequestSchema } from "./types"; // Adjust path as needed
import { invokeBedrockModel } from "../services/bedrockService";

export async function generateKeywords(req: Request, res: Response) {
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
}