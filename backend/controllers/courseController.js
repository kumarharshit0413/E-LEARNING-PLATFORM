const { ObjectId } = require('mongodb');
const redisClient = require('../config/redis'); 

// This function takes the database connection and returns an object with controller methods
module.exports = function (db) {
  const courses = db.collection('courses');
  const users = db.collection('users');
  const CACHE_KEY_COURSES = 'allCourses';

  return {
    /**
     * @desc    Create a new course
     * @route   POST /api/courses
     * @access  Private (Instructor only)
     */
    createCourse: async (req, res) => {
      try {
        const { title, description, category, lessons } = req.body;
        const instructorId = req.user.userId; 

        if (!title || !description || !category) {
          return res.status(400).json({ error: "Title, description, and category are required" });
        }

        const newCourse = {
          title,
          description,
          category,
          instructorId: new ObjectId(instructorId),
          lessons: lessons || [], // Default to an empty array if no lessons are provided
          createdAt: new Date(),
        };

        const result = await courses.insertOne(newCourse);

        await redisClient.del(CACHE_KEY_COURSES);
        console.log('Course cache invalidated.');

        res.status(201).json({ message: "Course created successfully", courseId: result.insertedId });

      } catch (err) {
        console.error("Create Course Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /**
     * @desc    Get all courses
     * @route   GET /api/courses
     * @access  Public
     */
    getAllCourses: async (req, res) => {
      try {
        const cachedCourses = await redisClient.get(CACHE_KEY_COURSES);

        if (cachedCourses) {
          console.log('Serving courses from Redis cache...');
          return res.status(200).json(JSON.parse(cachedCourses));
        }

        console.log('Serving courses from MongoDB...');
        const allCourses = await courses.find({}).sort({ createdAt: -1 }).toArray();

        await redisClient.setEx(CACHE_KEY_COURSES, 3600, JSON.stringify(allCourses));

        res.status(200).json(allCourses);

      } catch (err) {
        console.error("Get All Courses Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /**
     * @desc    Get a single course by ID
     * @route   GET /api/courses/:id
     * @access  Public
     */
    getCourseById: async (req, res) => {
      try {
        const courseId = req.params.id;
        if (!ObjectId.isValid(courseId)) {
            return res.status(400).json({ error: "Invalid course ID format" });
        }

        const course = await courses.findOne({ _id: new ObjectId(courseId) });

        if (!course) {
          return res.status(404).json({ error: "Course not found" });
        }

        res.status(200).json(course);
      } catch (err) {
        console.error("Get Course By ID Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /**
     * @desc    Update a course
     * @route   PUT /api/courses/:id
     * @access  Private (Instructor only)
     */
    updateCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            if (!ObjectId.isValid(courseId)) {
                return res.status(400).json({ error: "Invalid course ID format" });
            }

            const course = await courses.findOne({ _id: new ObjectId(courseId) });

            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            // Check if the logged-in user is the instructor of this course
            if (course.instructorId.toString() !== req.user.userId) {
                return res.status(403).json({ error: "Forbidden: You can only update your own courses" });
            }

            const { title, description, category, lessons } = req.body;
            const updates = {
                title,
                description,
                category,
                lessons
            };

            await courses.updateOne({ _id: new ObjectId(courseId) }, { $set: updates });

            await redisClient.del(CACHE_KEY_COURSES);
            console.log('Course cache invalidated.');

            res.status(200).json({ message: "Course updated successfully" });

        } catch (err) {
            console.error("Update Course Error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    /**
     * @desc    Like or unlike a course
     * @route   POST /api/courses/:id/like
     * @access  Private
     */
     toggleLike: async (req, res) => {
        try {
            const courseId = req.params.id;
            const userId = new ObjectId(req.user.userId); // Use new ObjectId here
    
            if (!ObjectId.isValid(courseId)) {
                return res.status(400).json({ error: "Invalid course ID format" });
            }
    
            const course = await courses.findOne({ _id: new ObjectId(courseId) });
            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }
    
            const hasLiked = course.likes && course.likes.some(id => id.equals(userId));
    
            const update = hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };
    
            await courses.updateOne({ _id: new ObjectId(courseId) }, update);
            const updatedCourse = await courses.findOne({ _id: new ObjectId(courseId) });
    
            res.status(200).json({ 
                message: "Like status updated",
                likes: updatedCourse.likes || [] 
            });
        } catch (err) {
            console.error("Toggle Like Error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    /**
     * @desc    Add a comment to a course
     * @route   POST /api/courses/:id/comment
     * @access  Private
     */
    addComment: async (req, res) => {
        try {
            const courseId = req.params.id;
            const { userId, name } = req.user;
            const { text } = req.body;
    
            if (!text) {
                return res.status(400).json({ error: "Comment text is required" });
            }
            if (!ObjectId.isValid(courseId)) {
                return res.status(400).json({ error: "Invalid course ID format" });
            }
    
            const newComment = {
                _id: new ObjectId(),
                text,
                authorId: new ObjectId(userId),
                authorName: name,
                createdAt: new Date(),
            };
    
            await courses.updateOne(
                { _id: new ObjectId(courseId) },
                { $push: { comments: newComment } }
            );
    
            res.status(201).json({ message: "Comment added successfully", comment: newComment });
        } catch (err) {
            console.error("Add Comment Error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    /**
     * @desc    Add a lesson to a course
     * @route   POST /api/courses/:id/lessons
     * @access  Private (Instructor only)
     */
    addLesson: async (req, res) => {
      try {
        const courseId = req.params.id;
        const { title } = req.body;

        const videoUrl = req.file ? req.file.path : '';


        if (!title) {
          return res.status(400).json({ error: "Lesson title is required" });
        }
        if (!ObjectId.isValid(courseId)) {
          return res.status(400).json({ error: "Invalid course ID format" });
        }

        const course = await courses.findOne({ _id: new ObjectId(courseId) });
        if (!course) {
          return res.status(404).json({ error: "Course not found" });
        }

        if (course.instructorId.toString() !== req.user.userId) {
          return res.status(403).json({ error: "Forbidden: You can only add lessons to your own courses" });
        }

        const newLesson = {
          _id: new ObjectId(),
          title,
          videoUrl: videoUrl || '',
          createdAt: new Date(),
        };

        await courses.updateOne(
          { _id: new ObjectId(courseId) },
          { $push: { lessons: newLesson } }
        );

        res.status(201).json({ message: "Lesson added successfully", lesson: newLesson });
      } catch (err) {
        console.error("Add Lesson Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },


     /**
     * @desc    Get all courses by an instructor with enrollment counts
     * @route   GET /api/courses/my-courses
     * @access  Private (Instructor only)
     */
    getInstructorCourses: async (req, res) => {
      try {
        const instructorId = new ObjectId(req.user.userId);
        const coursesWithEnrollment = await courses.aggregate([
          { $match: { instructorId: instructorId } },
          { $lookup: { from: 'users', localField: '_id', foreignField: 'enrolledCourses', as: 'enrolledStudents' }},
          { $addFields: { enrollmentCount: { $size: '$enrolledStudents' } }},
          { $project: { enrolledStudents: 0 }}
        ]).toArray();
        res.status(200).json(coursesWithEnrollment);
      } catch (err) {
        console.error("Get Instructor Courses Error:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    },

    /**
     * @desc    Delete a course
     * @route   DELETE /api/courses/:id
     * @access  Private (Instructor only)
     */
    deleteCourse: async (req, res) => {
        try {
            const courseId = req.params.id;
            if (!ObjectId.isValid(courseId)) {
                return res.status(400).json({ error: "Invalid course ID format" });
            }

            const course = await courses.findOne({ _id: new ObjectId(courseId) });

            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            // Check if the logged-in user is the instructor of this course
            if (course.instructorId.toString() !== req.user.userId) {
                return res.status(403).json({ error: "Forbidden: You can only delete your own courses" });
            }

            await courses.deleteOne({ _id: new ObjectId(courseId) });

            await redisClient.del(CACHE_KEY_COURSES);
            console.log('Course cache invalidated.');
            
            res.status(200).json({ message: 'Course deleted successfully' });

        } catch (err) {
            console.error("Delete Course Error:", err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
  };
};
