import React from 'react';
import { RouteObject } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/Layout";
import Home from "../pages/home";
import Users from "../pages/users";
import Patients from '../pages/patients';
import Treatments from '../pages/treatments';
import NewTreatment from '../pages/treatments/new';
import NewMedication from '../pages/medications/new';

export const homeRoutes: RouteObject[] = [{
    path: "/",
    element: <ProtectedRoute />,
    children: [
        {
            element: <AppLayout />,
            children: [
                {
                    index: true,
                    element: <Home />
                },
                {
                    path: "patients",
                    element: <Patients />
                },
                {
                    path: "treatments",
                    element: <Treatments />
                },
                {
                    path: "treatments/new",
                    element: <NewTreatment />
                },
                {
                    path: "medications/new",
                    element: <NewMedication />
                },
                {
                    path: "users",
                    element: <Users />
                }
            ]
        }
    ]
}]