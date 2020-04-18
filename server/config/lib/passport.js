module.exports = function(passport) {
    require("../../user/user.strategy")(passport);
};
