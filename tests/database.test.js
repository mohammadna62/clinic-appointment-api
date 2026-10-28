
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { connectMock } = vi.hoisted(() => ({
  connectMock: vi.fn(),
}));

vi.mock("mongoose", () => ({
  default: {
    connect: connectMock,
  },
}));

vi.mock("../src/config/env.js", () => ({
  default: {
    MONGODB_URI: "mongodb://localhost:27017/test",
  },
}));

import { connectDatabase } from "../src/config/database.js";

describe("connectDatabase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should connect to MongoDB using the configured URI", async () => {
    connectMock.mockResolvedValueOnce(undefined);

    await connectDatabase();

    expect(connectMock).toHaveBeenCalledOnce();
    expect(connectMock).toHaveBeenCalledWith(
      "mongodb://localhost:27017/test",
    );
    expect(console.log).toHaveBeenCalledWith(
      "[Database] MongoDB connected successfully",
    );
  });

  it("should log the error and exit when the connection fails", async () => {
    const connectionError = new Error("Connection failed");
    connectMock.mockRejectedValueOnce(connectionError);

    await expect(connectDatabase()).rejects.toThrow(
      "process.exit called",
    );

    expect(console.error).toHaveBeenCalledWith(
      "[Database] MongoDB connection failed",
    );
    expect(console.error).toHaveBeenCalledWith(connectionError);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
