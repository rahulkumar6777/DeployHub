import { body, validationResult } from "express-validator";
import { Model } from '../../../models/index.js';
import { buildqueue } from "../../../utils/queues.js";
import { AllocatePortandSubdomain } from "../../../utils/allocation.js";
import { redisclient } from "../../../configs/redis.js";

const createDeploymentValidate = [
    body("name")
        .notEmpty()
        .withMessage("Project name is required"),
    body("codeLink")
        .notEmpty()
        .withMessage("Code link is required"),
    body("projectType")
        .notEmpty()
        .withMessage("Project type is required")
        .isIn(["static", "node"])
        .withMessage("Project type must be static or node"),
    body("env")
        .optional()
        .isObject()
        .withMessage("Env must be an object"),
    body("buildCommand")
        .if(body("projectType").equals("static"))
        .notEmpty()
        .withMessage("Build command is required for static project"),
    body("publishDir")
        .if(body("projectType").equals("static"))
        .notEmpty()
        .withMessage("Publish directory is required for static project"),
    body("startCommand")
        .if(body("projectType").equals("node"))
        .notEmpty()
        .withMessage("Start command is required for node project"),
    body('port')
        .if(body("projectType").equals('node'))
        .notEmpty()
        .withMessage('port is required for node'),
    body('branchname')
        .notEmpty()
        .withMessage('branch name is required'),
    body('isFolder')
        .notEmpty()
        .withMessage("is folderis required")
        .isBoolean()
        .withMessage('only boolean'),
    body('folderName')
        .if(body('isFolder').equals(true))
        .notEmpty()
        .withMessage("folderName is required")
        .isString()
        .withMessage('folder name must be a string')
];

const createDeployment = async (req, res) => {
    try {
        await Promise.all(createDeploymentValidate.map((validate) => validate.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            })
        }

        const user = req.user;
        const { name, codeLink, projectType, env, buildCommand, publishDir, startCommand, port, type, branchname, isFolder, folderName } = req.body
        let commitSha = null;

        // Extract owner and repo from codeLink
        const repoLinkWithoutGit = codeLink.endsWith('.git')
            ? codeLink.slice(0, -4)
            : codeLink;

        // Extract owner/repo from link
        const parts = repoLinkWithoutGit.split('/');
        const owner = parts[3];
        const repo = parts[4].replace(/\.git$/, '');

        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branchname}`,
                {
                    headers: {
                        "Accept": "application/vnd.github.v3+json",
                        //Authorization: `token ${GITHUB_TOKEN}`
                    }
                }
            );
            const data = await response.json();
            commitSha = data?.object?.sha || null;
            console.log("Commit SHA:", commitSha);
        } catch (err) {
            console.log("Commit fetch failed, continuing without commit check");
        }


        const newProject = new Model.Project({
            name,
            owner: user._id,
            repoLink: codeLink,
            projectType,
            env: env,
            settings: {
                repoBranchName: branchname,
                folder: {
                    enabled: isFolder,
                    name: isFolder ? folderName : undefined
                }
            },
            totalBuilds: +1
        })

        if (projectType === 'static') {
            newProject.buildCommand = buildCommand,
                newProject.publishDir = publishDir
        }

        if (projectType === 'node') {
            newProject.startCommand = startCommand
            newProject.port = port
        }

        const newBuild = new Model.Build({
            project: newProject._id,
            commitSha: commitSha,
        })

        const generateUniqueName = async (name) => {
            while (true) {
                const uniqueName = Math.random().toString(36).substring(2, 8);
                const subdomain = `${name.toLowerCase()}-${uniqueName}`;


                const existingBinding = await Model.Binding.findOne({ subdomain });
                if (!existingBinding) {
                    return subdomain;
                }
            }
        };

        const allocation = await AllocatePortandSubdomain(newProject._id, await generateUniqueName(name));

        newProject.buildId = newBuild._id;

        if (env) {
            for (const [key, value] of Object.entries(env)) {
                newProject.env.set(key, value);
            }
        }
        await newProject.save({ validateBeforeSave: false });
        await newBuild.save({ validateBeforeSave: false });


        // add allocation data to redis cache
        await redisclient.hset(`subdomain:${allocation.subdomain}`, {
            port: allocation.port,
            subdomain: allocation.subdomain,
            url: allocation.url
        })

        buildqueue.add("buildqueue", { buildId: newBuild._id.toString(), projectId: newProject._id.toString() })

        return res.status(200).json({
            success: true,
            buildId: newBuild._id,
            status: "queued",
            newProject
        })


    } catch (error) {
        console.log("error while create deployment", error)
        return res.status(500).json({
            error: "Internal server Error"
        })
    }
}

export { createDeployment }