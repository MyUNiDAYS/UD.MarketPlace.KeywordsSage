import { SERVICE_NAME } from "../consts";

export function generateResourcename(name: string): string {
    return `${SERVICE_NAME}-${name}`;
}
