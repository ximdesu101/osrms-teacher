import api from "@/lib/axios";

/**
 * List incoming submission requests sent by the admin to this teacher.
 * @param {object} params
 * @param {number} [params.page]
 * @param {string} [params.status]  e.g. 'All', 'Requested', 'Acknowledged', 'Submitted', 'Overdue', 'Cancelled'
 *                                  or virtual filters: 'Needs Revision', 'Awaiting Approval'
 */
export const GetSubmissionRequests = async ({ page = 1, status = "All" } = {}) => {
    const response = await api.get("/teacher/submission-requests", {
        params: { page, status },
    });
    return response.data;
};

/**
 * Get a single submission request with full detail (includes submission + versions).
 */
export const GetSubmissionRequest = async (id) => {
    const response = await api.get(`/teacher/submission-requests/${id}`);
    return response.data;
};

/**
 * Acknowledge a submission request (moves it from Requested → Acknowledged).
 */
export const AcknowledgeSubmissionRequest = async (id) => {
    const response = await api.post(`/teacher/submission-requests/${id}/acknowledge`);
    return response.data;
};

/**
 * Submit a document for a submission request.
 * @param {number} id           The submission request ID
 * @param {File}   file         The file to upload
 */
export const SubmitDocument = async (id, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
        `/teacher/submission-requests/${id}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};

/**
 * Resubmit a revised document (after admin requested a revision).
 * @param {number} submissionId  The document_submission ID (NOT the request ID)
 * @param {File}   file          The revised file
 */
export const ResubmitDocument = async (submissionId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(
        `/teacher/document-submissions/${submissionId}/resubmit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
};
