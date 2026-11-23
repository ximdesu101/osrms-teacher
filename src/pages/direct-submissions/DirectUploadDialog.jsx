import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, FileUp } from "lucide-react";
import { DirectSubmitDocument } from "@/services/submissionRequestService";

const DOCUMENT_OPTIONS = [
    { code: "SF1", name: "School Form 1" },
    { code: "SF2", name: "School Form 2" },
    { code: "SF4", name: "School Form 4" },
    { code: "SF5", name: "School Form 5" },
    { code: "SF6", name: "School Form 6" },
    { code: "SF7", name: "School Form 7" },
    { code: "SF8", name: "School Form 8" },
    { code: "ACR", name: "Activity Completion Report" },
    { code: "DTR", name: "Biometrics and DTR" },
    { code: "DPDS", name: "DepEd Partnership Database System" },
    { code: "TO", name: "Travel Order" },
    { code: "LF", name: "Leave Form" },
    { code: "SO", name: "Special Order" },
    { code: "SNSED", name: "National Simulation Earthquake Drill" },
    { code: "TRANSMITTAL", name: "Transmittal" },
    { code: "SBFP", name: "SBFP – School-Based Feeding Program" },
];

export default function DirectUploadDialog() {
    const [open, setOpen] = useState(false);
    const [docCode, setDocCode] = useState("");
    const [file, setFile] = useState(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: DirectSubmitDocument,
        onSuccess: (res) => {
            toast.success(res?.message || "Document submitted successfully.");
            setOpen(false);
            setDocCode("");
            setFile(null);
            queryClient.invalidateQueries({ queryKey: ["teacher-submission-requests"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-direct-submissions"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to submit document."),
    });

    const selected = DOCUMENT_OPTIONS.find((d) => d.code === docCode);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selected || !file) return;
        mutation.mutate({ documentCode: selected.code, documentName: selected.name, file });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setDocCode(""); setFile(null); } }}>
            <DialogTrigger asChild>
                <Button><Upload className="h-4 w-4" /> Upload Document</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a document directly without an admin request. It will still go through admin verification and approval.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field>
                        <FieldLabel>Document Type</FieldLabel>
                        <Select value={docCode} onValueChange={setDocCode}>
                            <SelectTrigger><SelectValue placeholder="Select document type" /></SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {DOCUMENT_OPTIONS.map((d) => (
                                        <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <FieldLabel>File</FieldLabel>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted/40">
                            <FileUp className="h-4 w-4" />
                            <span className="truncate">{file ? file.name : "Choose file (Excel, PDF, Word, Image)"}</span>
                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                        <FieldDescription>Max 10MB. Allowed: xlsx, xls, pdf, jpg, png, doc, docx.</FieldDescription>
                    </Field>

                    <DialogFooter>
                        <Button type="submit" disabled={!selected || !file || mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Submit for Review
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}