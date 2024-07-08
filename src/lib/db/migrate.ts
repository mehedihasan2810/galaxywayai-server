import { migrate } from "drizzle-orm/postgres-js/migrator";

import { client, db } from ".";

const runMigrate = async () => {
  console.log("⏳ Running migrations...");

  const start = Date.now();

  await migrate(db, { migrationsFolder: "src/lib/db/migrations" });
  client.end();

  const end = Date.now();

  console.log("✅ Migrations completed in", end - start, "ms");
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error("❌ Migration failed");
  console.error(err);
  process.exit(1);
});

// import { drizzle } from 'drizzle-orm/postgres-js'
// import { migrate } from 'drizzle-orm/postgres-js/migrator'
// import postgres from 'postgres'

// const connectionString = process.env.DATABASE_URL
// const client = postgres(connectionString)
// const db = drizzle(client);

// const main = async () => {
//   await migrate(db, { migrationsFolder: 'drizzle' })
//   await client.end()
//   process.exit(0)
// }

// main()
