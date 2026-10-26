import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/rating.model.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    aggregate: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/booking.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/doctor.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

import Rating from "../src/models/rating.model.js";
import Booking from "../src/models/booking.model.js";
import Doctor from "../src/models/doctor.model.js";

import {
  createRating,
  getDoctorRatingStats,
  getDoctorRatings,
  getAdminDoctorRatings,
  deleteRating,
} from "../src/services/rating.service.js";

describe("Rating Service", () => {
  const bookingId = "507f1f77bcf86cd799439011";
  const doctorId = "507f1f77bcf86cd799439012";
  const userId = "507f1f77bcf86cd799439013";
  const ratingId = "507f1f77bcf86cd799439014";

  let booking;
  let doctor;
  let rating;

  beforeEach(() => {
    vi.resetAllMocks();

    booking = {
      _id: bookingId,
      patient: { toString: () => userId },
      doctor: doctorId,
      status: "completed",
    };

    doctor = {
      _id: doctorId,
      user: {},
      clinic: {},
      specialty: {},
    };

    rating = {
      _id: ratingId,
      booking: bookingId,
      patient: userId,
      doctor: doctorId,
      rating: 5,
      comment: "Excellent service",
      deleteOne: vi.fn().mockResolvedValue(undefined),
    };

    Booking.findById.mockResolvedValue(booking);
    Rating.findOne.mockResolvedValue(null);
    Rating.create.mockResolvedValue(rating);
    Rating.aggregate.mockResolvedValue([]);
    Doctor.findById.mockResolvedValue(doctor);
    Rating.countDocuments.mockResolvedValue(1);
  });

  describe("createRating", () => {
    it("should create a rating for a completed booking", async () => {
      const result = await createRating(
        bookingId,
        userId,
        5,
        "Excellent service",
      );

      expect(Booking.findById).toHaveBeenCalledWith(bookingId);

      expect(Rating.findOne).toHaveBeenCalledWith({
        booking: bookingId,
      });

      expect(Rating.create).toHaveBeenCalledWith({
        booking: bookingId,
        patient: booking.patient,
        doctor: booking.doctor,
        rating: 5,
        comment: "Excellent service",
      });

      expect(result).toBe(rating);
    });

    it("should use an empty comment when none is provided", async () => {
      await createRating(bookingId, userId, 4);

      expect(Rating.create).toHaveBeenCalledWith({
        booking: bookingId,
        patient: booking.patient,
        doctor: booking.doctor,
        rating: 4,
        comment: "",
      });
    });

    it("should throw 404 if the booking does not exist", async () => {
      Booking.findById.mockResolvedValue(null);

      await expect(
        createRating(bookingId, userId, 5),
      ).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });

      expect(Rating.create).not.toHaveBeenCalled();
    });

    it("should throw 403 if another user owns the booking", async () => {
      await expect(
        createRating(bookingId, "another-user", 5),
      ).rejects.toMatchObject({
        message: "You are not allowed to rate this booking",
        statusCode: 403,
      });

      expect(Rating.findOne).not.toHaveBeenCalled();
      expect(Rating.create).not.toHaveBeenCalled();
    });

    it("should throw 409 if the booking is not completed", async () => {
      booking.status = "confirmed";

      await expect(
        createRating(bookingId, userId, 5),
      ).rejects.toMatchObject({
        message: "Only completed bookings can be rated",
        statusCode: 409,
      });

      expect(Rating.create).not.toHaveBeenCalled();
    });

    it("should throw 409 if a rating already exists for the booking", async () => {
      Rating.findOne.mockResolvedValue(rating);

      await expect(
        createRating(bookingId, userId, 5),
      ).rejects.toMatchObject({
        message: "A rating already exists for this booking",
        statusCode: 409,
      });

      expect(Rating.create).not.toHaveBeenCalled();
    });
  });

  describe("getDoctorRatingStats", () => {
    it("should return default statistics when the doctor has no ratings", async () => {
      const result = await getDoctorRatingStats(doctorId);

      expect(Rating.aggregate).toHaveBeenCalledOnce();

      expect(result).toEqual({
        averageRating: 0,
        ratingCount: 0,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      });
    });

    it("should return the aggregated rating statistics", async () => {
      const statistics = {
        averageRating: 4.5,
        ratingCount: 2,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 1,
          5: 1,
        },
      };

      Rating.aggregate.mockResolvedValue([statistics]);

      const result = await getDoctorRatingStats(doctorId);

      expect(result).toEqual(statistics);

      const pipeline = Rating.aggregate.mock.calls[0][0];

      expect(pipeline).toHaveLength(3);
      expect(pipeline[0]).toHaveProperty("$match.doctor");
      expect(pipeline[1]).toHaveProperty("$group.averageRating.$avg", "$rating");
      expect(pipeline[1]).toHaveProperty("$group.ratingCount.$sum", 1);
      expect(pipeline[2]).toHaveProperty("$project.distribution");
    });
  });

  describe("getDoctorRatings", () => {
    function mockRatingsQuery(ratings) {
      const query = {
        populate: vi.fn(),
        sort: vi.fn(),
        skip: vi.fn(),
        limit: vi.fn(),
      };

      query.populate.mockReturnValue(query);
      query.sort.mockReturnValue(query);
      query.skip.mockReturnValue(query);
      query.limit.mockResolvedValue(ratings);

      Rating.find.mockReturnValue(query);

      return query;
    }

    it("should return ratings with pagination data", async () => {
      const ratings = [rating];
      const query = mockRatingsQuery(ratings);

      Rating.countDocuments.mockResolvedValue(25);

      const result = await getDoctorRatings(doctorId, 2, 10);

      expect(Doctor.findById).toHaveBeenCalledWith(doctorId);
      expect(Rating.find).toHaveBeenCalledWith({
        doctor: doctorId,
      });

      expect(query.populate).toHaveBeenCalledWith(
        "patient",
        "firstName lastName",
      );

      expect(query.sort).toHaveBeenCalledWith({
        createdAt: -1,
      });

      expect(query.skip).toHaveBeenCalledWith(10);
      expect(query.limit).toHaveBeenCalledWith(10);

      expect(Rating.countDocuments).toHaveBeenCalledWith({
        doctor: doctorId,
      });

      expect(result).toEqual({
        ratings,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      });
    });

    it("should throw 404 if the doctor does not exist", async () => {
      Doctor.findById.mockResolvedValue(null);

      await expect(
        getDoctorRatings(doctorId, 1, 10),
      ).rejects.toMatchObject({
        message: "Doctor not found",
        statusCode: 404,
      });

      expect(Rating.find).not.toHaveBeenCalled();
    });

    it("should return zero total pages when there are no ratings", async () => {
      mockRatingsQuery([]);
      Rating.countDocuments.mockResolvedValue(0);

      const result = await getDoctorRatings(doctorId, 1, 10);

      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe("getAdminDoctorRatings", () => {
    function mockDoctorQuery() {
      const query = {
        populate: vi.fn(),
        then: (resolve, reject) => Promise.resolve(doctor).then(resolve, reject),
      };

      query.populate.mockReturnValue(query);
      Doctor.findById.mockReturnValue(query);

      return query;
    }

    function mockRatingsQuery(ratings) {
      const query = {
        populate: vi.fn(),
        sort: vi.fn(),
        skip: vi.fn(),
        limit: vi.fn(),
      };

      query.populate.mockReturnValue(query);
      query.sort.mockReturnValue(query);
      query.skip.mockReturnValue(query);
      query.limit.mockResolvedValue(ratings);

      Rating.find.mockReturnValue(query);

      return query;
    }

    it("should return doctor details, statistics, ratings, and pagination", async () => {
      const ratings = [rating];
      const doctorQuery = mockDoctorQuery();
      const ratingsQuery = mockRatingsQuery(ratings);

      const statistics = {
        averageRating: 5,
        ratingCount: 1,
        distribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 1,
        },
      };

      Rating.aggregate.mockResolvedValue([statistics]);
      Rating.countDocuments.mockResolvedValue(1);

      const result = await getAdminDoctorRatings(doctorId, 1, 10);

      expect(doctorQuery.populate).toHaveBeenNthCalledWith(
        1,
        "user",
        "firstName lastName",
      );

      expect(doctorQuery.populate).toHaveBeenNthCalledWith(
        2,
        "clinic",
        "name",
      );

      expect(doctorQuery.populate).toHaveBeenNthCalledWith(
        3,
        "specialty",
        "name",
      );

      expect(ratingsQuery.populate).toHaveBeenNthCalledWith(
        1,
        "patient",
        "firstName lastName",
      );

      expect(ratingsQuery.populate).toHaveBeenNthCalledWith(
        2,
        "booking",
        "date startTime endTime status",
      );

      expect(result).toEqual({
        doctor,
        statistics,
        ratings,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it("should throw 404 if the doctor does not exist", async () => {
      const query = {
        populate: vi.fn(),
        then: (resolve, reject) => Promise.resolve(null).then(resolve, reject),
      };

      query.populate.mockReturnValue(query);
      Doctor.findById.mockReturnValue(query);

      await expect(
        getAdminDoctorRatings(doctorId, 1, 10),
      ).rejects.toMatchObject({
        message: "Doctor not found",
        statusCode: 404,
      });

      expect(Rating.find).not.toHaveBeenCalled();
      expect(Rating.aggregate).not.toHaveBeenCalled();
    });
  });

  describe("deleteRating", () => {
    it("should delete and return the rating", async () => {
      Rating.findById.mockResolvedValue(rating);

      const result = await deleteRating(ratingId);

      expect(Rating.findById).toHaveBeenCalledWith(ratingId);
      expect(rating.deleteOne).toHaveBeenCalledOnce();
      expect(result).toBe(rating);
    });

    it("should throw 404 if the rating does not exist", async () => {
      Rating.findById.mockResolvedValue(null);

      await expect(
        deleteRating(ratingId),
      ).rejects.toMatchObject({
        message: "Rating not found",
        statusCode: 404,
      });
    });
  });
});