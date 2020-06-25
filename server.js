require('dotenv').config();

if(process.env.NODE_ENV === 'production') {
    require('newrelic');
}

const app = require('./src/config/server/lib/app');
app.start();
