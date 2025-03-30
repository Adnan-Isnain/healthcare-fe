# Healthcare Management System - Frontend

A modern, responsive healthcare management system built with React, TypeScript, and Ant Design.

## Features

- 🔐 Secure authentication system
- 👥 Patient management
- 💊 Treatment and medication tracking
- 📊 Dashboard with real-time statistics
- 👩‍⚕️ User management with role-based access
- 📱 Responsive design for all devices

## Prerequisites

- Node.js (v14.x or higher)
- npm or Yarn package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Adnan-Isnain/healthcare-fe.git
cd healthcare-fe
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory with the following content:

```
VITE_API_URL=http://localhost:5000/api
# Replace with your actual backend API URL
```

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

This will start the development server, usually at http://localhost:3000.

### Production Build

```bash
npm run build
# or
yarn build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components for each route
├── context/        # React context providers
├── services/       # API and other services
├── types/          # TypeScript interfaces
├── routes/         # Route definitions
└── utils/          # Utility functions
```

## Backend Integration

This frontend is designed to work with the Healthcare Management System backend API. Make sure your backend server is running and the `VITE_API_URL` environment variable is correctly set.

## Authentication

The application uses JWT-based authentication. Tokens are stored securely and automatically included in API requests.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Adnan Isnain - [GitHub Profile](https://github.com/Adnan-Isnain)

Project Link: [https://github.com/Adnan-Isnain/healthcare-fe](https://github.com/Adnan-Isnain/healthcare-fe)
