import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createRating: vi.fn(),
  getDoctorRatings: vi.fn(),
  getAdminDoctorRatings: vi.fn(),
  deleteRating: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/rating.service.js", () => ({
  createRating: mocks.createRating,
  getDoctorRatings: mocks.getDoctorRatings,
  getAdminDoctorRatings: mocks.getAdminDoctorRatings,
  deleteRating: mocks.deleteRating,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createRating,
  getDoctorRatings,
  getAdminDoctorRatings,
  deleteRating,
} from "../src/controllers/rating.controller.js";

describe("Rating Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        userId: "user-id",
      },
      validated: {
        params: {
          bookingId: "booking-id",
          doctorId: "doctor-id",
          ratingId: "rating-id",
        },
        body: {
          rating: 5,
          comment: "Excellent service",
        },
        query: {
          page: 1,
          limit: 10,
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createRating", () => {
    it("should create a rating successfully", async () => {
      const result = {
        _id: "rating-id",
        booking: "booking-id",
        rating: 5,
        comment: "Excellent service",
      };

      mocks.createRating.mockResolvedValueOnce(result);

      await createRating(req, res, next);

      expect(mocks.createRating).toHaveBeenCalledWith(
        "booking-id",
        "user-id",
        5,
        "Excellent service",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Rating created successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Rating creation failed");

      mocks.createRating.mockRejectedValueOnce(error);

      await createRating(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getDoctorRatings", () => {
    it("should retrieve doctor ratings successfully", async () => {
      const result = {
        ratings: [
          {
            _id: "rating-id",
            rating: 5,
            comment: "Excellent service",
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getDoctorRatings.mockResolvedValueOnce(result);

      await getDoctorRatings(req, res, next);

      expect(mocks.getDoctorRatings).toHaveBeenCalledWith(
        "doctor-id",
        1,
        10,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor ratings retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Doctor ratings retrieval failed");

      mocks.getDoctorRatings.mockRejectedValueOnce(error);

      await getDoctorRatings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getAdminDoctorRatings", () => {
    it("should retrieve doctor ratings for admin successfully", async () => {
      const result = {
        ratings: [
          {
            _id: "rating-id",
            rating: 5,
            comment: "Excellent service",
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getAdminDoctorRatings.mockResolvedValueOnce(result);

      await getAdminDoctorRatings(req, res, next);

      expect(mocks.getAdminDoctorRatings).toHaveBeenCalledWith(
        "doctor-id",
        1,
        10,
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Doctor ratings retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Admin doctor ratings retrieval failed");

      mocks.getAdminDoctorRatings.mockRejectedValueOnce(error);

      await getAdminDoctorRatings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("deleteRating", () => {
    it("should delete a rating successfully", async () => {
      const rating = {
        _id: "rating-id",
        rating: 5,
      };

      mocks.deleteRating.mockResolvedValueOnce(rating);

      await deleteRating(req, res, next);

      expect(mocks.deleteRating).toHaveBeenCalledWith("rating-id");

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Rating deleted successfully",
        data: rating,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Rating deletion failed");

      mocks.deleteRating.mockRejectedValueOnce(error);

      await deleteRating(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});