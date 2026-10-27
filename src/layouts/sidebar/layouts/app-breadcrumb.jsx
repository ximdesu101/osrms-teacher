import { useLocation, useMatches, Link } from "react-router-dom";
import { Fragment } from "react";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AppBreadcrumbs() {
    const matches = useMatches();
    const location = useLocation();
    const routeCrumbs = matches.flatMap((match) => {
        if (!match.handle?.crumb) return [];

        const parentCrumb = match.handle.parentCrumb;
        const crumbs = parentCrumb ? [parentCrumb] : [];

        crumbs.push({
            label: match.handle.crumb(match.params, match.data),
            href: match.pathname,
        });

        return crumbs;
    });
    let crumbs = routeCrumbs;
    if (location.pathname.startsWith("/school-forms/")) {
        crumbs = [{ label: "School Forms", href: "/forms" }, ...routeCrumbs];
    } else if (location.pathname.startsWith("/admin-forms/")) {
        crumbs = [{ label: "Administrative Forms", href: "/forms" }, ...routeCrumbs];
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;
                    return (
                        <Fragment key={crumb.href}>
                            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                            <BreadcrumbItem className={!isLast ? "hidden md:block" : undefined}>
                                {isLast ? (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={crumb.href}>{crumb.label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default AppBreadcrumbs
