
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  options: undefined,
  diskStorage: vi.fn((config) => config),
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  extname: vi.fn((filename) => {
    const index = filename.lastIndexOf(".");
    return index === -1 ? "" : filename.slice(index);
  }),
  randomUUID: vi.fn(() => "test-uuid"),
}));

vi.mock("multer", () => {
  const multer = (options) => {
    mocks.options = options;
    return { single: vi.fn() };
  };

  multer.diskStorage = mocks.diskStorage;

  return { default: multer };
});

vi.mock("fs", () => ({
  default: {
    existsSync: mocks.existsSync,
    mkdirSync: mocks.mkdirSync,
  },
}));

vi.mock("path", () => ({
  default: {
    extname: mocks.extname,
  },
}));

vi.mock("crypto", () => ({
  default: {
    randomUUID: mocks.randomUUID,
  },
}));

import upload from "../src/middlewares/upload.middleware.js";

describe("upload middleware", () => {
  let options;

  beforeEach(() => {
    options = mocks.options;

    vi.clearAllMocks();

    mocks.existsSync.mockReturnValue(true);
    mocks.extname.mockImplementation((filename) => {
      const index = filename.lastIndexOf(".");
      return index === -1 ? "" : filename.slice(index);
    });
    mocks.randomUUID.mockReturnValue("test-uuid");
  });

  it("should configure multer with disk storage and a 2 MB limit", () => {
    expect(upload).toBeDefined();
    expect(options).toBeDefined();

    expect(options.limits).toEqual({
      fileSize: 2 * 1024 * 1024,
    });

    expect(options.fileFilter).toEqual(expect.any(Function));

    expect(options.storage).toEqual(
      expect.objectContaining({
        destination: expect.any(Function),
        filename: expect.any(Function),
      }),
    );
  });

  it("should use the doctors upload directory as destination", () => {
    const cb = vi.fn();

    options.storage.destination({}, {}, cb);

    expect(cb).toHaveBeenCalledWith(null, "public/uploads/doctors");
  });

  it("should generate a filename with a lowercase extension", () => {
    const cb = vi.fn();
    const dateSpy = vi.spyOn(Date, "now").mockReturnValue(123456);

    mocks.extname.mockReturnValue(".PNG");

    options.storage.filename(
      {},
      { originalname: "Doctor.PNG" },
      cb,
    );

    expect(mocks.randomUUID).toHaveBeenCalledOnce();
    expect(cb).toHaveBeenCalledWith(null, "123456-test-uuid.png");

    dateSpy.mockRestore();
  });

  it.each([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ])("should accept MIME type %s", (mimetype) => {
    const cb = vi.fn();

    options.fileFilter({}, { mimetype }, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it.each([
    "application/pdf",
    "image/gif",
    "text/plain",
  ])("should reject MIME type %s", (mimetype) => {
    const cb = vi.fn();

    options.fileFilter({}, { mimetype }, cb);

    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Only JPEG, PNG and WebP images are allowed",
      }),
    );
  });
});
