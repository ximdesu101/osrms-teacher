import { useEffect, useState, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { TeacherMe } from "@/services/authService";

const AuthProtector = () => {
    const [status, setStatus] = useState("checking");
    const validatingRef = useRef(false);

    const validateAuth = async () => {
        if (validatingRef.current) return;
        validatingRef.current = true;

        const token = localStorage.getItem("teacher_token");
        if (!token) {
            setStatus("invalid");
            validatingRef.current = false;
            return;
        }

        try {
            await TeacherMe();
            setStatus("valid");
        } catch {
            localStorage.removeItem("teacher_token");
            localStorage.removeItem("teacher_user");
            setStatus("invalid");
        } finally {
            validatingRef.current = false;
        }
    };

    useEffect(() => {
        validateAuth();

        const handlePageShow = (event) => {
            if (event.persisted) validateAuth();
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    if (status === "checking") return null;
    if (status === "invalid") return <Navigate to="/" replace />;

    return <Outlet />;
};

export default AuthProtector;
