import { redisclient } from '../../../configs/redis.js'
import { Model } from '../../../models/index.js'
import { SslCertificate } from '../../../models/slices/sslCertificate.js'
import { isBlockedDomain } from '../../../utils/blockedDomains.js'
import docker from '../../../utils/docker.js'
import {
    isDomainPointingToServer,
    generateCertificate,
    writeNginxConfig,
    removeNginxConfig,
    reloadNginx,
} from '../../../utils/sslUtils.js'


export const getProjectDomains = async (req, res) => {
    try {
        const project = await Model.Project.findOne({
            _id: req.params.id, owner: req.user._id
        }).select('subdomain hascustomDomain customDomain customDomainStatus plan').lean()

        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        let sslInfo = null
        if (project.customDomain) {
            sslInfo = await SslCertificate.findOne({ domain: project.customDomain })
                .select('issuedAt expiresAt nextRenewAt status').lean()
        }

        res.json({
            success: true,
            subdomain: project.subdomain,
            hascustomDomain: project.hascustomDomain,
            customDomain: project.customDomain || null,
            customDomainStatus: project.customDomainStatus || null,
            plan: project.plan,
            ssl: sslInfo,
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}


export const updateSubdomain = async (req, res) => {
    try {
        const { subdomain } = req.body
        if (!subdomain || !/^[a-z0-9-]{3,40}$/.test(subdomain)) {
            return res.status(400).json({ success: false, message: 'Invalid subdomain format' })
        }

        const conflict = await Model.Project.findOne({
            subdomain, _id: { $ne: req.params.id }
        })
        if (conflict) return res.status(409).json({ success: false, message: 'Subdomain already taken' })

        const oldProject = await Model.Project.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { $set: { subdomain } },
            { new: false }
        );

        const allocation = await Model.Binding.findOneAndUpdate({
            project: req.params.id
        },
            {
                subdomain: subdomain
            }
        )

        await redisclient.del(`subdomain:${subdomain}`)

        await redisclient.hset(`subdomain:${subdomain}`, {
            port: allocation.port,
            projectId: req.params._id.toString(),
            plan: project.plan
        })

        const containers = await docker.listContainers({ all: true })
        const existingcontainer = containers.find(c =>
            c.Image.includes(`${oldProject.subdomain}`)
        )

        if (existingcontainer) {
            const container = docker.getContainer(existingcontainer.Id);
            const inspect = await container.inspect();

            if (inspect.State.Running) {
                await container.rename({ name: subdomain });
            }
        }

        res.json({ success: true, subdomain })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}


export const checkCustomDomain = async (req, res) => {
    try {
        const { domain } = req.query
        if (!domain) return res.status(400).json({ success: false, message: 'Domain required' })

        if (isBlockedDomain(domain)) {
            return res.status(403).json({
                success: false,
                message: 'This domain is reserved and cannot be used'
            })
        }

        if (!/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/.test(domain)) {
            return res.status(400).json({ success: false, message: 'Invalid domain format' })
        }


        const existing = await Model.Project.findOne({
            customDomain: domain,
            _id: { $ne: req.params.id },
        })
        if (existing) return res.status(409).json({ success: false, message: 'Domain already in use by another project' })

        // DNS check
        const pointing = await isDomainPointingToServer(domain)

        res.json({
            success: true,
            domain,
            pointing,
            serverIp: process.env.SERVER_IP,
            message: pointing
                ? 'DNS verified — ready to provision SSL'
                : `Point your domain A record to ${process.env.SERVER_IP} first`,
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}


export const addCustomDomain = async (req, res) => {
    try {
        const { domain } = req.body
        if (!domain) return res.status(400).json({ success: false, message: 'Domain required' })

        if (isBlockedDomain(domain)) {
            return res.status(403).json({
                success: false,
                message: 'This domain is reserved and cannot be used'
            })
        }

        const project = await Model.Project.findOne({ _id: req.params.id, owner: req.user._id })
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' })

        if (project.plan !== 'pro') {
            return res.status(403).json({ success: false, message: 'Custom domains require Pro plan' })
        }

        const conflict = await Model.Project.findOne({ customDomain: domain, _id: { $ne: req.params.id } })
        if (conflict) return res.status(409).json({ success: false, message: 'Domain already in use' })


        const p = await Model.Project.findByIdAndUpdate(req.params.id, {
            $set: { customDomain: domain, customDomainStatus: 'provisioning' }
        })

        const allocation = await Model.Binding.findOne({ project: req.params.id })
        if (allocation) {
            allocation.customDomain = domain
            await allocation.save({ validateBeforeSave: false })
        }

        res.json({ success: true, message: 'Provisioning started', domain })


            ; (async () => {
                try {
                    await generateCertificate(domain, req.params.id)
                    writeNginxConfig(domain)
                    await reloadNginx()
                    await Model.Project.findByIdAndUpdate(req.params.id, {
                        $set: { hascustomDomain: true, customDomainStatus: 'active' }
                    })

                    await redisclient.hset(`customdomain:${domain}`, {
                        port: allocation.port,
                        projectId: p._id.toString(),
                        plan: p.plan,
                        subdomain: allocation.subdomain
                    })

                    console.log(`[domains] ${domain} provisioned successfully`)
                } catch (err) {
                    console.error(`[domains] Provision failed for ${domain}:`, err.message)
                    await Model.Project.findByIdAndUpdate(req.params.id, {
                        $set: { customDomainStatus: 'failed' }
                    })
                }
            })()

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}


export const getCustomDomainStatus = async (req, res) => {
    try {
        const project = await Model.Project.findOne({
            _id: req.params.id, owner: req.user._id
        }).select('customDomain hascustomDomain customDomainStatus').lean()

        if (!project) return res.status(404).json({ success: false })

        let ssl = null
        if (project.customDomain) {
            ssl = await SslCertificate.findOne({ domain: project.customDomain })
                .select('expiresAt nextRenewAt status').lean()
        }

        res.json({
            success: true,
            customDomain: project.customDomain,
            hascustomDomain: project.hascustomDomain,
            customDomainStatus: project.customDomainStatus,
            ssl,
        })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}


export const removeCustomDomain = async (req, res) => {
    try {
        const project = await Model.Project.findOne({
            _id: req.params.id, owner: req.user._id
        }).select('customDomain').lean()

        if (!project) return res.status(404).json({ success: false })
        if (!project.customDomain) return res.status(400).json({ success: false, message: 'No custom domain attached' })

        const domain = project.customDomain

        removeNginxConfig(domain)
        await reloadNginx()

        await Model.Project.findByIdAndUpdate(req.params.id, {
            $set: { customDomain: null, hascustomDomain: false, customDomainStatus: null }
        })

        await SslCertificate.findOneAndUpdate(
            { domain },
            { $set: { status: 'expired' } }
        )

        await redisclient.del(`customdomain:${project.customDomain}`)

        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}