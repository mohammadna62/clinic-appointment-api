
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Clinic from "../src/models/clinic.model.js";

describe("Clinic model", () => {
  it("should require the name field", async () => {
    const clinic = new Clinic({});

    await expect(clinic.validate()).rejects.toThrow(/name/);
  });

  it("should trim the name and description", () => {
    const clinic = new Clinic({
      name: "  Tehran Clinic  ",
      description: "  General medical services  ",
    });

    expect(clinic.name).toBe("Tehran Clinic");
    expect(clinic.description).toBe("General medical services");
  });

  it("should apply the default values", () => {
    const clinic = new Clinic({
      name: "Tehran Clinic",
    });

    expect(clinic.description).toBe("");
    expect(clinic.isActive).toBe(true);
  });

  it("should accept a valid clinic", async () => {
    const clinic = new Clinic({
      name: "Tehran Clinic",
      description: "General medical services",
      isActive: true,
    });

    await expect(clinic.validate()).resolves.toBeUndefined();
  });

  it("should define name as a unique field", () => {
    const nameIndex = Clinic.schema.indexes().find(
      ([fields, options]) =>
        fields.name === 1 && options.unique === true,
    );

    expect(nameIndex).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(Clinic.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the Clinic model", () => {
    expect(Clinic).toBe(mongoose.models.Clinic);
  });
});
