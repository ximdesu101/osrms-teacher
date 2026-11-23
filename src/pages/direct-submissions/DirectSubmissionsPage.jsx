import DirectUploadDialog from "./DirectUploadDialog";
import DirectSubmissions from "./DirectSubmissions";

const DirectSubmissionsPage = () => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-lg font-semibold">Direct Submissions</h1>
                    <p className="text-sm text-muted-foreground">
                        Upload documents directly without an admin request. All uploads still go through admin verification and approval.
                    </p>
                </div>
                <DirectUploadDialog />
            </div>
            <DirectSubmissions />
        </div>
    );
};

export default DirectSubmissionsPage;