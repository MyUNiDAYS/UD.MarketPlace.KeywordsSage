import { ZodSchema, z } from "zod";

export const EnvVariablesSchema = z.object({
    ENV: z.enum(["dev", "prod"]),
});

export function getProcessEnvVariables<T extends ZodSchema>(
    schema: T
): z.infer<T> {
    const envVars = process.env;
    return schema.parse(envVars);
}
