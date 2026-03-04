import { uploadLog, buildLogUrl } from './minio.js'

export class BuildLogger {

    constructor(buildId, projectId) {

        this.buildId = buildId

        this.projectId = projectId

        this.lines = []

        this.startedAt = null

    }

    async start() {

        this.startedAt = new Date()

        this.write(`[deployhub] Build started at ${this.startedAt.toISOString()}\n`)

    }

    write(chunk) {

        if (!chunk) return

        const clean = chunk.toString()

            .replace(/\r/g, '')

            .replace(/^[\x00-\x08][\x00-\x03][\x00]{6}/gm, '')

            .trimEnd()

        if (!clean) return

        const ts = new Date().toISOString().slice(11, 23)

        this.lines.push(`[${ts}] ${clean}`)

    }

    async finish(status = 'success') {

        const finishedAt = new Date()

        this.write(`[deployhub] Build ${status} at ${finishedAt.toISOString()}`)

        const objectName = `builds/${this.projectId}/${this.buildId}.log`

        let logUrl = null

        try {

            await uploadLog(objectName, this.lines.join('\n'))

            logUrl = buildLogUrl(objectName)

        } catch (err) {

            console.error('[buildLogger] Minio upload failed:', err.message)

        }

        return logUrl

    }

}