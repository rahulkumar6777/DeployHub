import express from "express";
import crypto from "crypto";
import { reDeploymentQueue } from "../utils/queues.js";
import { Model } from "../models/index.js";

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "*/*" }),
  async (req, res) => {
    try {
      console.log("auto deploy trigger")
      const signature = req.headers["x-hub-signature-256"];
      const secret = process.env.GITHUB_WEBHOOK_SECRET;

      if (!signature || !secret) {
        return res.status(401).send("Missing signature");
      }

      const hmac = crypto.createHmac("sha256", secret);
      const digest = "sha256=" + hmac.update(req.body).digest("hex");

      const sigBuffer = Buffer.from(signature);
      const digestBuffer = Buffer.from(digest);

      if (
        sigBuffer.length !== digestBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, digestBuffer)
      ) {
        return res.status(401).send("Invalid signature");
      }

      const payload = JSON.parse(req.body.toString());

      // Only push events
      if (req.headers["x-github-event"] !== "push") {
        return res.send("Ignored (not push event)");
      }

      const branch = payload.ref.replace("refs/heads/", "");
      const defaultBranch = payload.repository.default_branch;

      if (branch !== defaultBranch) {
        return res.send("Ignored (not default branch)");
      }

      const repoUrl = payload.repository.clone_url.replace(/\.git$/, "");

      const projects = await Model.Project.find({ repoLink: repoUrl }).populate('owner');

      if (!projects || projects.length === 0) {
        return res.send("No projects found");
      }

      for (const project of projects) {
        if (project.owner.githubAccessToken) {
          project.status = "building";
          await project.save({ validateBeforeSave: false });

          const projectId = project._id;
          await reDeploymentQueue.add("redeployment", projectId);

          console.log("Auto redeploy triggered for", project._id);
        } else {
          console.log("Redeploy not triggered for", project._id, "because user not logged in with GitHub");
        }
      }

      res.status(200).send("Redeploy triggered for eligible projects");


    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).send("Webhook failed");
    }
  }
);

export default router;