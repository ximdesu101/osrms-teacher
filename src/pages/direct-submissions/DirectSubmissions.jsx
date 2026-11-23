import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, FileUp, Eye } from "lucide-react";
import { GetDirectSubmissions, ResubmitDocument } from "@/services/submissionRequestService";

const statusClass = {
    Submitted: "bg-sky-100 text-sky-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    "Revision Required": "bg-orange-100 text-orange-800",
    Resubmitted: "bg-blue-100 text-blue-800",
    Approved: "bg-green-100 text-green-800",
};

function fmt(iso) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleString(); } catch { return "—"; }
}

export default function DirectSubmissions() {
    const [page, setPage] = useState(1);
    const [resubmitId, setResubmitId] = useState(null);
    const [file, setFile] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["teacher-direct-submissions", page],
        queryFn: () => GetDirectSubmissions({ page }),
    });

    const resubmitMutation = useMutation({
        mutationFn: ({ id, file }) => ResubmitDocument(id, file),
        onSuccess: () => {
            toast.success("Revised document submitted.");
            setResubmitId(null); setFile(null);
            queryClient.invalidateQueries({ queryKey: ["teacher-direct-submissions"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to resubmit."),
    });

    const items = data?.data ?? [];
    const lastPage = data?.last_page ?? 1;

    return (
        <div className="grid gap-3">
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#00601c]">
                        <TableRow className="hover:bg-[#00601c]">
                            <TableHead className="text-white">Document</TableHead>
                            <TableHead className="text-white">Status</TableHead>
                            <TableHead className="text-white">Submitted</TableHead>
                            <TableHead className="text-white">File</TableHead>
                            <TableHead className="text-right text-white">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6"><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Loading...</TableCell></TableRow>
                        ) : items.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No direct uploads yet.</TableCell></TableRow>
                        ) : items.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell>
                                    <div className="font-medium">{s.document_name || "—"}</div>
                                    <div className="text-xs text-muted-foreground">{s.submission_code}</div>
                                </TableCell>
                                <TableCell><Badge className={statusClass[s.status] || "bg-muted"}>{s.status}</Badge></TableCell>
                                <TableCell className="text-sm">{fmt(s.submitted_at)}</TableCell>
                                <TableCell className="text-sm">
                                    {s.file_url ? <a href={s.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />View</a> : "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {s.status === "Revision Required" ? (
                                        <Button size="sm" variant="outline" onClick={() => { setResubmitId(s.id); setFile(null); }}><RefreshCw className="h-4 w-4" />Resubmit</Button>
                                    ) : s.status === "Approved" ? (
                                        <span className="text-xs text-green-600">Approved</span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Awaiting review</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {lastPage > 1 && (
                <div className="flex justify-end gap-2 text-sm">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                    <span className="self-center text-muted-foreground">Page {page} of {lastPage}</span>
                    <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
            )}

            <Dialog open={!!resubmitId} onOpenChange={(o) => { if (!o) { setResubmitId(null); setFile(null); } }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Resubmit Revised Document</DialogTitle>
                        <DialogDescription>Upload the corrected file. It will go through admin review again.</DialogDescription>
                    </DialogHeader>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted/40">
                        <FileUp className="h-4 w-4" />
                        <span className="truncate">{file ? file.name : "Choose revised file"}</span>
                        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                    <DialogFooter>
                        <Button disabled={!file || resubmitMutation.isPending} onClick={() => resubmitMutation.mutate({ id: resubmitId, file })}>
                            {resubmitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Resubmit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}