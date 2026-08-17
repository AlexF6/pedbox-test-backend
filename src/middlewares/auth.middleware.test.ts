import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

const mockJwt = {
  verify: jest.fn(),
};

jest.mock("jsonwebtoken", () => ({
  default: mockJwt,
  verify: mockJwt.verify,
}));

let authMiddleware: (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void;

beforeAll(async () => {
  jest.resetModules();
  process.env.JWT_SECRET = "test-secret";

  const mod = await import("./auth.middleware.js");
  authMiddleware = mod.authMiddleware;
});

describe("authMiddleware", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it("should reject an invalid or expired token", () => {
    mockReq.headers!.authorization = "Bearer invalid-or-expired-token";

    mockJwt.verify.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockJwt.verify).toHaveBeenCalledWith(
      "invalid-or-expired-token",
      "test-secret"
    );
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });


  it("should reject when authorization header is missing", () => {
    authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authorization header is required",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should reject when authorization format is invalid", () => {
    mockReq.headers!.authorization = "Basic some-token";

    authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid authorization format",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next() and attach user to request when token is valid", () => {
    mockReq.headers!.authorization = "Bearer valid-token";

    const mockDecodedPayload = { userId: 1, email: "test@example.com" };
    mockJwt.verify.mockReturnValue(mockDecodedPayload);

    authMiddleware(
      mockReq as AuthenticatedRequest,
      mockRes as Response,
      mockNext
    );

    expect(mockJwt.verify).toHaveBeenCalledWith("valid-token", "test-secret");
    
    expect(mockReq.user).toEqual(mockDecodedPayload);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});