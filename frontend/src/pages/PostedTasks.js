import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';
import { useNavigate } from 'react-router-dom';


export default function PostedTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comments state
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPostedTasks();
  }, []);

  // --------------------------
  // Fetch posted tasks
  // --------------------------
  const fetchPostedTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/?type=posted`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching posted tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // COMMENTS
  // --------------------------
  const fetchComments = async (taskId) => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${taskId}/comments/`);
      setComments(prev => ({ ...prev, [taskId]: res.data }));
    } catch (err) {
      console.error('Failed to load comments');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`${API_BASE}/tasks/${taskId}/comments/`, {
        message: newComment,
      });

      setNewComment('');
      fetchComments(taskId);
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  // --------------------------
  // UI
  // --------------------------
  return (
    <div className="p-3">
      <h4>Posted Tasks</h4>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : tasks.length === 0 ? (
        <p>No posted tasks yet.</p>
      ) : (
        tasks.map(task => (
          <div key={task.id} className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{task.title}</h5>
              <p className="card-text">{task.description}</p>
              <p className="card-text">
                <small className="text-muted">
                  Price: ₹{task.price} | Duration: {task.duration_minutes} mins
                </small>
              </p>
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={() => navigate(`/tasks/detail/${task.id}`)}
              >
                View Details
              </button>


              {/* COMMENTS */}
              <div className="mt-3">
                <button
                  className="btn btn-link p-0"
                  onClick={() => fetchComments(task.id)}
                >
                  View Comments
                </button>

                {comments[task.id] && (
                  <div className="mt-2">
                    {comments[task.id].map(c => (
                      <div
                        key={c.id}
                        className="border rounded p-2 mb-1"
                      >
                        <small className="fw-bold">
                          {c.user.username}
                        </small>
                        <div>{c.message}</div>
                      </div>
                    ))}

                    {/* Add comment */}
                    <div className="d-flex mt-2">
                      <input
                        className="form-control me-2"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleAddComment(task.id)}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
}
