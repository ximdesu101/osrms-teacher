import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Bell,
    CheckCheck,
    Loader,
    DatabaseX,
    SearchX,
    Eye,
} from "lucide-react";
import {
    GetTeacherNotifications,
    MarkTeacherNotificationAsRead,
    MarkAllTeacherNotificationsAsRead,
} from "@/services/notificationService";

const Notifications = () => {
    const [filter, setFilter] = useState("all");
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["teacher-notifications", filter, page],
        queryFn: () => GetTeacherNotifications({ page, filter }),
    });

    const markReadMutation = useMutation({
        mutationFn: MarkTeacherNotificationAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teacher-notifications"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-unread-count"] });
        },
        onError: () => toast.error("Failed to mark notification as read."),
    });

    const markAllMutation = useMutation({
        mutationFn: MarkAllTeacherNotificationsAsRead,
        onSuccess: () => {
            toast.success("All notifications marked as read.");
            queryClient.invalidateQueries({ queryKey: ["teacher-notifications"] });
            queryClient.invalidateQueries({ queryKey: ["teacher-unread-count"] });
        },
        onError: () => toast.error("Failed to mark all as read."),
    });

    const notifications = data?.data ?? [];
    const lastPage = Math.max(1, data?.last_page ?? 1);
    const currentPage = data?.current_page ?? page;

    const handleFilterChange = (value) => {
        setFilter(value);
        setPage(1);
    };

    const handleView = (notification) => {
        // Mark as read first
        if (notification.is_unread) {
            markReadMutation.mutate(notification.id);
        }
        // Navigate to the linked page, stripping any trailing ID segment
        const rawLink = notification.data?.link;
        if (rawLink) {
            const cleanLink = rawLink.replace(/\/\d+$/, "");
            navigate(cleanLink);
        }
    };

    const formatDate = (value) => {
        if (!value) return "—";
        try {
            return new Date(value).toLocaleString(undefined, {
                year: "numeric", month: "short", day: "numeric",
                hour: "numeric", minute: "2-digit",
            });
        } catch {
            return "—";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between">
                <Tabs value={filter} onValueChange={handleFilterChange}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">Unread</TabsTrigger>
                        <TabsTrigger value="read">Read</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending}
                >
                    {markAllMutation.isPending ? (
                        <Loader className="animate-spin" />
                    ) : (
                        <CheckCheck />
                    )}
                    Mark all as read
                </Button>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="bg-[#00601c]">
                        <TableRow className="hover:bg-[#00601c]">
                            <TableHead className="text-white">Notification</TableHead>
                            <TableHead className="text-white">Message</TableHead>
                            <TableHead className="text-white">Date</TableHead>
                            <TableHead className="text-center text-white">Status</TableHead>
                            <TableHead className="text-right text-white">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    <Loader className="mx-auto animate-spin" />
                                    Loading notifications...
                                </TableCell>
                            </TableRow>
                        ) : isError ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-destructive">
                                    <DatabaseX className="mx-auto" />
                                    Failed to load notifications.
                                </TableCell>
                            </TableRow>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <TableRow
                                    key={notification.id}
                                    className={notification.is_unread ? "bg-primary/5" : ""}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {notification.is_unread && (
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#3e963f]" />
                                            )}
                                            <span className={`font-medium ${notification.is_unread ? "text-foreground" : "text-muted-foreground"}`}>
                                                {notification.title}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="max-w-md whitespace-normal text-sm text-muted-foreground">
                                            {notification.message}
                                        </div>
                                    </TableCell>

                                    <TableCell className="whitespace-nowrap text-sm">
                                        {formatDate(notification.created_at)}
                                    </TableCell>

                                    <TableCell className="text-center">
                                        {notification.is_unread ? (
                                            <span className="inline-flex items-center rounded-full border border-[#3e963f]/30 bg-[#3e963f]/10 px-2.5 py-1 text-xs font-medium text-[#3e963f]">
                                                Unread
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                                Read
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleView(notification)}
                                        >
                                            <Eye />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    <SearchX className="mx-auto" />
                                    No notifications found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Separator />

                <div className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                        <span className="font-medium text-foreground">{lastPage}</span>
                    </p>
                    <Pagination className="mx-0 w-auto justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    onClick={() => { if (currentPage > 1) setPage(currentPage - 1); }}
                                />
                            </PaginationItem>
                            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                                <PaginationItem key={p}>
                                    <PaginationLink
                                        isActive={p === currentPage}
                                        className="cursor-pointer"
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    className={currentPage >= lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    onClick={() => { if (currentPage < lastPage) setPage(currentPage + 1); }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
