import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateDoctorStatus: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/doctor.service.js", () => ({
  updateDoctorStatus: mocks.updateDoctorStatus,
}));

vi.mock("../src/helpers/response", () => ({
  successResponse: mocks.successResponse,
}));

import { updateDoctorStatus } from "../src/controllers/admin.controller.js";

describe("Admin Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      validated: {
        params: {
          doctorId: "doctor-id",
        },
        body: {
          isActive: false,
        },
      },
    };

    res = {};
    next = vi.fn();

    mocks.successResponse.mockReturnValue("response");
  });

  it("should update doctor status successfully", async () => {
    const doctor = {
      _id: "doctor-id",
      isActive: false,
    };

    mocks.updateDoctorStatus.mockResolvedValueOnce(doctor);

    await updateDoctorStatus(req, res, next);

    expect(mocks.updateDoctorStatus).toHaveBeenCalledWith(
      "doctor-id",
      { isActive: false },
    );

    expect(mocks.successResponse).toHaveBeenCalledWith(res, {
      message: "Doctor status updated successfully",
      data: {
        doctor,
      },
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should pass service errors to next", async () => {
    const error = new Error("Doctor status update failed");

    mocks.updateDoctorStatus.mockRejectedValueOnce(error);

    await updateDoctorStatus(req, res, next);

    expect(mocks.updateDoctorStatus).toHaveBeenCalledWith(
      "doctor-id",
      { isActive: false },
    );

    expect(next).toHaveBeenCalledWith(error);
    expect(mocks.successResponse).not.toHaveBeenCalled();
  });
});