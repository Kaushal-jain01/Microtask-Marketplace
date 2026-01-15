import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { PlusCircle, CheckCircle, Shield, User } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE = 'https://microtasks-api.onrender.com/api'; // change to your API

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasksClaimed: 0,
    tasksCompleted: 0,
    totalEarnings: 0,
  });

  // Fetch Open Tasks
  useEffect(() => {
    fetchOpenTasks();
    fetchUserStats();
  }, []);

  const fetchOpenTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/?status=open`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to fetch stats; replace with Redis/DB API
  const fetchUserStats = async () => {
    try {
      // Replace with actual API
      const res = await axios.get(`${API_BASE}/users/${user.id}/metrics`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleClaim = async (taskId) => {
    try {
      await axios.post(`${API_BASE}/tasks/${taskId}/claim/`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Task claimed successfully!');
      fetchOpenTasks(); // refresh list
      fetchUserStats(); // refresh stats
    } catch (err) {
      console.error('Error claiming task:', err);
      alert('Failed to claim task.');
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Sidebar */}
        <div className="col-2 bg-light p-3 d-flex flex-column">
          <h5 className="mb-4">Dashboard</h5>
          <Link to="/dashboard" className="mb-2">Open Tasks</Link>
          <Link to="/dashboard/posted" className="mb-2">Posted Tasks</Link>
          <Link to="/dashboard/claimed" className="mb-2">Claimed Tasks</Link>
          <Link to="/dashboard/history" className="mb-2">History</Link>
          <button className="btn btn-outline-danger mt-auto" onClick={logout}>Logout</button>
        </div>

        {/* Open Tasks list */}
        <div className="col-7 p-3 overflow-auto" style={{ maxHeight: '100vh' }}>
          <h4>Open Tasks</h4>
          {loading ? (
            <div className="d-flex justify-content-center mt-5">
              <div className="spinner-border" role="status" />
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{task.title}</h5>
                  <p className="card-text">{task.description}</p>
                  <p className="card-text">
                    <small className="text-muted">Price: ₹{task.price} | Duration: {task.duration_minutes} mins</small>
                  </p>
                  <button className="btn btn-primary" onClick={() => handleClaim(task.id)}>Claim Task</button>
                </div>
              </div>
            ))
          )}
          {tasks.length === 0 && !loading && <p>No open tasks available.</p>}
        </div>

        {/* User Stats Panel */}
        <div className="col-3 bg-light p-3">
          <h5>User Stats</h5>
          <div className="card mb-2">
            <div className="card-body d-flex align-items-center">
              <User className="me-2" />
              <div>
                <p className="mb-0">Tasks Claimed</p>
                <h6>{stats.tasksClaimed}</h6>
              </div>
            </div>
          </div>

          <div className="card mb-2">
            <div className="card-body d-flex align-items-center">
              <CheckCircle className="me-2" />
              <div>
                <p className="mb-0">Tasks Completed</p>
                <h6>{stats.tasksCompleted}</h6>
              </div>
            </div>
          </div>

          <div className="card mb-2">
            <div className="card-body d-flex align-items-center">
              <Shield className="me-2" />
              <div>
                <p className="mb-0">Total Earnings</p>
                <h6>₹{stats.totalEarnings}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
