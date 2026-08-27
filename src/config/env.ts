const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set. add it to your .env file");   
}
export const env ={ anthropicApiKey: apiKey };