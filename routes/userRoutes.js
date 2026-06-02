const express = require('express');
const userController = require('./../controllers/userController');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUserById);
router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

//restrict ot admins only
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers).post(userController.postUser);
router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUserById)
  .delete(userController.deleteUserById);

module.exports = router;
