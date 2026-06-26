const { Client } = require('pg');
const connectionString = 'postgres://c32539e6a47de90ad6560ebd5280ec25a00131335102a9e3768bfe58d2b0416d:sk_8N-94o0mT2VPpMXI5G1CP@db.prisma.io:5432/postgres?sslmode=require';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('Connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1);
  });
