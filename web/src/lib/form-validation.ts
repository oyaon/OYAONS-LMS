import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  copies: z.number().min(1, 'At least one copy is required'),
  publishedYear: z.number().min(1800, 'Invalid year').max(new Date().getFullYear(), 'Invalid year'),
});

export const loanSchema = z.object({
  bookId: z.string().min(1, 'Book is required'),
  userId: z.string().min(1, 'User is required'),
  dueDate: z.date().min(new Date(), 'Due date must be in the future'),
});

export const reportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  type: z.enum(['line', 'bar', 'pie', 'table']),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
  })),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    time: z.string(),
  }).optional(),
}); 