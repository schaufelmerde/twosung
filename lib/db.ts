import mysql from 'mysql2/promise';

function makePool(database: string) {
  return mysql.createPool({
    host:     process.env.MYSQL_HOST     || '192.168.3.xxx',
    port:     Number(process.env.MYSQL_PORT) || 3306,
    user:     process.env.MYSQL_USER     || 'sf_user',
    password: process.env.MYSQL_PASSWORD || '',
    database,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+00:00',
  });
}

export const orderDb      = makePool('sf_order');
export const inventoryDb  = makePool('sf_inventory');
export const productionDb = makePool('sf_production');
