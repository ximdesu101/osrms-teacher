import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Inbox, Eye, Loader, DatabaseX, ArrowRight } from "lucide-react";
import { GetRecentIncomingRequests } from "@/services/dashboardService";
import SubmissionRequestDetailDialog from "@/pages/submission-requests/SubmissionRequestDetailDialog";

const statusClass = {
    Requested: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Acknowledged: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Submitted: "bg-green-100 text-green-800 hover:bg-green-100",
    Overdue: "bg-red-100 text-red-800 hover:bg-red-100",
    Cancelled: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

function fmtDate(str) {
    if (!str) return "—";
    try {
        return new Date(str).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return str;
    }
}

const RecentIncomingRequests = () => {
    const [selectedId, setSelectedId] = useState(null);

    const { data: requests = [], isLoading, isError } = useQuery({
        queryKey: ["teacher-dashboard-recent-incoming"],
        queryFn: GetRecentIncomingRequests,
        staleTime: 30_000,
    });

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Inbox className="h-4 w-4" />
                        Recent Incoming Requests
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/submission-requests" className="gap-1">
                            View All <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader className="h-5 w-5 animate-spin mr-2" />
                            Loading…
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-8 text-destructive">
                            <DatabaseX className="h-8 w-8 mb-2" />
                            <p className="text-sm">Failed to load requests.</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Inbox className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No incoming requests yet.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {requests.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="font-medium text-sm truncate">
                                            {req.document_name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span>
                                                Requested {fmtDate(req.request_date)}
                                            </span>
                                            {req.due_date && (
                                                <span
                                                    className={
                                                        req.status === "Overdue"
                                                            ? "text-red-600 font-medium"
                                                            : ""
                                                    }
                                                >
                                                    Due {fmtDate(req.due_date)}
                                                </span>
                                            )}
                                            <Badge
                                                className={
                                                    statusClass[req.status] || ""
                                                }
                                            >
                                                {req.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        onClick={() => setSelectedId(req.id)}
                                    >
                                        <Eye className="h-3.5 w-3.5 mr-1" />
                                        View
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <SubmissionRequestDetailDialog
                requestId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </>
    );
};

export default RecentIncomingRequests;