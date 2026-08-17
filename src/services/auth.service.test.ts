import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  beforeAll,
} from "vitest";

const { prismaMock, bcryptMock, jwtMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },

  bcryptMock: {
    hash: vi.fn(),
    compare: vi.fn(),
  },

  jwtMock: {
    sign: vi.fn(),
  },
}));

vi.mock("../lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: bcryptMock,
}));

vi.mock("jsonwebtoken", () => ({
  default: jwtMock,
}));

let registerUser: (
  email: string,
  password: string,
) => Promise<any>;

let loginUser: (
  email: string,
  password: string,
) => Promise<any>;

beforeAll(async () => {
  vi.resetModules();

  process.env.JWT_SECRET = "test-secret";

  const authService = await import("./auth.service.js");

  registerUser = authService.registerUser;
  loginUser = authService.loginUser;
});

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      bcryptMock.hash.mockResolvedValue("hashed-password");

      prismaMock.user.create.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await registerUser(
        "test@example.com",
        "password123",
      );

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });

      expect(bcryptMock.hash).toHaveBeenCalledWith(
        "password123",
        10,
      );

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          passwordHash: "hashed-password",
        },
      });

      expect(result).toEqual({
        id: 1,
        email: "test@example.com",
      });
    });

    it("should throw when the user already exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        registerUser(
          "test@example.com",
          "password123",
        ),
      ).rejects.toThrow("USER_ALREADY_EXISTS");

      expect(bcryptMock.hash).not.toHaveBeenCalled();

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    it("should login with valid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      bcryptMock.compare.mockResolvedValue(true);

      jwtMock.sign.mockReturnValue("test-jwt-token");

      const result = await loginUser(
        "test@example.com",
        "password123",
      );

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });

      expect(bcryptMock.compare).toHaveBeenCalledWith(
        "password123",
        "hashed-password",
      );

      expect(jwtMock.sign).toHaveBeenCalledWith(
        {
          userId: 1,
          email: "test@example.com",
        },
        "test-secret",
        {
          expiresIn: "1h",
        },
      );

      expect(result).toEqual({
        token: "test-jwt-token",
        user: {
          id: 1,
          email: "test@example.com",
        },
      });
    });

    it("should throw when the user does not exist", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        loginUser(
          "test@example.com",
          "password123",
        ),
      ).rejects.toThrow("INVALID_CREDENTIALS");

      expect(bcryptMock.compare).not.toHaveBeenCalled();

      expect(jwtMock.sign).not.toHaveBeenCalled();
    });

    it("should throw when the password is invalid", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      bcryptMock.compare.mockResolvedValue(false);

      await expect(
        loginUser(
          "test@example.com",
          "wrong-password",
        ),
      ).rejects.toThrow("INVALID_CREDENTIALS");

      expect(jwtMock.sign).not.toHaveBeenCalled();
    });
  });
});