
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";

describe("User model", () => {
  it("should require the phone field", async () => {
    const user = new User({});

    await expect(user.validate()).rejects.toThrow(
      /phone/,
    );
  });

  it("should apply the default values", () => {
    const user = new User({
      phone: "09123456789",
    });

    expect(user.roles).toEqual(["patient"]);
    expect(user.isVerified).toBe(false);
    expect(user.isBanned).toBe(false);
    expect(user.isDeleted).toBe(false);
    expect(user.deletedAt).toBeNull();
  });

  it("should trim phone, nationalCode, firstName, and lastName", () => {
    const user = new User({
      phone: " 09123456789 ",
      nationalCode: " 1234567890 ",
      firstName: " Mohammad ",
      lastName: " Naghavi ",
    });

    expect(user.phone).toBe("09123456789");
    expect(user.nationalCode).toBe("1234567890");
    expect(user.firstName).toBe("Mohammad");
    expect(user.lastName).toBe("Naghavi");
  });

  it("should accept valid roles", async () => {
    const user = new User({
      phone: "09123456789",
      roles: ["patient", "doctor", "admin"],
    });

    await expect(user.validate()).resolves.toBeUndefined();
  });

  it("should reject an unsupported role", async () => {
    const user = new User({
      phone: "09123456789",
      roles: ["superadmin"],
    });

    await expect(user.validate()).rejects.toThrow(/roles/);
  });

 it("should cast a numeric phone value to a string", async () => {
  const user = new User({
    phone: 123456789,
  });

  await user.validate();

  expect(user.phone).toBe("123456789");
  expect(typeof user.phone).toBe("string");
});

  it("should define phone and nationalCode as unique fields", () => {
    const phoneIndex = User.schema.indexes().find(([fields, options]) =>
      fields.phone === 1 && options.unique === true,
    );

    const nationalCodeIndex = User.schema.indexes().find(([fields, options]) =>
      fields.nationalCode === 1 &&
      options.unique === true &&
      options.sparse === true,
    );

    expect(phoneIndex).toBeDefined();
    expect(nationalCodeIndex).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(User.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the User model", () => {
    expect(User).toBe(mongoose.models.User);
  });
});
