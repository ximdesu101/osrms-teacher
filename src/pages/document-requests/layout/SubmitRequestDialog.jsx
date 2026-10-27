import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const DOCUMENT_MAP = {
    sf1:         "School Form 1",
    sf2:         "School Form 2",
    sf3:         "School Form 3",
    sf4:         "School Form 4",
    sf5:         "School Form 5",
    sf6:         "School Form 6",
    sf7:         "School Form 7",
    sf8:         "School Form 8",
    sf9:         "School Form 9",
    sf10:        "School Form 10",
    dtr:         "Biometrics and DTR",
    acr:         "Activity Completion Report",
    dpds:        "DepEd Partnership Database System",
    to:          "Travel Order",
    lf:          "Leave Form",
    so:          "Special Order",
    snsed:       "National Simulation Earthquake Drill",
    transmittal: "Transmittal",
};

const SubmitRequestDialog = () => {
    const [open, setOpen] = useState(false);
    const [documentCode, setDocumentCode] = useState("");
    const [purpose, setPurpose] = useState("");
    const queryClient = useQueryClient();

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
                                {Object.entries(DOCUMENT_MAP).map(([code, name]) => (
                                    <SelectItem key={code} value={code}>
                                        {name}
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
