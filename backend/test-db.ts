import dotenv from 'dotenv';
import { query } from './db/connection';

dotenv.config();

async function check() {
  console.log('Testing connection with updated .env...');
  try {
    const result = await query('SELECT 1 as val');
    
    // connection.ts is written to swallow common errors and return an empty array []
    // So if it returns exactly an empty array for SELECT 1, it means it failed.
    if (Array.isArray(result) && result.length === 0) {
       console.log('\n[!] Connection failed. Please see the [db] error log above.');
       process.exit(1);
    }
    
    console.log('\n[✓] Database connection SUCCESSFUL!');
    console.log('Result:', result);
    process.exit(0);
  } catch(e) {
    console.error('\n[!] Database connection failed with an exception:', e);
    process.exit(1);
  }
}

check();
