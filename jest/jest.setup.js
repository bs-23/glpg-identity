module.exports = async () => {
    require("dotenv").config();

    process.env.POSTGRES_DATABASE = "ciam_test";

    const path = require("path");
    const sequelize = require(path.join(process.cwd(), "src/config/server/lib/sequelize"));
    const specHelper = require(path.join(process.cwd(), "jest/spec.helper"));

    await sequelize.query("CREATE SCHEMA IF NOT EXISTS ciam");
    const User = require(path.join(process.cwd(), "src/modules/user/server/user.model"));
    const Client = require(path.join(process.cwd(), "src/modules/core/server/client.model"));
    const Country = require(path.join(process.cwd(), "src/modules/core/server/country/country.model"));

    await sequelize.sync();

    await Client.create(specHelper.defaultClient);
    await User.create(specHelper.users.defaultUser);
    await User.create(specHelper.users.defaultAdmin);
    await Country.bulkCreate(specHelper.countries, {
        returning: true,
        ignoreDuplicates: false
    });
};
