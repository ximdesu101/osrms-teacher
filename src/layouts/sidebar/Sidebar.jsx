import { AppSidebar } from "@/layouts/sidebar/layouts/app-sidebar";
import { AppBreadcrumbs } from "@/layouts/sidebar/layouts/app-breadcrumb";
import { Outlet } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-6"
                        />
                        <AppBreadcrumbs />
                    </div>
                </header>
                <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}