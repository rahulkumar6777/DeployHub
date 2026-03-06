import app from "./index.js";
import { ENV } from "./src/lib/env.js";


const PORT = ENV.PORT;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})