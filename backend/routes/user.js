const express = require('express');
const authenticateToken = require("../middleware/auth");

module.exports = function (db) {
  const router = express.Router();

  const userController = require('../controllers/userController')(db);

  router.post('/register', userController.registerUser);

  router.post('/login', userController.loginUser); 

  router.get("/profile", authenticateToken, userController.getUserProfile);

  return router;
};