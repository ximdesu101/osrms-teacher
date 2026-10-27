import api from "@/lib/axios";

export const GetTeacherNotifications = async ({ page = 1, filter = "all" } = {}) => {
    const response = await api.get("/teacher/notifications", { params: { page, filter } });
    return response.data;
};

export const GetTeacherNotificationUnreadCount = async () => {
    const response = await api.get("/teacher/notifications/unread-count");
    return response.data;
};

export const MarkTeacherNotificationAsRead = async (id) => {
    const response = await api.post(`/teacher/notifications/${id}/read`);
    return response.data;
};

export const MarkAllTeacherNotificationsAsRead = async () => {
    const response = await api.post("/teacher/notifications/mark-all-read");
    return response.data;
};
