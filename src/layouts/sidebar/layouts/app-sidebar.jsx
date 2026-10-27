"use client"

import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { NavMain } from "@/layouts/sidebar/layouts/nav-main";
import { NavUser } from "@/layouts/sidebar/layouts/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    FilePlus,
    Send,
    FileBox,
    NotepadTextDashed,
    Bell,
} from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";

const navMain = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Document Requests", url: "/document-requests", icon: FilePlus },
    { title: "Incoming Requests", url: "/submission-requests", icon: Send },
    { title: "File Templates", url: "/file-templates", icon: NotepadTextDashed },
    { title: "Drafts", url: "/drafts", icon: FileBox },
    { title: "Notifications", url: "/notifications", icon: Bell },
];

export function AppSidebar({ ...props }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: storedUser } = useAuth();
    const logoutMutation = useLogout();

    // Build the full name from stored name parts
    const fullName = storedUser
        ? [storedUser.first_name, storedUser.middle_name, storedUser.last_name, storedUser.suffix]
              .filter(Boolean)
              .join(" ")
              .trim() || "Teacher"
        : "Teacher";

    const user = {
        name: fullName,
        username: storedUser?.username ?? "teacher",
        avatar: "",
    };

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <div className="flex aspect-square -ml-2 size-8 items-center justify-center rounded-lg bg-transparent text-sidebar-primary-foreground">
                                <img
                                    src="/favicon-96x96.png"
                                    alt="OSRMS Logo"
                                    className="size-8 object-contain"
                                />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">Tagnao Elementary School</span>
                                <span className="truncate text-xs">Records Management System</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} onLogout={handleLogout} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
