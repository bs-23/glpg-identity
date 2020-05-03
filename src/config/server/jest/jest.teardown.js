module.exports = async function () {
    process.env.POSTGRES_DATABASE_URL = "postgres://postgres:root@localhost:5432/ciam_test";

    const path = require("path");
    const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));

    await sequelize.query('DROP SCHEMA "ciam" CASCADE');
    await sequelize.close();
};
