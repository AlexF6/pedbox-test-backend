const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwt = {
  sign: jest.fn(),
};

// En Jest, jest.mock se eleva (hoist) automáticamente al principio del archivo
jest.mock("../lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("bcrypt", () => ({
  default: mockBcrypt,
  hash: mockBcrypt.hash,
  compare: mockBcrypt.compare,
}));

jest.mock("jsonwebtoken", () => ({
  default: mockJwt,
  sign: mockJwt.sign,
}));

let registerUser: (email: string, password: string) => Promise<any>;
let loginUser: (email: string, password: string) => Promise<any>;

beforeAll(async () => {
  jest.resetModules();

  process.env.JWT_SECRET = "test-secret";

  const authService = await import("./auth.service.js");

  registerUser = authService.registerUser;
  loginUser = authService.loginUser;
});

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      mockBcrypt.hash.mockResolvedValue("hashed-password");

      mockPrisma.user.create.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await registerUser("test@example.com", "password123");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith("password123", 10);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
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
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        registerUser("test@example.com", "password123"),
      ).rejects.toThrow("USER_ALREADY_EXISTS");

      expect(mockBcrypt.hash).not.toHaveBeenCalled();

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    it("should login with valid credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBcrypt.compare.mockResolvedValue(true);

      mockJwt.sign.mockReturnValue("test-jwt-token");

      const result = await loginUser("test@example.com", "password123");

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "test@example.com",
        },
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed-password",
      );

      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: 1,
          email: "test@example.com",
        },
        "test-secret",
        {
          expiresIn: "15m",
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
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        loginUser("test@example.com", "password123"),
      ).rejects.toThrow("INVALID_CREDENTIALS");

      expect(mockBcrypt.compare).not.toHaveBeenCalled();

      expect(mockJwt.sign).not.toHaveBeenCalled();
    });

    it("should throw when the password is invalid", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: "test@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockBcrypt.compare.mockResolvedValue(false);

      await expect(
        loginUser("test@example.com", "wrong-password"),
      ).rejects.toThrow("INVALID_CREDENTIALS");

      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });
});