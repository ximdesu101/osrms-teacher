import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Loader,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock,
    Upload,
    RefreshCw,
    FileText,
    CalendarDays,
    User,
    Hash,
    MessageSquare,
    TriangleAlert,
    Ban,
} from "lucide-react";

import {
    GetSubmissionRequest,
    AcknowledgeSubmissionRequest,
    SubmitDocument,
    ResubmitDocument,
} from "@/services/submissionRequestService";

/* ─── status style map ──────────────────────────────────────── */
const statusClass = {
    Requested:    "bg-blue-100 text-blue-800",
    Acknowledged: "bg-yellow-100 text-yellow-800",
    Submitted:    "bg-green-100 text-green-800",
    Overdue:      "bg-red-100 text-red-800",
    Cancelled:    "bg-gray-100 text-gray-600",
};

const submissionStatusClass = {
    Submitted:         "bg-sky-100 text-sky-800",
    "Under Review":    "bg-yellow-100 text-yellow-800",
    "Revision Required": "bg-orange-100 text-orange-800",
    Resubmitted:       "bg-blue-100 text-blue-800",
    Approved:          "bg-green-100 text-green-800",
};

/* ─── helpers ───────────────────────────────────────────────── */
const ACCEPTED = ".xlsx,.xls,.pdf,.jpg,.jpeg,.png,.doc,.docx";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function fmt(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString(undefined, {
            year: "numeric", month: "short", day: "numeric",
            hour: "numeric", minute: "2-digit",
        });
    } catch {
        return "—";
    }
}

function fmtDate(str) {
    if (!str) return "—";
    try {
        return new Date(str).toLocaleDateString(undefined, {
            year: "numeric", month: "long", day: "numeric",
        });
    } catch {
        return str;
    }
}

function isOverdueDate(dueDateStr) {
    if (!dueDateStr) return false;
    try {
        // Due date is a plain date string YYYY-MM-DD — treat as end of that day
        const d = new Date(dueDateStr + "T23:59:59");
        return d < new Date();
    } catch {
        return false;
    }
}

/* ─── file picker ───────────────────────────────────────────── */
function FilePicker({ label, onFile }) {
    const inputRef = useRef(null);
    const [fileName, setFileName] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setError("File must be 10 MB or smaller.");
            setFileName(null);
            onFile(null);
            return;
        }
        setError(null);
        setFileName(file.name);
        onFile(file);
    };

    return (
        <div className="flex flex-col gap-1">
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="sr-only"
                onChange={handleChange}
            />
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    className="shrink-0"
                >
                    <Upload className="h-4 w-4" />
                    {label}
                </Button>
                {fileName && (
                    <span className="truncate text-sm text-muted-foreground max-w-[200px]" title={fileName}>
                        {fileName}
                    </span>
                )}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
                Accepted: Excel, PDF, Word, or image · Max 10 MB
            </p>
        </div>
    );
}

