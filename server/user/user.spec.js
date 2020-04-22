const request = require("supertest");
const passport = require("passport");
const app = require("../config/lib/express")();
const specHelper = require("../config/helpers/spec.helper");

//require("../config/lib/passport")(passport);
require("./user.routes")(app, passport);

describe("User Api", () => {
    const user = specHelper.users.admin;

    it("Should get 401 Unauthorized http status code with invalid email or password", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({
                email: "garbage@emaill.com",
                password: "garbage-password"
            });

        expect(response.statusCode).toBe(401);
    });

    it("Should login with valid email and password", async () => {
        const response = await request(app)
            .post("/api/login")
            .send({
                email: user.email,
                password: user.password
            });

        expect(response.statusCode).toBe(200);
    });

    // it("Should get access token with valid email and password", async () => {
    //     const response = await request(app).post("/api/login");
    //     expect(response.statusCode).toBe(200);
    // });
});
