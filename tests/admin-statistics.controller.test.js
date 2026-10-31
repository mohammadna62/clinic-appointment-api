import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminStatistics: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/admin-statistics.service.js", () => ({
  getAdminStatistics: mocks.getAdminStatistics,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import { getAdminStatistics } from "../src/controllers/admin-statistics.controller.js";

describe("Admin Statistics Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        query: {
          period: "month",
        },
      },
    };

    res = {};
    next = vi.fn();

    mocks.successResponse.mockReturnValue("response");
  });

  it("should retrieve admin statistics successfully", async () => {
    const statistics = {
      period: "month",
      bookings: {
        total: 10,
        pending: 2,
        confirmed: 3,
        completed: 4,
        cancelled: 1,
        patient_no_show: 0,
      },
    };

    mocks.getAdminStatistics.mockResolvedValueOnce(statistics);

    await getAdminStatistics(req, res, next);

    expect(mocks.getAdminStatistics).toHaveBeenCalledWith("month");

    expect(mocks.successResponse).toHaveBeenCalledWith(res, {
      message: "Admin statistics retrieved successfully",
      data: statistics,
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should pass service errors to next", async () => {
    const error = new Error("Failed to retrieve statistics");

    mocks.getAdminStatistics.mockRejectedValueOnce(error);

    await getAdminStatistics(req, res, next);

    expect(mocks.getAdminStatistics).toHaveBeenCalledWith("month");
    expect(next).toHaveBeenCalledWith(error);
    expect(mocks.successResponse).not.toHaveBeenCalled();
  });

  it("should pass the requested period to the service", async () => {
    req.validated.query.period = "year";

    mocks.getAdminStatistics.mockResolvedValueOnce({
      period: "year",
    });

    await getAdminStatistics(req, res, next);

    expect(mocks.getAdminStatistics).toHaveBeenCalledWith("year");
  });
});