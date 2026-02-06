const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': 'Role must be either user or admin'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Task creation validation schema
const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  description: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed'
    })
});

// Task update validation schema
const updateTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  description: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in_progress', 'completed')
    .messages({
      'any.only': 'Status must be one of: pending, in_progress, completed'
    })
}).min(1); // At least one field must be provided

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  createTaskSchema,
  updateTaskSchema,
  validate
};
