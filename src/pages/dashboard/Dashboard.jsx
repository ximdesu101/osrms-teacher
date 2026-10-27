import { useAuth } from "@/hooks/useAuth";
import CardMetrics from "./layout/CardMetrics";
import QuickActions from "./layout/QuickActions";
import RecentIncomingRequests from "./layout/RecentIncomingRequests";
import RecentSubmissions from "./layout/RecentSubmissions";
import DashboardCalendar from "./layout/DashboardCalendar";

const Dashboard = () => {
    const { user } = useAuth() || {};
    const displayName =
        user?.name || user?.first_name || user?.username || "Teacher";

    return (
        <div className="grid gap-4">
            {/* Header / Welcome */}
            <div>
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Welcome back, {displayName}. Here’s an overview of your
                    document requests and deadlines.
                </p>
            </div>

            {/* Metrics + Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="grid gap-4">
                    <CardMetrics />
                    <QuickActions />
                </div>
                <DashboardCalendar />
            </div>

            {/* Recent lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentIncomingRequests />
                <RecentSubmissions />
            </div>
        </div>
    );
};

export default Dashboard;