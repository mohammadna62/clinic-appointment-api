
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Rating from "../src/models/rating.model.js";

describe("Rating model", () => {
  const validRating = () => ({
    booking: new mongoose.Types.ObjectId(),
    patient: new mongoose.Types.ObjectId(),
    doctor: new mongoose.Types.ObjectId(),
    rating: 4,
  });

  it("should require booking, patient, doctor, and rating", () => {
    const rating = new Rating({});
    const error = rating.validateSync();

    for (const field of ["booking", "patient", "doctor", "rating"]) {
      expect(error.errors[field]).toBeDefined();
    }
  });

  it("should accept ratings from 1 to 5", async () => {
    for (const value of [1, 2, 3, 4, 5]) {
      const rating = new Rating({
        ...validRating(),
        rating: value,
      });

      await expect(rating.validate()).resolves.toBeUndefined();
    }
  });

  it("should reject a rating below 1", async () => {
    const rating = new Rating({
      ...validRating(),
      rating: 0,
    });

    await expect(rating.validate()).rejects.toThrow(/rating/);
  });

  it("should reject a rating above 5", async () => {
    const rating = new Rating({
      ...validRating(),
      rating: 6,
    });

    await expect(rating.validate()).rejects.toThrow(/rating/);
  });

  it("should trim the comment", () => {
    const rating = new Rating({
      ...validRating(),
      comment: "  Excellent doctor  ",
    });

    expect(rating.comment).toBe("Excellent doctor");
  });

  it("should apply the default comment", () => {
    const rating = new Rating(validRating());

    expect(rating.comment).toBe("");
  });

  it("should reject a comment longer than 1000 characters", async () => {
    const rating = new Rating({
      ...validRating(),
      comment: "a".repeat(1001),
    });

    await expect(rating.validate()).rejects.toThrow(/comment/);
  });

  it("should define booking as a unique field", () => {
    const bookingIndex = Rating.schema.indexes().find(
      ([fields, options]) =>
        fields.booking === 1 && options.unique === true,
    );

    expect(bookingIndex).toBeDefined();
  });

  it("should define an index on doctor and createdAt", () => {
    const index = Rating.schema.indexes().find(
      ([fields]) =>
        fields.doctor === 1 && fields.createdAt === -1,
    );

    expect(index).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(Rating.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the Rating model", () => {
    expect(Rating).toBe(mongoose.models.Rating);
  });
});
