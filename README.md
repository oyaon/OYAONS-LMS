# Smart Library Management System (LMS)

A modern, scalable Library Management System with web and mobile interfaces, built with Node.js, Express, MongoDB, React, and React Native.

## 🚀 Features

- 📚 Book management with real-time availability
- 👥 User management (Members, Librarians, Admins)
- 💰 Automated fine calculation and online payments
- 📱 Cross-platform mobile app
- 🎮 Gamification features
- ☁️ Digital library support
- 🔄 Real-time updates
- 🌐 Multi-language support

## 🏗️ Architecture

```
smart-lms/
├── backend/           # Express.js + MongoDB backend
├── web/              # React web application
├── docker/           # Docker configuration
└── docs/            # Documentation
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Web**: React, TailwindCSS, React Query
- **DevOps**: Docker, GitHub Actions
- **Authentication**: JWT, Passport.js
- **Real-time**: Socket.io, Server-Sent Events
- **Storage**: AWS S3/Firebase Storage
- **Payments**: Bkash, Nagad integration

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Docker
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-lms.git
cd smart-lms
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Web
cd ../web
npm install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Web
cp web/.env.example web/.env
```

4. Start the development environment:
```bash
# Using Docker
docker-compose up --build

# Or manually
# Backend
cd backend
npm run dev

# Web
cd web
npm start
```

## 📚 Documentation

Detailed documentation can be found in the `docs/` directory.

Currently, it includes:
- [Environment Variables](docs/environment-variables.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors
- Libraries and frameworks used
- Inspiration and references 