module.exports = function(passport) {
    require("../../../modules/user/server/user.strategy")(passport);
};
