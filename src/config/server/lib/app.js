module.exports.start = async function() {
    require("dotenv").config();

    const app = require("./express")(); 

    app.listen(app.get("port"), function() {
        console.info("Server running on port %s in %s mode...", app.get("port"), app.settings.env);
    });
};
