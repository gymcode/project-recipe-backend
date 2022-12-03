'use strict';
import express, {Express} from "express"; 
import Database_Connection from "./services/databaseConfig";
import { config } from "dotenv";
import { BASE_URL } from "./shared/constants";
config()

const port = process.env.PORT || "8080"
const app: Express = express()

app.use(express.json())

//routesconfig()
import userRoutes from "./routes/userRoute";

// all user routes
app.use(`${BASE_URL}/user`, userRoutes)

app.listen(port, () => {
    // establish the database connection 
    Database_Connection()
    console.log(`Example app listening on port ${port}`)
},)
