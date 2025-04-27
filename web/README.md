# Library Management System (LMS)

A modern, full-stack library management system built with React, Node.js, and MongoDB.

## Features

### Core Features
- User authentication and authorization
- Book management (CRUD operations)
- Loan management
- User management
- Reports and analytics
- System settings

### Security Features
- JWT-based authentication
- Role-based access control
- CSRF protection
- Rate limiting
- Input sanitization
- Audit logging

### Performance Features
- Client-side caching
- Request debouncing
- Lazy loading
- Optimized bundle size

## Technical Stack

### Frontend
- React with TypeScript
- React Query for data fetching
- Zustand for state management
- React Hook Form for form handling
- Zod for validation
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Docker for containerization

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Docker and Docker Compose
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/library-management-system.git
cd library-management-system
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../web
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/library
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development servers:
```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd ../web
npm run dev
```

Or use Docker Compose:
```bash
docker-compose up
```

## Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../web
npm test
```

### Test Coverage
```bash
# Backend coverage
cd backend
npm run test:coverage

# Frontend coverage
cd ../web
npm run test:coverage
```

## Deployment

### Production Build
```bash
# Backend
cd backend
npm run build

# Frontend
cd ../web
npm run build
```

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## API Documentation

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/refresh` - Refresh access token
- POST `/api/auth/logout` - User logout

### Books
- GET `/api/books` - Get all books
- POST `/api/books` - Create a new book
- GET `/api/books/:id` - Get a specific book
- PUT `/api/books/:id` - Update a book
- DELETE `/api/books/:id` - Delete a book

### Loans
- GET `/api/loans` - Get all loans
- POST `/api/loans` - Create a new loan
- GET `/api/loans/:id` - Get a specific loan
- PUT `/api/loans/:id` - Update a loan
- DELETE `/api/loans/:id` - Delete a loan

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@library-management-system.com or open an issue in the repository. 