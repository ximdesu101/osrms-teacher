import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import Login from "@/pages/auth/Login";
import ActivateAccount from "@/pages/auth/ActivateAccount";

import AuthProtector from "./protector/AuthProtector";
import Sidebar from "@/layouts/sidebar/Sidebar";
import Dashboard from "@/pages/dashboard/Dashboard";
import DocumentRequests from "@/pages/document-requests/DocumentRequests";
import Notifications from "@/pages/notifications/Notifications";
import SubmissionRequests from "@/pages/submission-requests/SubmissionRequests";
import Drafts from "@/pages/drafts/Drafts";
import FileTemplates from "@/pages/file-templates/FileTemplates";
import Profile from "@/pages/profile/Profile";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <Login /> },
            { path: "activate-account", element: <ActivateAccount /> },
        ],
    },
    {
        element: <AuthProtector />,
        children: [
            {
                element: <Sidebar />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    {
                        path: "profile",
                        element: <Profile />,
                        handle: { crumb: () => "My Profile" },
                    },
                    {
                        path: "document-requests",
                        element: <DocumentRequests />,
                        handle: { crumb: () => "Document Requests" },
                    },
                    {
                        path: "submission-requests",
                        element: <SubmissionRequests />,
                        handle: { crumb: () => "Incoming Requests" },
                    },
                    {
                        path: "drafts",
                        element: <Drafts />,
                        handle: { crumb: () => "Drafts" },
                    },
                    {
                        path: "file-templates",
                        element: <FileTemplates />,
                        handle: { crumb: () => "File Templates" },
                    },
                    {
                        path: "notifications",
                        element: <Notifications />,
                        handle: { crumb: () => "Notifications" },
                    },
                ],
            }
        ],
    },
]);