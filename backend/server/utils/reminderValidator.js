import { check } from 'express-validator';

export const createReminderValidators = [
  check('userId').notEmpty().withMessage('UserID is required').isMongoId().withMessage('Invalid user ID'),

  check('medicine')
    .notEmpty().withMessage('Medicine name is required')
    .isLength({ max: 50 }).withMessage('Medicine name too long')
    .trim()
    .escape(),

  check('dosage')
    .notEmpty().withMessage('Dosage is required')
    .isLength({ max: 20 }).withMessage('Dosage too long')
    .trim()
    .escape(),

  check('time')
    .notEmpty().withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Time must be HH:MM')
    .trim(),

  check('frequency')
    .notEmpty().withMessage('Frequency is required')
    .isIn(['Daily', 'Weekly', 'Monthly']).withMessage('Frequency must be Daily, Weekly, or Monthly')
    .trim(),

  check('startDate').optional().isISO8601().withMessage('Invalid date'),

  check('notes')
    .optional()
    .isLength({ max: 100 }).withMessage('Notes too long')
    .trim()
    .escape()
];

