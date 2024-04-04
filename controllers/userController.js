const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const Chat = require("../models/chat");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.signUp_post = [
    // Validate and sanitize fields.
    body("username", "Name must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("email", "Email must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("password", "Password must not be empty")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("passwordConfirm", "Password confirmation must match")
      .custom((value, { req }) => {
        return value === req.body.password;
      }),
    // Process request after validation and sanitization.

    asyncHandler(async (req, res, next) => {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            // Extract the validation errors from a request.
            const errors = validationResult(req);
    
            // Create a User object with escaped and trimmed data.
            const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            friends: undefined,
            });
        
            if (!errors.isEmpty()) {
                // There are errors. Render form again with sanitized values/error messages.
            
                res.json({
                    title: "Sign Up",
                    user: user,
                    errors: errors.array(),
                });
            } else {
                // Data from form is valid. Save user.
                await user.save();
                res.json("user created");
            }
        })
    })
];

exports.friends = asyncHandler(async (req, res, next) => {
  
  let user = undefined;

  jwt.verify(req.token, `${process.env.JWT_KEY}`,(err, authData) => {
    if(err) {
      res.json('Login required')
    } else {
      user = authData.user;
    }
  })  
  const friends = await User.findOne( {_id: user._id} ).exec();
  
  if (friends === null) {
    // No results.
    const err = new Error("No friends found");
    err.status = 404;
    return next(err);
  }
  res.json({
    friends: friends.friends, username: friends.username
  });
});

exports.addFriend = [
  
  // Validate and sanitize fields.
  body("username", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    let thisUser = null;
    jwt.verify(req.token, `${process.env.JWT_KEY}`,(err, authData) => {
      if(err) {
        res.json('Login required')
      } else {
        thisUser = authData.user;
      }
    })
    const errors = validationResult(req);
    
    const addUser = await User.findOne( {username: req.body.username} ).exec();
    if(addUser===null) {
      res.json("User not found")
    }
    
    // Create a User object with escaped and trimmed data.
    const user = new User({
      username: thisUser.username,
      email: thisUser.email,
      password: thisUser.password,
      friends: [...thisUser.friends, addUser.username],
      _id: thisUser._id
    });
    
    const createChat1 = await Chat.findOne( {user1: thisUser.username, user2: addUser.username} ).exec();
    const createChat2 = await Chat.findOne( {user1: addUser.username, user2: thisUser.username} ).exec();
    if(createChat1===null && createChat2===null) {
      const chat = new Chat({
      user1: thisUser.username,
      user2: addUser.username,
      chat: undefined,
    });
    if (!errors.isEmpty()) {
      res.json({
        title: "Add Friend",
        user: user,
        errors: errors.array(),
      });
    }
    else {
      await chat.save();
    }
    }
    
    
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      
      res.json({
        title: "Add Friend",
        user: user,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save user.
      await User.findByIdAndUpdate(thisUser._id, user, {});
      res.json("Friend Added");
    }
    
  })
];
