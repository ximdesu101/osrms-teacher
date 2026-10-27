import { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";

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
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Loader, DatabaseX, SearchX, Ellipsis, Send, Trash2 } from "lucide-react";

import {
    GetDocumentRequestDrafts,
    SubmitDocumentRequestDraft,
    DeleteDocumentRequestDraft,
} from "@/services/documentRequestService";

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric",
        });
    } catch {
        return value;
    }
};

const Drafts = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [submitTarget, setSubmitTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["teacher-document-request-drafts", { page, search }],
        queryFn: () => GetDocumentRequestDrafts({ page, search }),
        placeholderData: keepPreviousData,
    });

    const drafts = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;
    const currentPage = data?.current_page ?? 1;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ["teacher-document-request-drafts"] });
        queryClient.invalidateQueries({ queryKey: ["teacher-document-requests"] });
    };

    const submitMutation = useMutation({
        mutationFn: (draft) => SubmitDocumentRequestDraft(draft.id),
        onSuccess: (res) => {
            toast.success(res?.message || "Request submitted successfully.");
            setSubmitTarget(null);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to submit request."),
    });

    const deleteMutation = useMutation({
        mutationFn: (draft) => DeleteDocumentRequestDraft(draft.id),
        onSuccess: (res) => {
            toast.success(res?.message || "Draft deleted.");
            setDeleteTarget(null);
            invalidate();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to delete draft."),
    });

    const handleSearchChange = (value) => {
        setSearch(value);
        setPage(1);
    };

    return (
        <div className="grid gap-4">
            <div>
                <h1 className="text-lg font-semibold">Drafts</h1>
                <p className="text-sm text-muted-foreground">
                    Saved document requests that have not yet been submitted to the administrator.
                </p>
            </div>

            <div className="grid gap-2">
                {/* Search */}
                <div className="flex items-center justify-between">
                    <InputGroup className="w-80">
                        <InputGroupInput
                            id="search"
                            placeholder="Search drafts…"
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="bg-[#00601c]">
                            <TableRow className="hover:bg-[#00601c]">
                                <TableHead className="text-white">Draft ID</TableHead>
                                <TableHead className="text-white">Document</TableHead>
                                <TableHead className="text-white">Purpose</TableHead>
                                <TableHead className="text-white">Saved On</TableHead>
                                <TableHead className="text-right text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        <Loader className="mx-auto animate-spin" />
                                        Loading drafts…
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-destructive">
                                        <DatabaseX className="mx-auto" />
                                        Failed to load drafts.
                                    </TableCell>
                                </TableRow>
                            ) : drafts.length > 0 ? (
                                drafts.map((draft) => (
                                    <TableRow key={draft.id}>
                                        <TableCell className="font-mono text-xs font-medium">
                                            {draft.request_code}
                                        </TableCell>
                                        <TableCell>{draft.document_name}</TableCell>
                                        <TableCell className="max-w-xs truncate text-muted-foreground">
                                            {draft.purpose || "—"}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(draft.request_date)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Ellipsis />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setSubmitTarget(draft)}>
                                                        <Send className="mr-2 h-4 w-4" />
                                                        Submit Request
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeleteTarget(draft)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Draft
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        <SearchX className="mx-auto" />
                                        No drafts found.
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
            </div>

            {/* Submit confirmation */}
            <AlertDialog open={!!submitTarget} onOpenChange={(open) => !open && setSubmitTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit this request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will send draft{" "}
                            <strong>{submitTarget?.request_code}</strong> (
                            {submitTarget?.document_name}) to the administrator. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep as draft</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={submitMutation.isPending}
                            onClick={() => submitTarget && submitMutation.mutate(submitTarget)}
                        >
                            {submitMutation.isPending ? "Submitting…" : "Submit request"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Draft <strong>{deleteTarget?.request_code}</strong> will be permanently deleted.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep draft</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
                        >
                            {deleteMutation.isPending ? "Deleting…" : "Delete draft"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Drafts;
