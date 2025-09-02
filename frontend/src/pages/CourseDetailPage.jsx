import React, { useState, useEffect } from 'react';
import { courseService, enrollmentService } from '../services/api';

function AddLessonForm({ courseId, onLessonAdded }) {
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    if (videoFile) {
      formData.append('video', videoFile);
    }

    try {
      const { lesson } = await courseService.addLesson(courseId, formData);
      onLessonAdded(lesson);
      setTitle('');
      setVideoFile(null);
      document.getElementById('video-upload').value = null;
    } catch (err) {
      setError(err.message || "Failed to add lesson.");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="mt-10 p-6 border rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold mb-4">Add a New Lesson</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Lesson Title" className="w-full p-2 border rounded-md" required />
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Lesson Video (optional)</label>
          <input 
            id="video-upload"
            type="file" 
            accept="video/*"
            onChange={handleFileChange} 
            className="w-full p-2 mt-1 border rounded-md" 
          />
        </div>

        <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 disabled:bg-green-300">
          {loading ? 'Uploading...' : 'Add Lesson'}
        </button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </form>
    </div>
  );
}

function CommentsSection({ courseId, user, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setError('');
    try {
      const { comment } = await courseService.addComment(courseId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      setError(err.message || "Failed to post comment.");
    }
  };

  return (
    <div className="mt-10 pt-6 border-t">
      <h3 className="text-2xl font-semibold mb-4">Comments ({comments.length})</h3>
      {user ? (
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-md"
            rows="3"
          />
          <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-600">
            Post Comment
          </button>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </form>
      ) : (
        <p className="text-gray-600 mb-4">You must be logged in to post a comment.</p>
      )}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment._id} className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold">{comment.authorName}</p>
            <p className="text-gray-700">{comment.text}</p>
            <p className="text-xs text-gray-500 mt-1">{new Date(comment.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseDetailPage({ courseId, user, navigate }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState([]);
  const [success, setSuccess] = useState('');

  const hasUserLiked = user && likes.includes(user._id);

  const isInstructorOwner = user && course && user._id === course.instructorId.toString();

  useEffect(() => {
    if (courseId) {
      setLoading(true);
      setError('');
      setSuccess('');
      courseService.getById(courseId)
        .then(data => {
          setCourse(data);
          setLikes(data.likes || []);
        })
        .catch(err => setError("Failed to load course details."))
        .finally(() => setLoading(false));
    }
  }, [courseId]);

  const handleLessonAdded = (newLesson) => {
    setCourse(prevCourse => ({
      ...prevCourse,
      lessons: [...prevCourse.lessons, newLesson]
    }));
  };

  const handleLike = async () => {
    if (!user) {
      alert("You must be logged in to like a course.");
      return;
    }
    try {
      const newLikes = hasUserLiked
        ? likes.filter(id => id !== user._id)
        : [...likes, user._id];
      setLikes(newLikes);

      const { likes: updatedLikes } = await courseService.like(courseId);
      setLikes(updatedLikes);
    } catch (err) {
      console.error("Failed to update like status", err);
      setLikes(course.likes || []); 
    }
  };

  const handleEnroll = async () => {
    setError('');
    setSuccess('');
    try {
      await enrollmentService.enroll(courseId);
      setSuccess("Successfully enrolled! You can now find this course in 'My Courses'.");
    } catch (err) {
      setError(err.message || "Enrollment failed. You might already be enrolled.");
    }
  };

  if (loading) return <div className="text-center text-xl">Loading Course...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!course) return <div className="text-center">Course not found.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-4">{course.title}</h2>
      <p className="text-lg text-gray-700 mb-6">{course.description}</p>
      <p className="text-md text-gray-500 mb-6">Category: <span className="font-semibold">{course.category}</span></p>
      <button onClick={handleLike} className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${hasUserLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={hasUserLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
          <span>{likes.length}</span>
        </button>
      
      {user?.role === 'student' && (
        <div className="mt-6">
          <button 
            onClick={handleEnroll} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Enroll Now
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-500 mt-2">{success}</p>}
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Lessons</h3>
        <ul className="list-disc list-inside space-y-2">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson) => <li key={lesson._id} className="text-gray-800">{lesson.title}</li>)
          ) : (
            <p>No lessons have been added to this course yet.</p>
          )}
        </ul>
      </div>

      {isInstructorOwner && <AddLessonForm courseId={course._id} onLessonAdded={handleLessonAdded} />}

      <CommentsSection courseId={course._id} user={user} initialComments={course.comments} />

      <button onClick={() => navigate('home')} className="mt-8 text-blue-500 hover:underline">
        ← Back to All Courses
      </button>
    </div>
  );
}

export default CourseDetailPage;
