const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  //write code to check is the username is valid
  // Retrieves all users with username
  let userWithSameName = users.filter((user) => {
    return user.username === username;
  });

  if (userWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  let userList = users.filter((user) => user.username === username && user.password === password);

  if (userList.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  let user = req.body.username;
  let pass = req.body.password;

  // Check if username and password are missing
  if (!user || !pass) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(user, pass)) {
    // Generate JWT
    let accessToken = jwt.sign({data: pass}, "access", {expiresIn: 60*60});

    // Store accessToken and username un session
    req.session.authorization = {
      accessToken,
      user,
    };

    return res.status(200).send(`User successfully logged in. Username: ${user}`);
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let review = req.query.review;
  let username = req.session.authorization.user;
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }

  // Add review to book
  book["reviews"][username] = review;

  return res.status(200).json({
    message: "Review successfully added/updated",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let username = req.session.authorization.user;
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  // Save review for displaying after deletion
  let existingReview = book["reviews"][username];

  // Delete review
  delete book["reviews"][username];

  return res.status(200).json({
    message: "Review successfully deleted",
    review: existingReview
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
