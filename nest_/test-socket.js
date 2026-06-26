const net = require('net');

const client = new net.Socket();
client.setTimeout(5000);

console.log('Connecting to db.prisma.io:5432...');

client.connect(5432, 'db.prisma.io', () => {
    console.log('Connected!');
    client.destroy();
});

client.on('error', (err) => {
    console.error('Connection error:', err.message);
});

client.on('timeout', () => {
    console.error('Connection timed out');
    client.destroy();
});
