const { db } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(email, password, role = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
      
      db.run(query, [email, hashedPassword, role], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, email, role });
        }
      });
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, email, role, created_at FROM users WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all users (admin only)
  static async findAll() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, email, role, created_at FROM users';
      
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user role (admin only)
  static async updateRole(id, role) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      db.run(query, [role, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Delete user
  static async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }
}

module.exports = User;
