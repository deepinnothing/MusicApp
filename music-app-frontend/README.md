# Music App Frontend

A modern React-based music streaming application frontend with user authentication and library management.

## Features

- 🎵 Browse and search music albums
- 👤 User authentication (login/register)
- 📚 Personal music library management
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design (desktop focused)
- 🔐 Role-based access control (admin/user)
- 🎧 Add/remove albums and tracks to personal library

## Tech Stack

- **React** 18.2.0
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Icons** for iconography
- **React Hook Form** for form handling
- **React Hot Toast** for notifications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend repository)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd music-app-frontend
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` file and set your backend API URL:

```bash
REACT_APP_API_BASE_URL=http://localhost:5064/api
```

4. Start the development server

```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── components/
│   ├── user/           # User-related components
│   └── common/         # Shared components
├── pages/              # Main application pages
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── config/             # Configuration files
├── layout/             # Layout components
└── utils/              # Utility functions
```

## API Integration

This frontend connects to a backend API. Make sure your backend is running and configured properly.

Default API endpoint: `http://localhost:5064/api`

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

| Variable                 | Description          | Default Value               |
| ------------------------ | -------------------- | --------------------------- |
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:5064/api` |

Example `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:5064/api
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
