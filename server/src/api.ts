// Root API route mounting.
import { Router } from "express";

import authRoutes from "./routes/auth.route";
import nooraRoutes from "./routes/noora.route";
import userRoutes from "./routes/user.route";

const api = Router();

api.use("/auth", authRoutes);
api.use("/noora", nooraRoutes);
api.use("/", userRoutes);

export default api;