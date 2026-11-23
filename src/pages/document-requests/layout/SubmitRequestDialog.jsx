import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Save } from "lucide-react";
import { SubmitDocumentRequest, SaveDraftDocumentRequest } from "@/services/documentRequestService";
import { GetFormCards } from "@/services/templateService";

const FALLBACK_DOCUMENTS = [
    { code: "sf1", name: "School Form 1" },
    { code: "sf2", name: "School Form 2" },
    { code: "sf3", name: "School Form 3" },
    { code: "sf4", name: "School Form 4" },
    { code: "sf5", name: "School Form 5" },
    { code: "sf6", name: "School Form 6" },
    { code: "sf7", name: "School Form 7" },
    { code: "sf8", name: "School Form 8" },
    { code: "sf9", name: "School Form 9" },
    { code: "sf10", name: "School Form 10" },
    { code: "dtr", name: "Biometrics and DTR" },
    { code: "acr", name: "Activity Completion Report" },
    { code: "dpds", name: "DepEd Partnership Database System" },
    { code: "to", name: "Travel Order" },
    { code: "lf", name: "Leave Form" },
    { code: "so", name: "Special Order" },
    { code: "snsed", name: "National Simulation Earthquake Drill" },
    { code: "transmittal", name: "Transmittal" },
    { code: "sbfp", name: "SBFP – School-Based Feeding Program" },
];

const SubmitRequestDialog = () => {
    const [open, setOpen] = useState(false);
    const [documentCode, setDocumentCode] = useState("");
    const [purpose, setPurpose] = useState("");
    const queryClient = useQueryClient();

    const { data: schoolCards = [] } = useQuery({
        queryKey: ["teacher-form-cards", "school_forms"],
        queryFn: () => GetFormCards("school_forms"),
        staleTime: 60_000,
    });
    const { data: adminCards = [] } = useQuery({
        queryKey: ["teacher-form-cards", "admin_forms"],
        queryFn: () => GetFormCards("admin_forms"),
        staleTime: 60_000,
    });

    const documentOptions = (() => {
        const cards = [...(schoolCards || []), ...(adminCards || [])];
        if (!cards.length) return FALLBACK_DOCUMENTS;
        return cards.map((c) => ({
            code: String(c.code || "").toLowerCase(),
            name: c.name || c.code,
        }));
    })();

    const mutation = useMutation({
        mutationFn: SubmitDocumentRequest,
        onSuccess: (res) => {
            toast.success(res?.message || "Document request submitted successfully.");
            queryClient.invalidateQueries({ queryKey: ["teacher-document-requests"] });
            setOpen(false);
            setDocumentCode("");
            setPurpose("");
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message || "Failed to submit document request."
            );
        },
    });

    const draftMutation = useMutation({
        mutationFn: SaveDraftDocumentRequest,
        onSuccess: (res) => {
            toast.success(res?.message || "Draft saved successfully.");
            queryClient.invalidateQueries({ queryKey: ["teacher-document-request-drafts"] });
            setOpen(false);
            setDocumentCode("");
            setPurpose("");
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message || "Failed to save draft."
            );
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!documentCode) {
            toast.error("Please select a document.");
            return;
        }
        mutation.mutate({ documentCode, purpose: purpose.trim() || undefined });
    };

    const handleSaveDraft = (e) => {
        e.preventDefault();
        if (!documentCode) {
            toast.error("Please select a document to save as draft.");
            return;
        }
        draftMutation.mutate({ documentCode, purpose: purpose.trim() || undefined });
    };

    const isWorking = mutation.isPending || draftMutation.isPending;

    const handleOpenChange = (value) => {
        if (!value) {
            setDocumentCode("");
            setPurpose("");
        }
        setOpen(value);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus />
                    Request Document
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Request a Document</DialogTitle>
                    <DialogDescription>
                        Submit a request to the administrator for a document.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Field>
                        <Label htmlFor="documentCode">Document <span className="text-destructive">*</span></Label>
                        <Select value={documentCode} onValueChange={setDocumentCode}>
                            <SelectTrigger id="documentCode" className="w-full">
                                <SelectValue placeholder="Select a document..." />
                            </SelectTrigger>
                            <SelectContent>
                                {documentOptions.map((doc) => (
                                    <SelectItem key={doc.code} value={doc.code}>
                                        {doc.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <Label htmlFor="purpose">Purpose <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Textarea
                            id="purpose"
                            placeholder="Briefly describe why you need this document..."
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            maxLength={500}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground text-right">{purpose.length}/500</p>
                    </Field>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isWorking}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSaveDraft}
                            disabled={!documentCode || isWorking}
                        >
                            {draftMutation.isPending
                                ? <Loader2 className="animate-spin" />
                                : <Save className="h-4 w-4" />
                            }
                            Save as Draft
                        </Button>
                        <Button type="submit" disabled={!documentCode || isWorking}>
                            {mutation.isPending && <Loader2 className="animate-spin" />}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SubmitRequestDialog;