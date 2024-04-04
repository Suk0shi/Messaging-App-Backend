const { body, validationResult } = require("express-validator");
const mongoose = require('mongoose');
const Message = require("../models/message");
const Chat = require("../models/chat");
const { DateTime } = require("luxon");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.sendMessage_post = [
  
    // Validate and sanitize fields.
    body("message", "Message must not be empty.")
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
        
        console.log(req.params.id)
        const addMessage = await Chat.findOne({
            $or: [
                { user1: req.params.id, user2: thisUser.username },
                { user2: req.params.id, user1: thisUser.username }
            ]
        }).exec();      
        if(addMessage===null) {
        res.json("Chat not found")
        }
        // Create an updated chat with the new message
        const chat = new Chat({
            user1: addMessage.username,
            user2: addMessage.username,
            chat: [...addMessage.chat, {
                user: thisUser.username,
                date: DateTime.fromJSDate(new Date()).toLocaleString(DateTime.DATE_MED),
                text: req.body.message,
            }],
            _id: addMessage._id
        });
        
        if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
        
        res.json({
            errors: errors.array(),
        });
        } else {
        // Data from form is valid. Save user.
        await Chat.findByIdAndUpdate(addMessage._id, chat, {});
        res.json("Message sent");
        }
        
    })
];

exports.message_get = asyncHandler(async (req, res, next) => {

    let user = undefined;

    jwt.verify(req.token, `${process.env.JWT_KEY}`,(err, authData) => {
        if(err) {
        res.json('Login required')
        } else {
        user = authData.user;
        }
    })  
    const messages = await Chat.findOne({
        $or: [
            { user1: req.params.id, user2: user.username },
            { user2: req.params.id, user1: user.username }
        ]
    }).exec();   
    console.log('working')
    
    if (messages === null) {
        // No results.
        const err = new Error("No messages found");
        err.status = 404;
        return next(err);
    }
    res.json({
        messages: messages.chat
    });
});