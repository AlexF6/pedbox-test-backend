import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import characterRoutes from "./routes/character.routes";
import syncRoutes from "./routes/sync.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "PedBox API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/sync", syncRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});