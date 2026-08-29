import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";
import { env } from "./config/env.js";

export const anthropic = new Anthropic({
  apiKey: env.anthropicApiKey,
});