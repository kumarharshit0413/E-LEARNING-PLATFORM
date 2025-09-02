const express = require('express');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../config/multer');

module.exports = function (db) {
  const router = express.Router();
  const courseController = require('../controllers/courseController')(db);

  router.get(
    '/my-courses',
    authenticateToken,
    authorize('instructor'),
    courseController.getInstructorCourses
  );

  router.get('/', courseController.getAllCourses);
  
  router.get('/:id', courseController.getCourseById);

  router.post(
    '/',
    authenticateToken,
    authorize('instructor'),
    courseController.createCourse
  );

  router.put(
    '/:id',
    authenticateToken,
    authorize('instructor'),
    courseController.updateCourse
  );

  router.delete(
    '/:id',
    authenticateToken,
    authorize('instructor'),
    courseController.deleteCourse
  );

  router.post(
    '/:id/like',
    authenticateToken,
    courseController.toggleLike
  );

  router.post(
    '/:id/comment',
    authenticateToken,
    courseController.addComment
  );

  router.post(
    '/:id/lessons',
    authenticateToken,
    authorize('instructor'),
    upload.single('video'),
    courseController.addLesson
  );

  return router;
};
