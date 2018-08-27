const chai = require("chai");
const chaiHttp = require("chai-http");

const expect = chai.expect;

const { app, runServer, closeServer } = require("../server");

chai.use(chaiHttp);

describe("Blog Posts", function() {
  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it("should list items on GET", function() {
    return chai
      .request(app)
      .get("/posts")
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a("array");
        expect(res.body.length).to.be.above(0);
        res.body.forEach(function(item) {
          expect(item).to.be.a("object");
          expect(item).to.have.all.keys(
            "id",
            "title",
            "content",
            "picture",
            "username"
          );
        });
      });
  });

  it("should add a blog post on POST", function() {
    const newPost = {
      title: "Lorem ip some",
      content: "foo foo foo foo",
      picture: "https://pixabay.com/get/ea30b8092cfd073ed1584d05fb1d4e97e07ee3d21cac104496f5c278a1eeb5bb_340.jpg",
      username: "demo@demo.com"
    };
    const expectedKeys = ["id"].concat(Object.keys(newPost));

    return chai
      .request(app)
      .post("/posts")
      .send(newPost)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a("object");
        expect(res.body).to.have.all.keys(expectedKeys);
        expect(res.body.title).to.equal(newPost.title);
        expect(res.body.content).to.equal(newPost.content);
        expect(res.body.author).to.equal(newPost.author);
        expect(res.body.username).to.equal(newPost.username);
      });
  });

  it("should error if POST missing expected values", function() {
    const badRequestData = {};
    return chai
      .request(app)
      .post("/posts")
      .send(badRequestData)
      .then(function(res) {
        expect(res).to.have.status(400);
      });
  });

  it("should update blog posts on PUT", function() {
    return (
      chai
        .request(app)
        // first have to get
        .get("/posts")
        .then(function(res) {
          const updatedPost = Object.assign(res.body[0], {
            title: "connect the dots",
            content: "la la la la la"
          });
          return chai
            .request(app)
            .put(`/posts/${res.body[0].id}`)
            .send(updatedPost)
            .then(function(res) {
              expect(res).to.have.status(204);
            });
        })
    );
  });

  it("should delete posts on DELETE", function() {
    return (
      chai
        .request(app)
        // first have to get
        .get("/posts")
        .then(function(res) {
          return chai
            .request(app)
            .delete(`/posts/${res.body[0].id}`)
            .then(function(res) {
              expect(res).to.have.status(204);
            });
        })
    );
  });
});