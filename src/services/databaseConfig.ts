import mongoose from "mongoose";
import { config } from "dotenv";

// adding logger class
import { Logger } from "../logger";
const logger = new Logger()


async function Database_Connection() {
  config();
  try {
    const options = {
      autoIndex: false, // Don't build indexes
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    const uri: string = process.env.DB_URI!;
    const conn = mongoose.connect(uri, options);
    conn
      .then(() => {
        logger.info(`You have successfully established a database connection`);
      })
      .catch((err: any) => {
        logger.error(
          `An Error occured trying to establish a database connection:: Error=> ${err}`
        );
        process
      });
  } catch (error) {
    logger.error(
      `An Error occured trying to a database connection:: Error=> ${error}`
    );
    process.exitCode = 1
  }
}

export default Database_Connection;
