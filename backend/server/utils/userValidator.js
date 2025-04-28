import { check } from 'express-validator';

export const registerValidator = [
    check('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 20 }).withMessage('Username too long')
        .trim()
        .escape(),

    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),

    check('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .trim(),

    check('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role')
        .trim(),

];

export const loginValidator = [
    check('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email address')
        .normalizeEmail(),

    check('password')
        .notEmpty().withMessage('Password is required')
        .trim(),
];