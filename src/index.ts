import "dotenv/config";

import express from "express";
import cors from "cors";

import { prisma } from "./lib/prisma";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "PedBox API is running",
  });
});

app.get("/api/test-db", async (_req, res) => {
  try {
    const characters = await prisma.character.count();

    res.json({
      connected: true,
      characters,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      connected: false,
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});