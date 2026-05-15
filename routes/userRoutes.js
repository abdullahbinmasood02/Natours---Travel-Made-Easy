const express = require('express');
const userController = require('./../controllers/userController');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);

router.route('/').get(userController.getAllUsers).post(userController.postUser);
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById);

module.exports = router;
