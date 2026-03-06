import app from "./index.js";
import { ENV } from "./src/lib/env.js";


const PORT = ENV.PORT;

import routes from './src/router/router.js'
app.use('/api', routes)


app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})