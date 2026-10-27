
import { describe, it, expect, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import { deleteUploadedFile } from "../src/utils/file.util.js";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const testFileName = `test-delete-${process.pid}.txt`;
const testFilePath = path.join(uploadsDir, testFileName);

describe("file.util", () => {
  afterEach(async () => {
    await fs.rm(testFilePath, { force: true });
  });

  it("should delete an existing uploaded file", async () => {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(testFilePath, "test content");

    await deleteUploadedFile(`/uploads/${testFileName}`);

    await expect(fs.access(testFilePath)).rejects.toThrow();
  });

  it("should not throw when the file does not exist", async () => {
    await expect(
      deleteUploadedFile("/uploads/non-existent-test-file.txt"),
    ).resolves.toBeUndefined();
  });

  it("should do nothing when fileUrl is missing", async () => {
    await expect(deleteUploadedFile()).resolves.toBeUndefined();
    await expect(deleteUploadedFile(null)).resolves.toBeUndefined();
    await expect(deleteUploadedFile("")).resolves.toBeUndefined();
  });
});
