const request = require("supertest");
const specHelper = require("../../../config/server/helpers/spec.helper");
const app = require("../../../config/server/lib/express")();

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
