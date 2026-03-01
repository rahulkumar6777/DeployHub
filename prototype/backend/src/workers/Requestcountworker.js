import { Worker } from "bullmq";
import { Types } from "mongoose";
import { Model } from "../models/index.js";
import { connection } from "../utils/connection.js";

export const requestCountWorker = new Worker(
    "request-count-flush",
    async (job) => {
        const { counts, flushedAt } = job.data;

        const entries = Object.entries(counts)
            .map(([id, c]) => [id, parseInt(c)])
            .filter(([, c]) => c > 0);

        if (entries.length === 0) return;


        const bulkOps = entries.map(([projectId, count]) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(projectId) },
                update: { $inc: { totalRequest: count } },
            },
        }));

        const result = await Model.Project.bulkWrite(bulkOps, { ordered: false });

        const totalReqs = entries.reduce((s, [, c]) => s + c, 0);
        console.log(
            `[RequestCounter] Flushed at ${flushedAt} — ` +
            `${entries.length} projects, ${totalReqs} requests, ` +
            `${result.modifiedCount} DB rows updated`
        );
    },
    {
        connection: connection,
        concurrency: 1,
    }
);

requestCountWorker.on("failed", (job, err) => {
    console.error(`[RequestCounter] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
});

requestCountWorker.on("error", (err) => {
    console.error("[RequestCounter] Worker error:", err.message);
});