
require('dotenv').config();
require('newrelic');
const app = require("./src/config/server/lib/app");
app.start();
