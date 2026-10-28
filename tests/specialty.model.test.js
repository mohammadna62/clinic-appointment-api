
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Specialty from "../src/models/specialty.model.js";

describe("Specialty model", () => {
  it("should require the name field", async () => {
    const specialty = new Specialty({});

    await expect(specialty.validate()).rejects.toThrow(/name/);
  });

  it("should trim the name and description", () => {
    const specialty = new Specialty({
      name: "  Cardiology  ",
      description: "  Heart-related medical care  ",
    });

    expect(specialty.name).toBe("Cardiology");
    expect(specialty.description).toBe("Heart-related medical care");
  });

  it("should apply the default values", () => {
    const specialty = new Specialty({
      name: "Cardiology",
    });

    expect(specialty.description).toBe("");
    expect(specialty.isActive).toBe(true);
  });

  it("should accept a valid specialty", async () => {
    const specialty = new Specialty({
      name: "Cardiology",
      description: "Heart-related medical care",
      isActive: true,
    });

    await expect(specialty.validate()).resolves.toBeUndefined();
  });

  it("should define name as a unique field", () => {
    const nameIndex = Specialty.schema.indexes().find(
      ([fields, options]) =>
        fields.name === 1 && options.unique === true,
    );

    expect(nameIndex).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(Specialty.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the Specialty model", () => {
    expect(Specialty).toBe(mongoose.models.Specialty);
  });
});
