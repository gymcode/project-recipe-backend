'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const databaseConfig_1 = __importDefault(require("./services/databaseConfig"));
const dotenv_1 = require("dotenv");
const constants_1 = require("./shared/constants");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
//routesconfig()
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const bookmarkRoute_1 = __importDefault(require("./routes/bookmarkRoute"));
// adding logger class
const logger_1 = require("./logger");
const logger = new logger_1.Logger();
const port = process.env.PORT || "8080";
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); /* NEW */
app.use(express_1.default.json());
app.use('/haute-cuisine-api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
// all user routes
app.use(`${constants_1.BASE_URL}/users`, userRoute_1.default);
app.use(`${constants_1.BASE_URL}/bookmarks`, bookmarkRoute_1.default);
(0, databaseConfig_1.default)().then(() => {
    app.listen(port, () => {
        logger.info(`Application listening on port ${port} : url http://localhost:${port}`);
    });
});
