# Smart Library Management System (LMS)

A modern, scalable Library Management System built with Node.js, Express, MongoDB, and React.

## 🚀 Features

- 📚 **Book Management:** Cataloging, tracking, searching, and real-time availability updates (via Socket.IO).
- 👥 **User Management:** Roles for Members, Librarians, Admins with distinct permissions.
- 💰 **Fines & Payments:** Automated fine calculation for overdue books and online payment integration (Bkash, Nagad).
- 📊 **Reporting:** Generate reports on library usage, popular books, fines collected, etc. (Planned)
- 🎮 **Gamification:** Features to encourage reading and engagement. (Planned)
- ☁️ **Digital Library:** Support for managing and accessing digital resources. (Planned)
- 🔄 **Real-time Updates:** Live updates for book status, notifications, etc., using Socket.IO.
- 🌐 **Multi-language Support:** Frontend designed for internationalization. (Planned)

## 🏗️ Project Structure

```
smart-lms/
├── backend/           # Node.js/Express API (Handles data, logic, real-time events)
├── web/              # React SPA (User Interface using Vite, TailwindCSS, React Query)
├── scripts/          # Utility scripts (e.g., environment management)
├── docker/           # Docker configuration for containerization
└── docs/            # Project documentation
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB (with Mongoose), Socket.io
- **Frontend**: React, TypeScript, Vite, TailwindCSS, React Query
- **DevOps**: Docker, GitHub Actions (CI/CD)
- **Authentication**: JWT, Passport.js
- **Real-time**: Socket.io
- **Storage**: (Configurable) AWS S3/Firebase Storage
- **Payments**: Bkash, Nagad integration
- **Testing**: Jest

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Docker (Recommended)
- Git

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/oyaon/OYAONS-LMS.git
    cd OYAONS-LMS
    ```

2.  Install dependencies for both backend and web workspaces:
    ```bash
    npm install # Installs for root, backend, and web
    # Or if you prefer installing separately:
    # npm run setup
    ```

3.  Set up environment variables:
    *   Copy the example environment files:
        ```bash
        # Backend
        cp backend/.env.example backend/.env.development
        # Web
        cp web/.env.example web/.env.development
        ```
    *   **Important:** Edit the `.env.development` files in both `backend/` and `web/` to add your specific configurations (database URIs, JWT secrets, API keys, etc.). Refer to `docs/environment-variables.md` for details on required variables.
    *   **Tip:** Use the environment manager script for easier setup for different environments (dev, prod, test):
        ```bash
        node scripts/env-manager.js # Interactive menu
        # or
        npm run env:dev
        ```
    *   Validate your environment setup:
        ```bash
        node scripts/validate-env.js development
        ```

4.  Start the development environment:
    *   **Using Docker (Recommended):**
        ```bash
        docker-compose up --build
        ```
    *   **Manually:**
        *   Start Backend: `npm run start:backend`
        *   Start Web: `npm run start:web` (in a separate terminal)

## ✅ Testing

Run tests for both backend and frontend:

```bash
npm test
```

(Note: Ensure test environment variables are set up, e.g., using `npm run env:test` first if needed).

## 🐳 Deployment

The application is configured for deployment using Docker. See `docker-compose.yml` and the `Dockerfile` in `web/` and `backend/`.

(Detailed deployment guide will be available in `docs/deployment.md`)

## 📚 Documentation

Detailed documentation can be found in the `docs/` directory.

- [Environment Variables](docs/environment-variables.md)
- (Planned) API Documentation (`docs/api.md`)
- (Planned) Database Schema (`docs/database.md`)
- (Planned) Deployment Guide (`docs/deployment.md`)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- OYAON (Update with actual author/team name)

## 🙏 Acknowledgments

- Thanks to all contributors
- Libraries and frameworks used
- Inspiration and references 