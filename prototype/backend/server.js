import app from "./index.js";
import { initSocket } from "./src/socket/socketServer.js";
import http from "http"


const PORT = process.env.PORT;


// routes
import Routes from './src/routes/user.routes.js'

// import worker
import './src/workers/buildworker.js'
import './src/workers/deployworker.js'
import './src/workers/reDeploy.worker.js'
import './src/workers/Requestcountworker.js'
import './src/workers/recreate-container.worker.js'
import './src/workers/deleteProject.worker.js'
import './src/workers/Metricscronworker.js'

import { ensureBucket } from './src/utils/minio.js'
await ensureBucket()

app.use("/health" , (req , res)=>{
    res.send('healthy')
})
app.use('/api', Routes)

const server = http.createServer(app)

initSocket(server)

server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})
