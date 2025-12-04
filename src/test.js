import { Pool } from 'pg'
 
const pool = new Pool()
 
const client = await pool.connect()
await client.query('SELECT NOW()')
client.release()