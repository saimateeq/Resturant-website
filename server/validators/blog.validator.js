import { body } from 'express-validator';

export const blogPostValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['recipe', 'cooking-tips', 'news', 'event']).withMessage('Invalid category'),
];
