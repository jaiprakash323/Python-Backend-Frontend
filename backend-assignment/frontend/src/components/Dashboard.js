import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../services/api';
import TaskModal from './TaskModal';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAllTasks();
      setTasks(response.data.data.tasks);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await taskAPI.getTaskStats();
      setStats(response.data.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskAPI.deleteTask(taskId);
      setSuccess('Task deleted successfully');
      fetchTasks();
      fetchStats();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTaskSubmit = async () => {
    setIsModalOpen(false);
    setSuccess(editingTask ? 'Task updated successfully' : 'Task created successfully');
    fetchTasks();
    fetchStats();
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'in_progress':
        return 'badge-warning';
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Task Management Dashboard</h1>
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            <span className={`user-role ${isAdmin ? 'role-admin' : 'role-user'}`}>
              {user?.role}
            </span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.in_progress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      )}

      <div className="tasks-section">
        <div className="section-header">
          <h2>Your Tasks</h2>
          <button onClick={handleCreateTask} className="btn-primary">
            + Create New Task
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create your first task!</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="task-description">{task.description || 'No description'}</p>
                <div className="task-meta">
                  <span className="task-creator">By: {task.creator_email}</span>
                  <span className="task-date">
                    {new Date(task.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="task-actions">
                  <button 
                    onClick={() => handleEditTask(task)} 
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(task.id)} 
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleTaskSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;
