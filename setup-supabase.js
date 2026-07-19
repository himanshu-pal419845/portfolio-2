const { execSync } = require("child_process");

console.log("Installing temporary PostgreSQL driver 'pg' to configure your database...");
try {
  execSync("npm install pg --no-save", { stdio: "inherit" });
} catch (e) {
  console.error("Failed to install 'pg' module:", e.message);
  process.exit(1);
}

const { Client } = require("pg");

// Connection details
const connectionString = "postgresql://postgres:himanshupal0%23@db.lezefhtsvcmmhzwsowtu.supabase.co:5432/postgres";

const client = new Client({
  connectionString,
});

async function run() {
  try {
    console.log("Connecting to your Supabase database...");
    await client.connect();
    console.log("Connected successfully!");

    console.log("Enabling real-time updates for direct_messages...");
    const res = await client.query("alter publication supabase_realtime add table public.direct_messages;");
    console.log("Success! Real-time direct messaging has been enabled in your database.");
  } catch (err) {
    if (err.message.includes("already exists") || err.message.includes("duplicate")) {
      console.log("Real-time messaging is already enabled! You are all set.");
    } else {
      console.error("Error executing query:", err.message);
    }
  } finally {
    await client.end();
    console.log("Database connection closed.");
  }
}

run();
