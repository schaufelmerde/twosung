import mysql from 'mysql2/promise';

function makePool(database: string) {
  return mysql.createPool({
    host:     process.env.MYSQL_HOST,
    port:     Number(process.env.MYSQL_PORT) || 3306,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+00:00',
    ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });
}

export const orderDb      = makePool('sf_order');
export const inventoryDb  = makePool('sf_inventory');
export const productionDb = makePool('sf_production');
