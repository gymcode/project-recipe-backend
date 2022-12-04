import * as redis from "redis";

const client = redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});
client.on("error", (err: any) => console.log("Redis Client Error", err));
client.on("connect", () => {
  console.log("CacheStore - Connection status: connected");
});

client.on("end", () => {
  console.log("CacheStore - Connection status: disconnected");
});

client.on("reconnecting", () => {
  console.log("CacheStore - Connection status: reconnecting");
});
client.connect();

export default client;
