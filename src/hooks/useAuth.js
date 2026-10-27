import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TeacherLogin, TeacherLogout } from "@/services/authService";

export const useAuth = () => {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("teacher_user") || "null");
    } catch {
        localStorage.removeItem("teacher_user");
    }

    return { user };
};

export const useLogin = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: TeacherLogin,
        onSuccess: (data) => {
            localStorage.setItem("teacher_token", data.token);
            localStorage.setItem("teacher_user", JSON.stringify(data.teacher));
            navigate("/dashboard", { replace: true });
        },
        onError: (err) => {
            const status = err.response?.status;
            const message = err.response?.data?.message;

            if (status === 403) {
                toast.error(message || "Account not yet activated.");
            } else if (status === 401) {
                toast.error("Invalid username or password.");
            } else {
                toast.error(message || "Login failed. Please try again.");
            }
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: TeacherLogout,
        onSettled: () => {
            localStorage.removeItem("teacher_token");
            localStorage.removeItem("teacher_user");
            queryClient.clear();
            navigate("/", { replace: true });
        },
    });
};
