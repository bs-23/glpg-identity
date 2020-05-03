module.exports = async () => {
    process.env.POSTGRES_DATABASE_URL = "postgres://postgres:root@localhost:5432/ciam_test";

    const path = require("path");
    const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
    const specHelper = require(path.join(process.cwd(), "src/config/server/jest/spec.helper"));

    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam");
    await sequelize.sync();

    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    await User.create(specHelper.users.systemAdmin);
};
