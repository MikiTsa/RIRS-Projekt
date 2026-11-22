import { app } from "./app.js";
import { prisma } from "./db.js";

const port = Number(process.env.PORT || 3001);

app.listen(port, () => console.log(`workIT auth API posluša na http://localhost:${port}`));

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
