const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const repoRoot = path.resolve(__dirname, '..');
const migrationFile = path.join(repoRoot, 'src', 'db', 'migrations', 'initial.sql');

if (!fs.existsSync(migrationFile)) {
  throw new Error(`Migration file not found: ${migrationFile}`);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run migrations.');
}

const sql = fs.readFileSync(migrationFile, 'utf8');
const client = new Client({ connectionString: databaseUrl });

async function run() {
  await client.connect();
  await client.query(sql);
  console.log('Initial migration completed successfully.');
}

run()
  .catch((error) => {
    console.error('Initial migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => undefined);
  });
