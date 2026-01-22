const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios').default;

// Promisified functions to handle book retrieval
function getBooks() {
  return new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (error) {
      reject(error);
    }
  });
}

// Get book details based on ISBN
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    try {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error("Book not found"));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Get book details based on author
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    try {
      let booksByAuthor = [];
      for (let isbn in books) {
        if (books[isbn].author === author) {
          booksByAuthor.push(books[isbn]);
        }
      }
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        reject(new Error("No books found by this author"));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Get all books based on title
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    try {
      let booksByTitle = [];
      for (let isbn in books) {
        if (books[isbn].title === title) {
          booksByTitle.push(books[isbn]);
        }
      }
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error("No books found by this title"));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Register a new user
public_users.post("/register", (req,res) => {
  let user = req.body.username;
  let pass = req.body.password;

  // Check if username and password are provided
  if (user && pass) {
    // Check if the user does not already exist
    if (!isValid(user)) {
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
public_users.get('/',async function (req, res) {
  //res.send(JSON.stringify(books, null, 4));

  try {
    const booksList = await getBooks();
    res.send(JSON.stringify(booksList, null, 4));
  } catch (error) {
    res.status(500).json({message: "Error retrieving books"});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    res.send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    // Get author from request parameters
    const author = req.params.author;
    const booksByAuthor = await getBooksByAuthor(author);
    res.send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

// Get all books based on title
public_users.get('/title/:title', async  function (req, res) {
  try {
    // Get title from request parameters
    const title = req.params.title;
    const booksByTitle = await getBooksByTitle(title);
    res.send(JSON.stringify(booksByTitle, null, 4));
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

  // Get ISBN from request parameters
  let isbn = req.params.isbn;
  let book = books[isbn];

  // Return the book reviews
  if (book) {
    res.send(JSON.stringify(book["reviews"], null, 4));
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
