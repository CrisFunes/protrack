# ProTrack - Project Management Dashboard

[![Built with Google IDX](https://img.shields.io/badge/Built%20with-Google%20IDX-4285F4?style=flat-square&logo=google)](https://idx.google.com/)
[![Node.js Version](https://img.shields.io/badge/Node.js-v20-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB Version](https://img.shields.io/badge/MongoDB-v6.0-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)

ProTrack is a comprehensive project management dashboard that integrates with popular development tools like Jira, Trello, GitHub, and Bitbucket. It provides a centralized view of your project's progress, tasks, and development activities in real-time.

## 🌟 Features

- **Unified Dashboard**: View all your project metrics in one place
- **Multiple Integrations**:
  - Jira for issue tracking
  - Trello for task management
  - GitHub for code repository management
  - Bitbucket for version control
- **Real-time Updates**: Stay current with project progress
- **Task Management**: Track and manage tasks across platforms
- **Calendar View**: Visualize deadlines and milestones
- **Customizable Reports**: Generate insights about your projects
- **Secure Authentication**: Protected routes and secure API integration

## 🚀 Quick Start with Google IDX

This project is built to run seamlessly in Google IDX, making setup and deployment incredibly simple.

1. **Open in IDX**:
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/protrack.git
   ```
   Then open the project in IDX workspace.

2. **Environment Setup**:
   IDX will automatically:
   - Install Node.js 20
   - Set up MongoDB 6.0
   - Configure the development environment
   - Install project dependencies

3. **Start the Application**:
   ```bash
   # Start the backend server
   cd server
   npm start

   # In a new terminal, start the frontend
   cd client
   npm run dev
   ```

## 🛠️ Manual Setup (Without IDX)

### Prerequisites

- Node.js 20
- MongoDB 6.0
- npm or yarn

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/protrack.git
   cd protrack
   ```

2. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the server directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/protrack
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   ```

4. **Start MongoDB**:
   ```bash
   mongod --dbpath /your/data/path
   ```

5. **Run the Application**:
   ```bash
   # Start the server (from server directory)
   npm start

   # Start the client (from client directory)
   npm run dev
   ```

## 🔧 Configuration

### Integrations Setup

1. **Jira Integration**:
   - Get your Jira API token from your Atlassian account
   - Configure in Settings → Integrations → Jira

2. **Trello Integration**:
   - Generate API key and token from Trello
   - Add credentials in Settings → Integrations → Trello

3. **GitHub Integration**:
   - Create a GitHub OAuth app
   - Configure GitHub credentials in settings

4. **Bitbucket Integration**:
   - Generate an app password from Bitbucket
   - Configure in Settings → Integrations → Bitbucket

## 📁 Project Structure

```
protrack/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Application views
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── vite.config.js    # Vite configuration
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   └── server.js         # Server entry point
└── .idx/                 # IDX configuration
    └── dev.nix           # Development environment setup
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Google IDX](https://idx.google.com/)
- Uses [Material-UI](https://mui.com/) for the interface
- Integration support from Jira, Trello, GitHub, and Bitbucket APIs

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/yourusername/protrack/issues) page
2. Create a new issue if your problem isn't already listed
3. Reach out to the maintainers

---
Made with ❤️ by [Your Name]
