const { ObjectId } = require('mongodb');

module.exports = function (db) {
  const users = db.collection('users');
  const courses = db.collection('courses');

  return {
    /**
     * @desc    Enroll the current user in a course
     * @route   POST /api/enroll/:courseId
     * @access  Private (Student only)
     */
    enrollInCourse: async (req, res) => {
      try {
        const { courseId } = req.params;
        const userId = req.user.userId;

        if (!ObjectId.isValid(courseId)) {
          return res.status(400).json({ error: "Invalid course ID format" });
        }

        const course = await courses.findOne({ _id: new ObjectId(courseId) });
        if (!course) {
          return res.status(404).json({ error: "Course not found" });
        }

        const user = await users.findOne({ _id: new ObjectId(userId) });
        if (user.enrolledCourses && user.enrolledCourses.some(id => id.equals(courseId))) {
            return res.status(400).json({ error: "You are already enrolled in this course" });
        }

        await users.updateOne(
          { _id: new ObjectId(userId) },
          { $addToSet: { enrolledCourses: new ObjectId(courseId) } } 
        );

        res.status(200).json({ message: "Successfully enrolled in the course" });

      } catch (err) {
        console.error("Enrollment Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /**
     * @desc    Get all courses a user is enrolled in
     * @route   GET /api/enroll/my-courses
     * @access  Private (Student only)
     */
    getEnrolledCourses: async (req, res) => {
      try {
        const userId = req.user.userId;

        const user = await users.findOne({ _id: new ObjectId(userId) });
        if (!user || !user.enrolledCourses || user.enrolledCourses.length === 0) {
          return res.status(200).json([]);
        }

        const enrolledCoursesDetails = await courses.find({
          _id: { $in: user.enrolledCourses }
        }).toArray();

        res.status(200).json(enrolledCoursesDetails);

      } catch (err) {
        console.error("Get Enrolled Courses Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
};
