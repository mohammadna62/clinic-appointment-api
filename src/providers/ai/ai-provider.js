import env from "../../config/env.js";
import MockAIProvider from "./mock-ai.provider.js";

let provider;

function createAIProvider() {
  switch (env.AI_PROVIDER) {
    case "mock":
      return new MockAIProvider();

    case "openai":
      throw new Error(
        "OpenAI provider is not implemented yet",
      );

    default:
      throw new Error(
        `Unsupported AI provider: ${env.AI_PROVIDER}`,
      );
  }
}

provider = createAIProvider();

export default provider;