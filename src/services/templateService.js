import api from "@/lib/axios";

/**
 * Fetch current-template summaries for all School Forms (SF1–SF10).
 * Returns { forms: [{ form_code, has_template, template }] }
 */
export const GetSchoolFormsSummary = async () => {
    const response = await api.get("/teacher/templates/school-forms");
    return response.data;
};

/**
 * Fetch current-template summaries for all Administrative Forms.
 * Returns { forms: [{ form_code, has_template, template }] }
 */
export const GetAdminFormsSummary = async () => {
    const response = await api.get("/teacher/templates/admin-forms");
    return response.data;
};

/**
 * Download the current template for a given form code.
 * Triggers a browser file download.
 *
 * @param {string} formCode  e.g. 'SF1', 'DTR'
 * @param {string} fileName  the original filename to suggest
 */
export const DownloadTemplate = async (formCode, fileName) => {
    const response = await api.get(
        `/teacher/templates/${encodeURIComponent(formCode)}/download`,
        { responseType: "blob" }
    );

    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `${formCode}_template`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
};
