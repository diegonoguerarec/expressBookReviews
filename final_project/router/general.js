const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  // Retrieves all users with username
  let userWithSameName = users.filter((user) => {
    return user.username === username;
  });

  if (userWithSameName.length > 0) {
    return true;
  } else {
    return false;
  }
};


public_users.post("/register", (req,res) => {
  let user = req.body.username;
  let pass = req.body.password;

  // Check if username and password are provided
  if (user && pass) {
    // Check if the user does not already exist
    if (!doesExist(user)) {
      // Add new user
      users.push({
        "username": user,
        "password": pass,
      });

      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  } else {
    return res.status(404).json({message: "User and password are required."});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (book) {
    res.send(JSON.stringify(book, null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let booksByAuthor = [];

  for (let isbn in books) {
    if (books[isbn].author === author) {
      booksByAuthor.push(books[isbn]);
    }
  }

  if (booksByAuthor.length > 0) {
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } else {
    res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  let title = req.params.title;
  let booksByTitle = [];

  for (let isbn in books) {
    if (books[isbn].title === title) {
      booksByTitle.push(books[isbn]);
    }
  }

  if (booksByTitle.length > 0) {
    res.send(JSON.stringify(booksByTitle, null, 4));
  } else {
    res.status(404).json({message: "No books found by this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];

  if (book) {
    res.send(JSON.stringify(book["reviews"], null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
