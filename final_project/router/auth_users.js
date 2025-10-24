const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userwithvalidname = users.filter((user)=>{
        return user.username === username
    })

    if(userwithvalidname.length > 0){
        return true
    }
    return false
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // 1. Get parameters and data
  const isbn = req.params.isbn;
  const review = req.query.review; // Assuming the review content is passed as a query parameter
  const username = req.session.authorization.username; // Get username from session

  // 2. Check if book exists
  if (!books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // 3. Check if review content is provided
  if (!review) {
      return res.status(400).json({ message: "Review content is missing. Please provide a 'review' query parameter." });
  }

  // 4. Add or Modify the review
  // The username is used as the key for the review in the book's 'reviews' object
  books[isbn].reviews[username] = review;

  // 5. Send success response
  return res.status(200).json({
      message: `Review for book with ISBN ${isbn} successfully added or modified by user ${username}.`,
      reviews: books[isbn].reviews // Optional: show the updated reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) =>{
    // 1. Get parameters and data
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get username from session

    // 2. Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // 3. Check if the user has a review for this book
    if (books[isbn].reviews[username]) {
        // 4. Delete the review
        delete books[isbn].reviews[username];

        // 5. Send success response
        return res.status(200).json({
            message: `Review posted by user ${username} for book with ISBN ${isbn} successfully deleted.`,
            reviews: books[isbn].reviews // Optional: show the updated reviews
        });
    } else {
        // 6. Send failure response (no review found to delete)
        return res.status(404).json({
            message: `No review found from user ${username} for book with ISBN ${isbn}.`
        });
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
