const path = require("path");
const request = require("supertest");
const app = require(path.join(process.cwd(), "config/server/lib/express"))();

describe("Core Api", () => {
    it("Should respond with html if requst is not an ajax", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.res.headers["content-type"]).toMatch("text/html");
    });
});
