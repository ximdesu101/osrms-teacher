import api from "@/lib/axios";
import { GetSubmissionRequests } from "@/services/submissionRequestService";

/**
 * Fetch teacher dashboard metrics by aggregating existing submission-request endpoints.
 * Returns counts scoped to the authenticated teacher.
 *
 * Metrics:
 * - incoming: total active/received submission requests
 * - pending: requests still needing teacher action (Requested, Acknowledged, Overdue, Needs Revision)
 * - submitted: requests that have been submitted
 * - upcoming: outstanding requests with a due date (not completed/cancelled)
 */
export const GetTeacherDashboardMetrics = async () => {
    // Parallel status queries — each returns a Laravel paginator with `total`
    const [completedRes, requestedRes, acknowledgedRes, overdueRes, needsRevRes, awaitingRes, cancelledRes] =
        await Promise.all([
            GetSubmissionRequests({ page: 1, status: "Completed" }),
            GetSubmissionRequests({ page: 1, status: "Requested" }),
            GetSubmissionRequests({ page: 1, status: "Acknowledged" }),
            GetSubmissionRequests({ page: 1, status: "Overdue" }),
            GetSubmissionRequests({ page: 1, status: "Needs Revision" }),
            GetSubmissionRequests({ page: 1, status: "Awaiting Approval" }),
            GetSubmissionRequests({ page: 1, status: "Cancelled" }),
        ]);

    const total = (res) => res?.total ?? res?.data?.length ?? 0;

    // Pending: requests still needing teacher action
    const pending =
        total(requestedRes) +
        total(acknowledgedRes) +
        total(needsRevRes) +
        total(awaitingRes);

    return {
        complete: total(completedRes),
        pending,
        missing: total(cancelledRes),
        overdue: total(overdueRes),
    };
};

/**
 * Fetch recent incoming submission requests (max 3) for the dashboard list.
 * Sorted newest-first by the backend list order.
 */
export const GetRecentIncomingRequests = async () => {
    const res = await GetSubmissionRequests({ page: 1, status: "All" });
    const items = res?.data ?? [];
    return items.slice(0, 3);
};

/**
 * Fetch recent submissions (requests that already have a submission record).
 * Takes the first page of "Submitted" / related and keeps those with submission.
 */
export const GetRecentSubmissions = async () => {
    // Prefer Submitted + Needs Revision + Awaiting Approval style statuses that imply a file exists
    const [submittedRes, needsRevRes, awaitingRes] = await Promise.all([
        GetSubmissionRequests({ page: 1, status: "Submitted" }),
        GetSubmissionRequests({ page: 1, status: "Needs Revision" }),
        GetSubmissionRequests({ page: 1, status: "Awaiting Approval" }),
    ]);

    const all = [
        ...(submittedRes?.data ?? []),
        ...(needsRevRes?.data ?? []),
        ...(awaitingRes?.data ?? []),
    ].filter((r) => r.submission);

    // Sort by submission date (newest first) when available
    all.sort((a, b) => {
        const da = a.submission?.submitted_at || a.request_date || "";
        const db = b.submission?.submitted_at || b.request_date || "";
        return new Date(db) - new Date(da);
    });

    return all.slice(0, 3);
};

/**
 * Calendar events for the teacher: submission requests that have a due_date.
 * Uses the existing list endpoint; client filters to items with due_date.
 * @param {{ from?: string, to?: string }} range optional YYYY-MM-DD bounds
 */
export const GetTeacherCalendarEvents = async ({ from, to } = {}) => {
    // Fetch a broader set; backend does not currently expose a dedicated teacher calendar endpoint.
    // When a /teacher/dashboard/calendar-events endpoint is added, switch to it.
    const res = await GetSubmissionRequests({ page: 1, status: "All" });
    let events = (res?.data ?? [])
        .filter((r) => r.due_date)
        .map((r) => ({
            id: r.id,
            type: "incoming", // admin → teacher
            document_name: r.document_name,
            request_code: r.request_code,
            status: r.status,
            due_date: r.due_date,
            request_date: r.request_date,
            teacher: null,
            submission: r.submission ?? null,
        }));

    if (from) {
        events = events.filter((e) => e.due_date >= from);
    }
    if (to) {
        events = events.filter((e) => e.due_date <= to);
    }

    return { events };
};