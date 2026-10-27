import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Loader, Download, AlertCircle, CheckCircle2, Clock, Ban, Eye } from "lucide-react";
import { GetDocumentRequest } from "@/services/documentRequestService";

const statusClassName = {
    Pending:      "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Acknowledged: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Processing:   "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Fulfilled:    "bg-green-100 text-green-800 hover:bg-green-100",
    Unavailable:  "bg-red-100 text-red-800 hover:bg-red-100",
    Cancelled:    "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
};

const RequestDetailDialog = ({ requestId, onClose }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["teacher-document-request", requestId],
        queryFn: () => GetDocumentRequest(requestId),
        enabled: !!requestId,
    });

    const req = data?.request;

    return (
        <Dialog open={!!requestId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!w-[90vw] !max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Details</DialogTitle>
                    <DialogDescription>
                        View the status and details of your document request.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex justify-center py-8">
                        <Loader className="animate-spin text-muted-foreground" />
                    </div>
                )}

                {req && (
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Badge className={statusClassName[req.status] || ""}>
                                {req.status}
                            </Badge>
                            <span className="text-muted-foreground text-xs">{req.request_code}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-muted-foreground">Document</p>
                                <p className="font-medium">{req.document_name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Requested On</p>
                                <p className="font-medium">{formatDateTime(req.created_at)}</p>
                            </div>
                            {req.purpose && (
                                <div className="col-span-2">
                                    <p className="text-muted-foreground">Purpose</p>
                                    <p className="font-medium whitespace-normal">{req.purpose}</p>
                                </div>
                            )}
                            {req.acknowledged_at && (
                                <div>
                                    <p className="text-muted-foreground">Acknowledged</p>
                                    <p className="font-medium">{formatDateTime(req.acknowledged_at)}</p>
                                </div>
                            )}
                            {req.fulfilled_at && (
                                <div>
                                    <p className="text-muted-foreground">Fulfilled</p>
                                    <p className="font-medium">{formatDateTime(req.fulfilled_at)}</p>
                                </div>
                            )}
                        </div>

                        {req.status === "Unavailable" && req.admin_message && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                    <div>
                                        <p className="font-medium text-red-800 text-xs uppercase tracking-wide mb-1">
                                            Administrator Message
                                        </p>
                                        <p className="text-red-700 whitespace-normal">{req.admin_message}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {req.status === "Fulfilled" && req.admin_message && (
                            <div className="rounded-md border border-green-200 bg-green-50 p-3">
                                <p className="font-medium text-green-800 text-xs uppercase tracking-wide mb-1">
                                    Administrator Message
                                </p>
                                <p className="text-green-700 whitespace-normal">{req.admin_message}</p>
                            </div>
                        )}

                        {req.status === "Fulfilled" && req.file && (
                            <div className="rounded-md border border-border p-3">
                                <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wide font-medium">
                                    Document Ready
                                </p>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{req.file.original_name}</p>
                                        {req.file.formatted_size && (
                                            <p className="text-xs text-muted-foreground">{req.file.formatted_size}</p>
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        asChild
                                    >
                                        <a
                                            href={req.file.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            download={req.file.original_name}
                                        >
                                            <Download className="h-4 w-4" />
                                            Download
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default RequestDetailDialog;
