const Task = require('../models/Task');
const { AppError, asyncHandler } = require('../utils/errorHandler');

/**
 * @route   POST /api/v1/tasks
 * @desc    Create a new task
 * @access  Private
 */
const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, status } = req.body;
  const createdBy = req.user.id;

  const task = await Task.create(title, description, status, createdBy);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      task
    }
  });
});

/**
 * @route   GET /api/v1/tasks
 * @desc    Get all tasks (filtered by role)
 * @access  Private
 */
const getAllTasks = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Admins can see all tasks, users can only see their own
  const tasks = await Task.findAll(userId, userRole);

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: {
      tasks
    }
  });
});

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
const getTaskById = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Check authorization: users can only view their own tasks, admins can view all
  if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
    return next(new AppError('Not authorized to view this task', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      task
    }
  });
});

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
const updateTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;
  const { title, description, status } = req.body;

  // Check if task exists
  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Check authorization: users can only update their own tasks, admins can update all
  if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
    return next(new AppError('Not authorized to update this task', 403));
  }

  // Update task
  const result = await Task.update(
    taskId,
    title || task.title,
    description !== undefined ? description : task.description,
    status || task.status
  );

  if (result.changes === 0) {
    return next(new AppError('Failed to update task', 500));
  }

  // Fetch updated task
  const updatedTask = await Task.findById(taskId);

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: {
      task: updatedTask
    }
  });
});

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
const deleteTask = asyncHandler(async (req, res, next) => {
  const taskId = req.params.id;

  // Check if task exists
  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError('Task not found', 404));
  }

  // Check authorization: users can only delete their own tasks, admins can delete all
  if (req.user.role !== 'admin' && task.created_by !== req.user.id) {
    return next(new AppError('Not authorized to delete this task', 403));
  }

  // Delete task
  const result = await Task.delete(taskId);

  if (result.changes === 0) {
    return next(new AppError('Failed to delete task', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: null
  });
});

/**
 * @route   GET /api/v1/tasks/stats/summary
 * @desc    Get task statistics
 * @access  Private
 */
const getTaskStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  const tasks = await Task.findAll(userId, userRole);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  res.status(200).json({
    success: true,
    data: {
      stats
    }
  });
});

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
};
