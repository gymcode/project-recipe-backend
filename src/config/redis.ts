import * as redis from "redis";

function instanceEventListeners(conn: any) {
    conn.on('connect', () => {
        console.log('CacheStore - Connection status: connected');
    });

    conn.on('end', () => {
        console.log('CacheStore - Connection status: disconnected');
    });

    conn.on('reconnecting', () => {
        console.log('CacheStore - Connection status: reconnecting');
    });

    conn.on('error', (err: any) => {
        console.log('CacheStore - Connection status: error ', { err });
    });
}


const client = redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});
instanceEventListeners(client)

client.connect();

export default client;
