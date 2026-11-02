import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import {
    CircleCheck,
    Clock,
    FileX2,
    TriangleAlert,
} from "lucide-react";
import { GetTeacherDashboardMetrics } from "@/services/dashboardService";

const CardMetrics = () => {
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["teacher-dashboard-metrics"],
        queryFn: GetTeacherDashboardMetrics,
        staleTime: 30_000,
    });

    const cardMetrics = [
        {
            id: 1,
            title: "Complete",
            value: data?.complete ?? 0,
            icon: CircleCheck,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
            path: "/submission-requests",
            clickable: true,
        },
        {
            id: 2,
            title: "Pending",
            value: data?.pending ?? 0,
            icon: Clock,
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
            path: "/submission-requests",
            clickable: true,
        },
        {
            id: 3,
            title: "Missing",
            value: data?.missing ?? 0,
            icon: FileX2,
            bgColor: "bg-red-100",
            iconColor: "text-red-600",
            path: "/submission-requests",
            clickable: true,
        },
        {
            id: 4,
            title: "Overdue",
            value: data?.overdue ?? 0,
            icon: TriangleAlert,
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
            path: "/submission-requests",
            clickable: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 auto-rows-min gap-4">
            {cardMetrics.map((item) => {
                const Icon = item.icon;
                return (
                    <Card
                        key={item.id}
                        className={`flex-row gap-0 p-4 ${
                            item.clickable
                                ? "cursor-pointer hover:bg-accent transition-colors"
                                : ""
                        }`}
                        onClick={() => item.clickable && navigate(item.path)}
                        role={item.clickable ? "button" : undefined}
                        tabIndex={item.clickable ? 0 : undefined}
                        onKeyDown={(e) => {
                            if (
                                item.clickable &&
                                (e.key === "Enter" || e.key === " ")
                            ) {
                                navigate(item.path);
                            }
                        }}
                    >
                        <div
                            className={`flex h-14 w-14 items-center justify-center rounded-full ${item.bgColor}`}
                        >
                            {Icon && (
                                <Icon className={`h-8 w-8 ${item.iconColor}`} />
                            )}
                        </div>
                        <div className="flex-1">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-sm">
                                    {item.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {isLoading ? "—" : isError ? "!" : item.value}
                                </h1>
                            </CardContent>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default CardMetrics;
