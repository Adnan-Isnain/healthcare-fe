import { createBrowserRouter, RouteObject, RouterProvider, Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { authRoutes } from './auth';
import { homeRoutes } from './home';

// Create a root layout component that includes AuthProvider
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout><Outlet /></RootLayout>,
    children: [
      ...authRoutes,
      ...homeRoutes
    ]
  }
];

export default function AppRoutes() {
  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}