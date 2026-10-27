import DocumentRequestTable from "./layout/DocumentRequestTable";
import SubmitRequestDialog from "./layout/SubmitRequestDialog";

const DocumentRequests = () => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">My Document Requests</h1>
                    <p className="text-sm text-muted-foreground">
                        Submit and track requests for documents from the administrator.
                    </p>
                </div>
                <SubmitRequestDialog />
            </div>
            <DocumentRequestTable />
        </div>
    );
};

export default DocumentRequests;
