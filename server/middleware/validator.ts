import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check validation results and return formatted error messages
 */
export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      error: 'Validation failed. Please verify the submitted information.',
      validationErrors: errors.array().map((e: any) => ({
        field: e.path || e.param,
        message: e.msg,
      })),
    });
    return;
  }
  next();
}

/**
 * Pre-validation normalizer to handle client alias fields
 * (e.g. fullName -> name, emailAddress -> email, phoneNumber -> phone, companyName -> company)
 */
export function normalizeCommonFields(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    if (!req.body.name && req.body.fullName) req.body.name = req.body.fullName;
    if (!req.body.email && req.body.emailAddress) req.body.email = req.body.emailAddress;
    if (!req.body.phone && req.body.phoneNumber) req.body.phone = req.body.phoneNumber;
    if (!req.body.company && req.body.companyName) req.body.company = req.body.companyName;
  }
  next();
}

/**
 * Validation rules for POST /api/contact
 */
export const validateContactSubmission = [
  normalizeCommonFields,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required.')
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone or WhatsApp number is required.')
    .isLength({ min: 7, max: 25 })
    .withMessage('Please provide a valid phone number (at least 7 digits).'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Company name must not exceed 150 characters.'),
  body('serviceCategory')
    .optional()
    .trim(),
  body('plantLocation')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Plant location must not exceed 150 characters.'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Message must not exceed 3000 characters.'),
  handleValidationErrors,
];

/**
 * Validation rules for POST /api/manpower-request
 */
export const validateManpowerRequest = [
  normalizeCommonFields,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required.')
    .isLength({ max: 100 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid business email.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required.')
    .isLength({ min: 7, max: 25 })
    .withMessage('Phone number must have at least 7 digits.'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 150 }),
  body('plantLocation')
    .optional()
    .trim()
    .isLength({ max: 150 }),
  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Staff designation / role is required (e.g., Extrusion Press Operator, Die Corrector, Maintenance Technician).'),
  body('workerCount')
    .notEmpty()
    .withMessage('Number of workers requested is required.')
    .isInt({ min: 1, max: 500 })
    .withMessage('Worker count must be an integer between 1 and 500.'),
  body('skillLevel')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('shiftDetails')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Shift details must not exceed 200 characters.'),
  body('requirementUrgency')
    .optional()
    .trim(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 3000 }),
  handleValidationErrors,
];

/**
 * Validation rules for POST /api/quote-request
 */
export const validateQuoteRequest = [
  normalizeCommonFields,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required.')
    .isLength({ max: 100 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Business email is required.')
    .isEmail()
    .withMessage('Valid email address is required.')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone or WhatsApp number is required.')
    .isLength({ min: 7, max: 25 }),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 150 }),
  body('plantLocation')
    .optional()
    .trim()
    .isLength({ max: 150 }),
  body('machineryType')
    .trim()
    .notEmpty()
    .withMessage('Machinery or tooling category is required (e.g., Extrusion Press, Billet Heater, Die Tooling).'),
  body('pressTonnage')
    .optional()
    .trim(),
  body('alloyGrades')
    .optional()
    .trim(),
  body('estimatedBilletSize')
    .optional()
    .trim(),
  body('deliveryTimeline')
    .optional()
    .trim(),
  body('technicalSpecs')
    .optional()
    .trim()
    .isLength({ max: 4000 }),
  handleValidationErrors,
];

/**
 * Validation rules for POST /api/admin/login
 */
export const validateAdminLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Admin email is required.')
    .isEmail()
    .withMessage('Must be a valid email format.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  handleValidationErrors,
];
