const path = require("path");
const request = require("supertest");
const app = require(path.join(process.cwd(), "src/config/server/lib/express"))();
const specHelper = require(path.join(process.cwd(), "src/config/server/jest/spec.helper"));

describe("User Api", () => {
    const systemAdmin = specHelper.users.systemAdmin;

    it("Should get 401 Unauthorized http status code with invalid credential", async () => {
        const response = await request(app).post("/login").send({
            email: "garbage@emaill.com",
            password: "garbage-password"
        });

        expect(response.statusCode).toBe(401);
    });

    it("Should login with valid email and password", async () => {
        const response = await request(app).post("/login").send({
            email: systemAdmin.email,
            password: systemAdmin.password
        });

        expect(response.statusCode).toBe(200);
        expect(response.res.headers["content-type"]).toMatch("application/json");
    });

    it("Should get the signed in user profile", async () => {
        const response = await request(app).get("/users/getSignedInUserProfile").set("Cookie", [`access_token=${systemAdmin.access_token}`]);

        expect(response.statusCode).toBe(200);
        expect(response.res.headers["content-type"]).toMatch("application/json");
    });
});
