import app from "./index.js";

const PORT = process.env.PORT;


// routes
import Routes from './src/routes/user.routes.js'

// import worker
import './src/workers/buildworker.js'
import './src/workers/deployworker.js'
import './src/workers/reDeploy.worker.js'
import './src/workers/Requestcountworker.js'

app.use('/api', Routes)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})