const { db } = require('../config/database');

class Task {
  // Create a new task
  static async create(title, description, status, createdBy) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO tasks (title, description, status, created_by) VALUES (?, ?, ?, ?)';
      
      db.run(query, [title, description, status || 'pending', createdBy], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, title, description, status: status || 'pending', created_by: createdBy });
        }
      });
    });
  }

  // Get all tasks (with optional filtering)
  static async findAll(userId = null, role = 'user') {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT t.*, u.email as creator_email 
        FROM tasks t 
        LEFT JOIN users u ON t.created_by = u.id
      `;
      
      const params = [];
      
      // Regular users can only see their own tasks
      if (role === 'user' && userId) {
        query += ' WHERE t.created_by = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY t.created_at DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Find task by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.*, u.email as creator_email 
        FROM tasks t 
        LEFT JOIN users u ON t.created_by = u.id 
        WHERE t.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Update task
  static async update(id, title, description, status) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE tasks 
        SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db.run(query, [title, description, status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Delete task
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM tasks WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Get tasks count by user
  static async countByUser(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM tasks WHERE created_by = ?';
      
      db.get(query, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }
}

module.exports = Task;
