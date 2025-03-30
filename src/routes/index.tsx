import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom';
import { authRoutes } from './auth';
import { homeRoutes } from './home';

const routes: RouteObject[] = [
  {
    path: "/",
    children: [
      ...authRoutes,
      ...homeRoutes
    ]
  }
];

export default function AppRoutes() {
    const router = createBrowserRouter(routes);
    return (
        <RouterProvider router={router} />
    )

}