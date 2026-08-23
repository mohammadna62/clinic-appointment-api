import fs from "fs/promises";
import path from "path";

export async function deleteUploadedFile(fileUrl) {
  if (!fileUrl) {
    return;
  }

  const relativePath = fileUrl.replace(/^\/uploads\//, "");

  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    relativePath,
  );

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}