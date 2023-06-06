'use strict';
import express, {Express} from "express"; 
import Database_Connection from "./services/databaseConfig";
import { config } from "dotenv";
import { BASE_URL } from "./shared/constants";
import SwaggerUi from "swagger-ui-express"
import SwaggerDocs from "./swagger.json"
import cors from "cors"
config()

//routesconfig()
import userRoutes from "./routes/userRoute";
import bookmarkRoutes from "./routes/bookmarkRoute"

// adding logger class
import { Logger } from "./logger";
const logger = new Logger()

const port = process.env.PORT || "8080"
const app: Express = express()

app.use(cors()); 

app.use(express.json())
app.use('/haute-cuisine-api-docs', SwaggerUi.serve, SwaggerUi.setup(SwaggerDocs));

// all user routes
app.use(`${BASE_URL}/users`, userRoutes)
app.use(`${BASE_URL}/bookmarks`, bookmarkRoutes)

Database_Connection().then(()=>{
    app.listen(port, () => {
        logger.info(`Application listening on port ${port} : url http://localhost:${port}`)
    })    
})
