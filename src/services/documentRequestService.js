import api from "@/lib/axios";

export const GetDocumentRequests = async ({ page = 1, search = "", status = "All" } = {}) => {
    const response = await api.get("/teacher/document-requests", {
        params: { page, search, status },
    });
    return response.data;
};

export const GetDocumentRequest = async (id) => {
    const response = await api.get(`/teacher/document-requests/${id}`);
    return response.data;
};

export const SubmitDocumentRequest = async ({ documentCode, purpose }) => {
    const response = await api.post("/teacher/document-requests", {
        documentCode,
        purpose,
    });
    return response.data;
};

export const CancelDocumentRequest = async (id) => {
    const response = await api.post(`/teacher/document-requests/${id}/cancel`);
    return response.data;
};

export const SaveDraftDocumentRequest = async ({ documentCode, purpose }) => {
    const response = await api.post("/teacher/document-requests", {
        documentCode,
        purpose,
        isDraft: true,
    });
    return response.data;
};

export const GetDocumentRequestDrafts = async ({ page = 1, search = "" } = {}) => {
    const response = await api.get("/teacher/document-requests/drafts", {
        params: { page, search },
    });
    return response.data;
};

export const SubmitDocumentRequestDraft = async (id) => {
    const response = await api.post(`/teacher/document-requests/${id}/submit-draft`);
    return response.data;
};

export const DeleteDocumentRequestDraft = async (id) => {
    const response = await api.delete(`/teacher/document-requests/${id}/draft`);
    return response.data;
};
