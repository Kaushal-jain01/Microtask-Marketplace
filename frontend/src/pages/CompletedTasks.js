import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config/api';

export default function CompletedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Completion states
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [completionDetails, setCompletionDetails] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Comments states
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/?type=completed`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching Completed tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // COMPLETE TASK
  // =========================
  const handleCompleteTask = async (taskId) => {
    if (!proofImage || !completionDetails.trim()) {
      alert('Please provide proof image and completion details');
      return;
    }

    const formData = new FormData();
    formData.append('proof_image', proofImage);
    formData.append('completion_details', completionDetails);

    try {
      setSubmitting(true);
      await axios.patch(
        `${API_BASE}/tasks/${taskId}/complete/`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert('✅ Task completed successfully');
      setActiveTaskId(null);
      setCompletionDetails('');
      setProofImage(null);
      fetchCompletedTasks();
    } catch (err) {
      alert('❌ Failed to complete task');
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // COMMENTS
  // =========================
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

  // =========================
  // UI
  // =========================
  return (
    <div className="p-3">
      <h4>Completed Tasks</h4>

      {loading ? (
        <div className="d-flex justify-content-center mt-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : tasks.length === 0 ? (
        <p>No Completed tasks yet.</p>
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

              {/* COMPLETE BUTTON */}
              {/* <button
                className="btn btn-sm btn-success"
                onClick={() => setActiveTaskId(task.id)}
              >
                Complete Task
              </button> */}

              {/* COMPLETE FORM */}
              {activeTaskId === task.id && (
                <div className="mt-3 border-top pt-3">
                  <div className="mb-2">
                    <label className="form-label">Completion Details</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={completionDetails}
                      onChange={(e) => setCompletionDetails(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label">Proof Image</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setProofImage(e.target.files[0])}
                    />
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    disabled={submitting}
                    onClick={() => handleCompleteTask(task.id)}
                  >
                    {submitting ? 'Submitting...' : 'Submit Completion'}
                  </button>
                </div>
              )}

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
