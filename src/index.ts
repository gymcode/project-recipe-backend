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

const port = process.env.PORT || "8080"
const app: Express = express()

app.use(cors()); /* NEW */

app.use(express.json())
app.use('/haute-cuisine-api-docs', SwaggerUi.serve, SwaggerUi.setup(SwaggerDocs));

// all user routes
app.use(`${BASE_URL}/users`, userRoutes)

Database_Connection().then(()=>{
    app.listen(port, () => {
        // establish the database connection 
        console.log(`Example app listening on port ${port}`)
    })    
})
