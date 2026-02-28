import { Queue } from "bullmq";
import { connection } from "../utils/connection.js"

const makeQueue = (queueName) => {
  return new Queue(queueName, {
    connection,
  });
};

export { makeQueue };
