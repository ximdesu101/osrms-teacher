import { Link } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Zap,
    Inbox,
    Upload,
    FileCheck2,
    FileText,
} from "lucide-react";

const actions = [
    {
        label: "View Incoming Requests",
        icon: Inbox,
        path: "/submission-requests",
    },
    {
        label: "Submit Documents",
        icon: Upload,
        path: "/submission-requests",
    },
    {
        label: "View Submissions",
        icon: FileCheck2,
        path: "/submission-requests",
    },
    {
        label: "Browse File Templates",
        icon: FileText,
        path: "/file-templates",
    },
];

function QuickActions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-1">
                    <Zap className="w-4 h-4 my-auto" /> Quick Actions
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {actions.map(({ label, icon: Icon, path }) => (
                    <Link
                        key={label}
                        to={path}
                        className="flex-1 min-w-[140px] flex flex-col items-center gap-2 rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-center"
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}

export default QuickActions;