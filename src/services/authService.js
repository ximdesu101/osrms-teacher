import api from "@/lib/axios";

export const TeacherLookup = async (teacherId) => {
    const response = await api.get(`/teacher/lookup/${encodeURIComponent(teacherId)}`);
    return response.data;
};

export const TeacherActivate = async (payload) => {
    const response = await api.post("/teacher/activate", payload);
    return response.data;
};

export const TeacherLogin = async (credentials) => {
    const response = await api.post("/teacher/login", credentials);
    return response.data;
};

export const TeacherMe = async () => {
    const response = await api.get("/teacher/me");
    return response.data;
};

export const TeacherLogout = async () => {
    const response = await api.post("/teacher/logout");
    return response.data;
};
