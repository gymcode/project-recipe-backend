import * as redis from "redis";

// adding logger class
import { Logger } from "../logger";
const logger = new Logger()

function instanceEventListeners(conn: any) {
  conn.on("connect", () => {
    logger.info("CacheStore - Connection status: connected");
  });

  conn.on("end", () => {
    logger.warning("CacheStore - Connection status: disconnected");
  });

  conn.on("reconnecting", () => {
    logger.warning("CacheStore - Connection status: reconnecting");
  });

  conn.on("error", (err: any) => {
    logger.error(`CacheStore - Connection status: error ${err}`);
  });
}

const client = redis.createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

instanceEventListeners(client);

client.connect();

export default client;
