import app from "./app";
import { connectDB } from "./services/db";

const PORT = Number(process.env.PORT) || 3001;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();