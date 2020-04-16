module.exports = function(passport) {
    require("../../user/user.strategies")(passport);
};
