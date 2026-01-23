import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_BASE from '../config/api';
import { PlusCircle, CheckCircle, Shield, User } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({
    labels: ['Open', 'Claimed', 'Completed'],
    datasets: [],
  });

  useEffect(() => {
    if (!user) return;
    if (user.role === 'worker') {
      fetchOpenTasks();
      fetchWorkerStats();
    } else if (user.role === 'business') {
      fetchBusinessStats();
    }
  }, [user]);

  // --------------------
  // Worker Functions
  // --------------------
  const fetchOpenTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/?status=open`);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkerStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard/worker/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(res.data || {});
    } catch (err) {
      console.error('Error fetching worker stats:', err);
    }
  };

  const handleClaim = async (taskId) => {
    try {
      await axios.patch(`${API_BASE}/tasks/${taskId}/claim/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Task claimed successfully!');
      fetchOpenTasks();
      fetchWorkerStats();
    } catch (err) {
      console.error('Error claiming task:', err);
      alert('Failed to claim task.');
    }
  };

  // --------------------
  // Business Functions
  // --------------------
  const fetchBusinessStats = async () => {
  try {
    const res = await axios.get(`${API_BASE}/dashboard/business/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    const data = res.data || {};
    setStats(data);

    console.log(data)

    // Compute chart data from recent_tasks if available
    const openCount = data.open;
    const claimedCount = data.claimed;
    const postedCount = data.posted;
    const completedCount = data.paid;
    
    console.log(postedCount)

    setChartData({
      labels: ['Open', 'Claimed', 'Completed'],
      datasets: [
        {
          label: 'Tasks',
          data: [openCount, claimedCount, completedCount],
          backgroundColor: ['#0d6efd', '#ffc107', '#198754'],
          borderRadius: 6,           // Rounded bars
          barPercentage: 0.6,        // Thinner bars
          categoryPercentage: 0.5,
        },
      ],
    });

  } catch (err) {
    console.error('Error fetching business stats:', err);
  }
};

  const handleCreateTask = () => {
    navigate('/tasks/create');
  };

  const handleEditTask = (taskId) => {
    navigate(`/tasks/edit/${taskId}`);
  };

  const handleRemindWorker = (taskId) => {
    alert(`Reminder sent for task ${taskId}`);
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        {/* Main Panel */}
        <div className="col-8 p-3 overflow-auto" style={{ maxHeight: '100vh' }}>
          {user?.role === 'worker' ? (
            <>
              <h4>Open Tasks</h4>
              {loading ? (
                <div className="d-flex justify-content-center mt-5">
                  <div className="spinner-border" role="status" />
                </div>
              ) : (
                tasks.length > 0 ? (
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
                ) : <p>No open tasks available.</p>
              )}
            </>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Business Dashboard</h4>
                <button className="btn btn-success" onClick={handleCreateTask}>
                  <PlusCircle className="me-2" /> Create Task
                </button>
              </div>

              {/* Recently Posted Tasks */}
              <h5>Recently Posted Tasks</h5>
              {(stats.recent_tasks || []).length > 0 ? (
                (stats.recent_tasks || []).map(task => (
                  <div key={task.id} className="card mb-2">
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6>{task.title}</h6>
                        <small className="text-muted">{task.status} | ₹{task.price}</small>
                      </div>
                      <div>
                        <button className="btn btn-sm btn-primary me-1" onClick={() => handleEditTask(task.id)}>Edit</button>
                        <button className="btn btn-sm btn-warning" onClick={() => handleRemindWorker(task.id)}>Remind</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No recent tasks.</p>
              )}

              {/* Task Status Chart */}
              <div className="mt-4">
                <h5>Task Status Overview</h5>
                {chartData.datasets && chartData.datasets.length > 0 ? (
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: '#333',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          titleFont: { weight: 'bold' },
                        },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 14, weight: 'bold' } },
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: '#e0e0e0',
                            borderDash: [5, 5],
                          },
                          ticks: {
                            stepSize: 1,
                            font: { size: 14 },
                          },
                        },
                      },
                    }}
                  />

                ) : <p>Loading chart...</p>}
              </div>
            </>
          )}
        </div>

        {/* Stats Panel */}
        <div className="col-4 bg-light p-3">
          <h5>Stats</h5>
          {user?.role === 'worker' ? (
            <>
              <div className="card mb-2">
                <div className="card-body d-flex align-items-center">
                  <User className="me-2" />
                  <div>
                    <p className="mb-0">Tasks Claimed</p>
                    <h6>{stats.claimed || 0}</h6>
                  </div>
                </div>
              </div>

              <div className="card mb-2">
                <div className="card-body d-flex align-items-center">
                  <CheckCircle className="me-2" />
                  <div>
                    <p className="mb-0">Tasks Completed</p>
                    <h6>{stats.completed || 0}</h6>
                  </div>
                </div>
              </div>

              <div className="card mb-2">
                <div className="card-body d-flex align-items-center">
                  <Shield className="me-2" />
                  <div>
                    <p className="mb-0">Total Earnings</p>
                    <h6>₹{stats.total_earnings || 0}</h6>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Business Stats */}
              <div className="card mb-2">
                <div className="card-body d-flex align-items-center">
                  <User className="me-2" />
                  <div>
                    <p className="mb-0">Tasks Posted</p>
                    <h6>{stats.posted || 0}</h6>
                  </div>
                </div>
              </div>

              <div className="card mb-2">
                <div className="card-body d-flex align-items-center">
                  <CheckCircle className="me-2" />
                  <div>
                    <p className="mb-0">Active Tasks</p>
                    <h6>{stats.claimed || 0}</h6>
                  </div>
                </div>
              </div>

              <div className="card mb-2">
                <div className="card-body d-flex align-items-center">
                  <Shield className="me-2" />
                  <div>
                    <p className="mb-0">Total Paid</p>
                    <h6>₹{stats.total_paid_amount || 0}</h6>
                  </div>
                </div>
              </div>

              {stats.top_worker && (
                <div className="card mb-2">
                  <div className="card-body d-flex align-items-center">
                    <User className="me-2" />
                    <div>
                      <p className="mb-0">Top Worker</p>
                      <h6>{stats.top_worker.name} ({stats.top_worker.completed_tasks} tasks)</h6>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
