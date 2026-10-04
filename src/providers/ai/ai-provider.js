import env from "../../config/env.js";
import MockAIProvider from "./mock-ai.provider.js";
import OpenAIProvider from "./openai-ai.provider.js";

function createAIProvider() {
  switch (env.AI_PROVIDER) {
    case "mock":
      return new MockAIProvider();

    case "openai":
      return new OpenAIProvider();

    default:
      throw new Error(
        `Unsupported AI provider: ${env.AI_PROVIDER}`,
      );
  }
}

const provider = createAIProvider();

export default provider;