import express from "express";
import flightsRouter from "./routes/flights";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Airport backend API",
    endpoints: {
      tuzla: "/api/flights/tuzla",
      banjaluka: "/api/flights/banjaluka",
      mostar: "/api/flights/mostar",
    },
  });
});

app.use("/api/flights", flightsRouter);

export default app;