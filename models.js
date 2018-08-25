const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const blogPostSchema = mongoose.Schema({
  
  title: { type: String, required: true },
  content: { type: String },
  picture: { type: String }
});


blogPostSchema.virtual('authorName').get(function () {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    content: this.content,
    title: this.title,
    picture: this.picture
  };
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = { BlogPost };