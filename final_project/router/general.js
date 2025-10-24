const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    new Promise((resolve, reject) => {
        resolve(books);
    })
    .then((data) => {
        return res.status(200).json(data);
    })
    .catch((err) => {
        return res.status(500).json({ message: "Error fetching books", error: err });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function(req, res) {
    const isbn = req.params.isbn;
    try {
      // Simulate async operation using Axios (or Promise)
      const response = await new Promise((resolve, reject) => {
        if (books[isbn]) resolve(books[isbn]);
        else reject("Book not found");
      });
      return res.status(200).json(response);
    } catch (err) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    new Promise((resolve, reject) => {
      const booksByAuthor = Object.values(books).filter(book => book.author === author);
      if (booksByAuthor.length > 0) resolve(booksByAuthor);
      else reject("No books found for given author");
    })
    .then((booksByAuthor) => {
        return res.status(200).json({ booksbyauthor: booksByAuthor });
    })
    .catch((err) => {
        return res.status(404).json({ message: `No books found for author: ${author}` });
    });
});

// Get all books based on title
public_users.get('/title/:title',async (req, res) => {
    const title = req.params.title;
    try {
      const result = await new Promise((resolve, reject) => {
        const bookByTitle = Object.values(books).filter(book => book.title === title);
        if (bookByTitle.length > 0) resolve(bookByTitle[0]);
        else reject("Book not found");
      });
      return res.status(200).json({ bookbytitle: result });
    } catch (err) {
      return res.status(404).json({ message: `No book found with title: ${title}` });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // 1. Get the ISBN from the URL parameters
  const isbn = req.params.isbn;

  // 2. Check if the book exists in the 'books' object
  if (books[isbn]) {
    // 3. If the book exists, retrieve its reviews object
    const reviews = books[isbn].reviews;

    // 4. Return the reviews with a 200 OK status
    // Note: The 'reviews' property is an object containing user reviews.
    return res.status(200).json({ 
      reviews: reviews 
    });
  } else {
    // 5. If the book is not found, return a 404 Not Found status
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

module.exports.general = public_users;
