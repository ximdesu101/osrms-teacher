import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
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
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Eye, Loader, DatabaseX, SearchX, Ban } from "lucide-react";
import { GetDocumentRequests, CancelDocumentRequest } from "@/services/documentRequestService";
import RequestDetailDialog from "./RequestDetailDialog";

const statusClassName = {
    Pending:      "bg-blue-100 text-blue-800 hover:bg-blue-100",
    Acknowledged: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    Processing:   "bg-purple-100 text-purple-800 hover:bg-purple-100",
    Fulfilled:    "bg-green-100 text-green-800 hover:bg-green-100",
    Unavailable:  "bg-red-100 text-red-800 hover:bg-red-100",
    Cancelled:    "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return value;
    }
};

const STATUSES = ["All", "Pending", "Acknowledged", "Processing", "Fulfilled", "Unavailable", "Cancelled"];

const DocumentRequestTable = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["teacher-document-requests", { page, search, status }],
        queryFn: () => GetDocumentRequests({ page, search, status }),
        placeholderData: keepPreviousData,
    });

    const requests = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;
    const currentPage = data?.current_page ?? 1;

    const cancelMutation = useMutation({
        mutationFn: CancelDocumentRequest,
        onSuccess: (res) => {
            toast.success(res?.message || "Request cancelled.");
            queryClient.invalidateQueries({ queryKey: ["teacher-document-requests"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to cancel request.");
        },
    });

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setPage(1);
    };

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Tabs value={status} onValueChange={handleStatusChange}>
                    <TabsList className="flex-wrap">
                        {STATUSES.map((s) => (
                            <TabsTrigger key={s} value={s}>{s}</TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
                <Field className="w-full max-w-sm">
                    <InputGroup>
                        <InputGroupInput
                            id="search"
                            placeholder="Search requests..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <InputGroupAddon align="inline-end">
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                </Field>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#00601c]">
                        <TableRow className="hover:bg-[#00601c]">
                            <TableHead className="text-white">Request ID</TableHead>
                            <TableHead className="text-white">Document</TableHead>
                            <TableHead className="text-white">Purpose</TableHead>
                            <TableHead className="text-white">Requested Date</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    <Loader className="mx-auto animate-spin" />
                                    Loading requests...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-destructive">
                                    <DatabaseX className="mx-auto" />
                                    Failed to load requests.
                                </TableCell>
                            </TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.request_code}</TableCell>
                                    <TableCell>{req.document_name}</TableCell>
                                    <TableCell className="max-w-xs truncate text-muted-foreground">
                                        {req.purpose || "—"}
                                    </TableCell>
                                    <TableCell>{formatDate(req.request_date)}</TableCell>
                                    <TableCell>
                                        <Badge className={statusClassName[req.status] || ""}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {(req.status === "Pending" || req.status === "Acknowledged") && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Cancel Request"
                                                            disabled={cancelMutation.isPending}
                                                        >
                                                            <Ban className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Cancel this request?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will cancel request{" "}
                                                                <strong>{req.request_code}</strong>. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Keep request</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => cancelMutation.mutate(req.id)}
                                                            >
                                                                Cancel request
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                title="View Details"
                                                onClick={() => setSelectedId(req.id)}
                                            >
                                                <Eye />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    <SearchX className="mx-auto" />
                                    No document requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Separator />

                <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
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

            <RequestDetailDialog
                requestId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </div>
    );
};

export default DocumentRequestTable;
