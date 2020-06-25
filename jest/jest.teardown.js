module.exports = async function () {
    require("dotenv").config();

    process.env.POSTGRES_DATABASE = "ciam_test";

    const path = require("path");
    const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

    await sequelize.cdpConnector.query('DROP SCHEMA "ciam" CASCADE');
    await sequelize.cdpConnector.close();
};
