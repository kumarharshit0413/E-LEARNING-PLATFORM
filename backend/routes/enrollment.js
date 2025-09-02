const express = require('express');
const authenticateToken = require('../middleware/auth');
const authorize = require('../middleware/authorize');

module.exports = function (db) {
  const router = express.Router();
  const enrollmentController = require('../controllers/enrollmentController')(db);


  router.get(
    '/my-courses',
    authenticateToken,
    authorize('student'),
    enrollmentController.getEnrolledCourses
  );

  router.post(
    '/:courseId',
    authenticateToken,
    authorize('student'),
    enrollmentController.enrollInCourse
  );

  return router;
};
