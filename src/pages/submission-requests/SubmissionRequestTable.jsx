import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Eye, Loader, DatabaseX, SearchX } from "lucide-react";

import { GetSubmissionRequests } from "@/services/submissionRequestService";
import SubmissionRequestDetailDialog from "./SubmissionRequestDetailDialog";

/* ─── style maps ────────────────────────────────────────────── */
const statusClass = {
    Requested:    "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Acknowledged: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Submitted:    "bg-green-100 text-green-800 hover:bg-green-100",
    Overdue:      "bg-red-100 text-red-800 hover:bg-red-100",
    Cancelled:    "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

/* Submission sub-status shown when a document has been submitted */
const submissionStatusClass = {
    Submitted:           "bg-sky-100 text-sky-700 hover:bg-sky-100",
    "Under Review":      "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    "Revision Required": "bg-orange-100 text-orange-700 hover:bg-orange-100",
    Resubmitted:         "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Approved:            "bg-green-100 text-green-700 hover:bg-green-100",
};

const TABS = [
    { value: "All",               label: "All" },
    { value: "Requested",         label: "Requested" },
    { value: "Acknowledged",      label: "Acknowledged" },
    { value: "Awaiting Approval", label: "Awaiting Approval" },
    { value: "Needs Revision",    label: "Needs Revision" },
    { value: "Submitted",         label: "Submitted" },
    { value: "Overdue",           label: "Overdue" },
    { value: "Cancelled",         label: "Cancelled" },
];

function fmtDate(str) {
    if (!str) return "—";
    try {
        return new Date(str).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch {
        return str;
    }
}

/* ─── component ─────────────────────────────────────────────── */
const SubmissionRequestTable = () => {
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["teacher-submission-requests", { page, status }],
        queryFn: () => GetSubmissionRequests({ page, status }),
        placeholderData: keepPreviousData,
    });

    const requests = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;
    const currentPage = data?.current_page ?? 1;

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="grid gap-2">
            {/* Tabs */}
            <div className="overflow-x-auto">
                <Tabs value={status} onValueChange={handleStatusChange}>
                    <TabsList className="flex-nowrap w-max">
                        {TABS.map((t) => (
                            <TabsTrigger key={t.value} value={t.value} className="whitespace-nowrap">
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#00601c]">
                        <TableRow className="hover:bg-[#00601c]">
                            <TableHead className="text-white">Request ID</TableHead>
                            <TableHead className="text-white">Document</TableHead>
                            <TableHead className="text-white">Requested By</TableHead>
                            <TableHead className="text-white">Request Date</TableHead>
                            <TableHead className="text-white">Due Date</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    <Loader className="mx-auto animate-spin" />
                                    Loading requests…
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-destructive">
                                    <DatabaseX className="mx-auto" />
                                    Failed to load requests.
                                </TableCell>
                            </TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium font-mono text-xs">
                                        {req.request_code}
                                    </TableCell>
                                    <TableCell>{req.document_name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {req.requested_by ?? "Administrator"}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {fmtDate(req.request_date)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {req.due_date ? (
                                            <span
                                                className={
                                                    req.status === "Overdue"
                                                        ? "text-red-600 font-medium"
                                                        : ""
                                                }
                                            >
                                                {fmtDate(req.due_date)}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge className={statusClass[req.status] || ""}>
                                                {req.status}
                                            </Badge>
                                            {/* Show submission sub-status when present */}
                                            {req.submission?.status && (
                                                <Badge
                                                    className={
                                                        submissionStatusClass[req.submission.status] || "bg-muted text-muted-foreground"
                                                    }
                                                >
                                                    {req.submission.status}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="View Details"
                                            onClick={() => setSelectedId(req.id)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    <SearchX className="mx-auto" />
                                    No incoming requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <hr className="border-border" />

                {/* Pagination */}
                <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page{" "}
                        <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                        <span className="font-medium text-foreground">{lastPage}</span>
                    </p>
                    <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    onClick={() => currentPage > 1 && setPage(currentPage - 1)}
                                />
                            </PaginationItem>
                            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        isActive={p === currentPage}
                                        className="cursor-pointer"
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    className={currentPage >= lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    onClick={() => currentPage < lastPage && setPage(currentPage + 1)}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

            {/* Detail / action dialog */}
            <SubmissionRequestDetailDialog
                requestId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </div>
    );
};

export default SubmissionRequestTable;
