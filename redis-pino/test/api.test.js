
const app = require('../jsDir/pinoTest');
const supertest = require("supertest");

test("GET test ", async () => {

  await supertest(app).get("/")
    .expect(200)
    .then((response) => {
      // Check type and length
      //expect(Array.isArray(response.body)).toBeTruthy();
      console.log(response.body.name);
      expect(response.body.name).toEqual("john");

      // Check data
      //expect(response.body).toBe("");
      //expect(response.body[0].title).toBe(post.title);
      //expect(response.body[0].content).toBe(post.content);
    });
});
