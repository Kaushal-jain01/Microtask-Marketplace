import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { PlusCircle, CheckCircle, Shield, User } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';


export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');

  useEffect(() => {
      fetchTasks();
  },[]);

  const fetchTasks = async () => {
    try {
      let endpoint = `${API_BASE}/tasks/`;

      console.log("User:",user)
      if (user.role === 'business') endpoint = `${API_BASE}/business-tasks/`;
      else if (user.role === 'worker') endpoint = `${API_BASE}/worker-tasks/`;

      const { data } = await axios.get(endpoint);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: 'bg-success text-white',
      claimed: 'bg-warning text-dark',
      completed: 'bg-info text-dark', 
      approved: 'bg-primary text-white',
      paid: 'bg-success text-white'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container">
          <div className="d-flex align-items-center">
            <Shield className="me-2" size={28} />
            <h2 className="navbar-brand mb-0 h4 fw-bold">Microtasks</h2>
          </div>
          
          <div className="d-flex align-items-center">
            <span className="navbar-text me-3">
              <User size={20} className="me-1" /> {user.username}
            </span>
            <button onClick={logout} className="btn btn-outline-light btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {/* Role Badge */}
        <div className="row mb-4">
          <div className="col-12">
            <span className={`badge fs-6 px-3 py-2 ${user.role === 'business' ? 'bg-primary' : 'bg-success'}`}>
              {user.role === 'business' ? '🏢 Business' : '👷 Worker'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs border-0 bg-white shadow-sm rounded-top">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'open' ? 'active' : ''}`}
                  onClick={() => setActiveTab('open')}
                >
                  Open Tasks
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my')}
                >
                  My Tasks
                </button>
              </li>
              {user.role === 'business' && (
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'posted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posted')}
                  >
                    Posted Tasks
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="row g-4">
          {tasks.map((task) => (
            <div key={task.id} className="col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm border-0 hover-shadow">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className={`badge ${getStatusBadge(task.status)} px-3 py-2 fs-6 fw-semibold`}>
                      {task.status.toUpperCase()}
                    </span>
                    <div className="text-end">
                      <div className="h5 fw-bold text-primary mb-0">₹{task.price}</div>
                      <small className="text-muted">Reward</small>
                    </div>
                  </div>

                  <h5 className="card-title fw-bold text-dark mb-3">{task.title}</h5>
                  <p className="card-text text-muted mb-4" style={{ height: '60px', overflow: 'hidden' }}>
                    {task.description}
                  </p>

                  <div className="d-flex gap-2">
                    {task.status === 'open' && user.role === 'worker' && (
                      <button className="btn btn-success w-100">
                        <PlusCircle size={18} className="me-1" />
                        Claim Task
                      </button>
                    )}
                    
                    {task.status === 'claimed' && user.role === 'worker' && (
                      <button className="btn btn-primary w-100">
                        <CheckCircle size={18} className="me-1" />
                        Upload Proof
                      </button>
                    )}

                    {task.status === 'completed' && user.role === 'business' && (
                      <button className="btn btn-outline-primary w-100">
                        Review & Approve
                      </button>
                    )}

                    {task.status === 'approved' && (
                      <button className="btn btn-success w-100">
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="col-12 text-center py-5">
              <Shield size={64} className="text-muted mb-4 opacity-50" />
              <h3 className="fw-bold text-muted mb-3">No tasks found</h3>
              <p className="text-muted mb-4">Check back later for new opportunities</p>
              
            </div>
          )}

          <div className="col-12 text-center py-5">
          {user.role === 'business' && (
                <button className="btn btn-primary btn-lg">
                  <PlusCircle size={20} className="me-2" />
                  Post New Task
                </button>
              )}
          </div>

        </div>
      </div>
    </div>
  );
}
