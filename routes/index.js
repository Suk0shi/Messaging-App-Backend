var express = require('express');
var router = express.Router();

const user_controller = require("../controllers/userController");
const chat_controller = require("../controllers/chatController");
const { verify } = require('jsonwebtoken');

router.get("/friends", verifyToken ,user_controller.friends)

router.post("/addFriend", verifyToken ,user_controller.addFriend)

router.post("/signUp", user_controller.signUp_post);

router.post("/sendMessage/:id", verifyToken, chat_controller.sendMessage_post);

router.get("/messages/:id", verifyToken, chat_controller.message_get);

function verifyToken(req, res, next) {
  // Get auth header value 
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
  } else {
      // Forbidden
      res.json('Login required')
  }
}

module.exports = router;
