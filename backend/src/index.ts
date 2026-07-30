import "dotenv/config";
import cors from "cors";
import express from "express";
import { unitsRouter } from "./routes/units";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/units", unitsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.listen(port, () => {
  console.log(`CRM ANAM backend escuchando en el puerto ${port}`);
});