/* ─── main dialog ───────────────────────────────────────────── */
const SubmissionRequestDetailDialog = ({ requestId, onClose }) => {
    const queryClient = useQueryClient();
    const [submitFile, setSubmitFile] = useState(null);
    const [resubmitFile, setResubmitFile] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ["teacher-submission-request", requestId],
        queryFn: () => GetSubmissionRequest(requestId),
        enabled: !!requestId,
    });

    const req = data?.request;

    /* invalidate list + detail on any mutation success */
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["teacher-submission-requests"] });
        queryClient.invalidateQueries({ queryKey: ["teacher-submission-request", requestId] });
    };

    const acknowledgeMutation = useMutation({
        mutationFn: () => AcknowledgeSubmissionRequest(requestId),
        onSuccess: (res) => {
            toast.success(res?.message || "Request acknowledged.");
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to acknowledge."),
    });

    const submitMutation = useMutation({
        mutationFn: () => SubmitDocument(requestId, submitFile),
        onSuccess: (res) => {
            toast.success(res?.message || "Document submitted successfully.");
            setSubmitFile(null);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to submit document."),
    });

    const resubmitMutation = useMutation({
        mutationFn: () => ResubmitDocument(req?.submission?.id, resubmitFile),
        onSuccess: (res) => {
            toast.success(res?.message || "Revised document submitted.");
            setResubmitFile(null);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to resubmit document."),
    });

    const anyPending = acknowledgeMutation.isPending || submitMutation.isPending || resubmitMutation.isPending;

    return (
        <Dialog open={!!requestId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Submission Request</DialogTitle>
                    <DialogDescription>
                        Review the admin's request and submit the requested document.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex justify-center py-10">
                        <Loader className="animate-spin text-muted-foreground" />
                    </div>
                )}

                {req && (
                    <div className="space-y-4 text-sm">

                        {/* ── Status + Code ── */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={statusClass[req.status] || "bg-muted text-muted-foreground"}>
                                {req.status}
                            </Badge>
                            <span className="font-mono text-xs text-muted-foreground">{req.request_code}</span>
                        </div>

                        <hr className="border-border" />
                        <div className="grid grid-cols-2 gap-3">
                            <DetailRow icon={FileText} label="Document" value={req.document_name} />
                            <DetailRow
                                icon={User}
                                label="Requested By"
                                value={req.requested_by ?? "Administrator"}
                            />
                            <DetailRow
                                icon={CalendarDays}
                                label="Request Date"
                                value={fmtDate(req.request_date)}
                            />
                            <DetailRow
                                icon={CalendarDays}
                                label="Due Date"
                                value={fmtDate(req.due_date)}
                                highlight={req.status !== "Submitted" && isOverdueDate(req.due_date)}
                            />
                        </div>

                        {req.notes && (
                            <div className="rounded-md border border-border bg-muted/40 p-3">
                                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Instructions / Notes
                                </p>
                                <p className="whitespace-pre-wrap leading-relaxed">{req.notes}</p>
                            </div>
                        )}

                        {/* ── Overdue warning ── */}
                        {req.status === "Overdue" && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                                <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                                <p className="text-red-700 text-xs">
                                    This request is past its due date. You can still submit a document.
                                </p>
                            </div>
                        )}

                        {/* ── Cancelled notice ── */}
                        {req.status === "Cancelled" && (
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 flex items-start gap-2">
                                <Ban className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
                                <p className="text-gray-600 text-xs">
                                    This request was cancelled by the administrator.
                                </p>
                            </div>
                        )}

                        <hr className="border-border" />

                        {/* ── Submission section ── */}
                        <SubmissionSection
                            req={req}
                            submitFile={submitFile}
                            setSubmitFile={setSubmitFile}
                            resubmitFile={resubmitFile}
                            setResubmitFile={setResubmitFile}
                            anyPending={anyPending}
                            acknowledgeMutation={acknowledgeMutation}
                            submitMutation={submitMutation}
                            resubmitMutation={resubmitMutation}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

/* ─── submission section (acknowledge / submit / resubmit / status) ─── */
function SubmissionSection({
    req,
    submitFile, setSubmitFile,
    resubmitFile, setResubmitFile,
    anyPending,
    acknowledgeMutation,
    submitMutation,
    resubmitMutation,
}) {
    const sub = req.submission;

    /* Acknowledge */
    if (req.status === "Requested") {
        return (
            <div className="space-y-3">
                <p className="font-medium">Acknowledge this request</p>
                <p className="text-muted-foreground text-xs">
                    Let the administrator know you have seen this request before uploading your document.
                </p>
                <Button
                    size="sm"
                    onClick={() => acknowledgeMutation.mutate()}
                    disabled={anyPending}
                >
                    {acknowledgeMutation.isPending && <Loader2 className="animate-spin" />}
                    <CheckCircle2 className="h-4 w-4" />
                    Acknowledge Request
                </Button>
            </div>
        );
    }

    /* First-time submit (Acknowledged or Overdue with no submission yet) */
    if (
        (req.status === "Acknowledged" || req.status === "Overdue") &&
        !sub
    ) {
        return (
            <div className="space-y-3">
                <p className="font-medium">Submit your document</p>
                <FilePicker label="Choose file…" onFile={setSubmitFile} />
                <Button
                    size="sm"
                    disabled={!submitFile || anyPending}
                    onClick={() => submitMutation.mutate()}
                >
                    {submitMutation.isPending && <Loader2 className="animate-spin" />}
                    <Upload className="h-4 w-4" />
                    Submit Document
                </Button>
            </div>
        );
    }

    /* Awaiting review / submitted / resubmitted / under-review */
    if (sub && sub.status !== "Revision Required" && sub.status !== "Approved") {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <p className="font-medium">Submission status</p>
                    <Badge className={submissionStatusClass[sub.status] || "bg-muted"}>
                        {sub.status}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    Your document <strong>{sub.original_name}</strong> was submitted on{" "}
                    {fmt(sub.submitted_at)}. The administrator is reviewing it.
                </p>
                {sub.formatted_size && (
                    <p className="text-xs text-muted-foreground">Size: {sub.formatted_size}</p>
                )}
            </div>
        );
    }

    /* Revision required */
    if (sub?.status === "Revision Required") {
        return (
            <div className="space-y-3">
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-orange-700 uppercase tracking-wide mb-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Revision Requested
                    </p>
                    {sub.revision_note && (
                        <p className="text-orange-800 whitespace-pre-wrap text-xs">{sub.revision_note}</p>
                    )}
                </div>
                <p className="font-medium">Submit a revised document</p>
                <FilePicker label="Choose revised file…" onFile={setResubmitFile} />
                <Button
                    size="sm"
                    disabled={!resubmitFile || anyPending}
                    onClick={() => resubmitMutation.mutate()}
                >
                    {resubmitMutation.isPending && <Loader2 className="animate-spin" />}
                    <RefreshCw className="h-4 w-4" />
                    Resubmit Document
                </Button>
            </div>
        );
    }

    /* Approved */
    if (sub?.status === "Approved") {
        return (
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Document Approved
                </p>
                <p className="text-green-700 text-xs">
                    Your submitted document has been approved by the administrator.
                </p>
                {sub.approved_at && (
                    <p className="text-green-600 text-xs mt-1">Approved on {fmt(sub.approved_at)}.</p>
                )}
            </div>
        );
    }

    return null;
}

/* ─── detail row helper ─────────────────────────────────────── */
function DetailRow({ icon: Icon, label, value, highlight = false }) {
    return (
        <div className="flex items-start gap-2">
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`font-medium ${highlight ? "text-red-600" : ""}`}>{value || "—"}</p>
            </div>
        </div>
    );
}

export default SubmissionRequestDetailDialog;
