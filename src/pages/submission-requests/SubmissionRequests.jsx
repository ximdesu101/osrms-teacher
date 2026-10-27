import SubmissionRequestTable from "./SubmissionRequestTable";

const SubmissionRequests = () => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <div>
                <h1 className="text-lg font-semibold">Incoming Requests</h1>
                <p className="text-sm text-muted-foreground">
                    Document requests sent to you by the administrator. Acknowledge, then submit the requested document.
                </p>
            </div>
            <SubmissionRequestTable />
        </div>
    );
};

export default SubmissionRequests;
