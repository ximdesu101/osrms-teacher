import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    BadgeCheck,
    Loader2,
    Download,
    FileX,
    // School Form icons (lucide)
    GraduationCap,
    CalendarCheck,
    BookOpen,
    CalendarDays,
    TrendingUp,
    BarChart3,
    Users,
    HeartPulse,
    ClipboardList,
    BookMarked,
    // Admin Form icons
    Fingerprint,
    ClipboardCheck,
    Database,
    Plane,
    FileText,
    Megaphone,
    Send,
    CalendarMinus,
    Utensils,
} from "lucide-react";

import { GetSchoolFormsSummary, GetAdminFormsSummary, DownloadTemplate } from "@/services/templateService";

/* ─── Form definitions ──────────────────────────────────────── */

const SCHOOL_FORMS = [
    {
        code: "SF1",
        icon: GraduationCap,
        name: "School Register Report",
        description:
            "A register of all learners enrolled in the school, including personal data and enrollment status.",
    },
    {
        code: "SF2",
        icon: CalendarCheck,
        name: "Daily Attendance Report",
        description: "Monthly summary of daily learner attendance per section.",
    },
    {
        code: "SF3",
        icon: BookOpen,
        name: "Books Issued and Returned",
        description: "Tracks textbooks and instructional materials issued to learners.",
    },
    {
        code: "SF4",
        icon: CalendarDays,
        name: "Monthly Movement Report",
        description: "Records learner enrollment changes throughout the school year.",
    },
    {
        code: "SF5",
        icon: TrendingUp,
        name: "Promotion Report",
        description: "End-of-year report on learner promotions, retention, and dropouts.",
    },
    {
        code: "SF6",
        icon: BarChart3,
        name: "Summarized Report on Promotion",
        description: "Consolidated school-wide summary of promotion outcomes.",
    },
    {
        code: "SF7",
        icon: Users,
        name: "School Personnel List",
        description:
            "Report of all teaching and non-teaching personnel including position and assignments.",
    },
    {
        code: "SF8",
        icon: HeartPulse,
        name: "Learner's Basic Health Profile",
        description: "Basic health and nutritional data for each enrolled learner.",
    },
    {
        code: "SF9",
        icon: ClipboardList,
        name: "Learner Progress Report Card",
        description: "Official report card showing quarterly grades and remarks.",
    },
    {
        code: "SF10",
        icon: BookMarked,
        name: "Permanent Academic Record",
        description: "Cumulative academic record retained permanently by the school.",
    },
];

const ADMIN_FORMS = [
    {
        code: "DTR",
        icon: Fingerprint,
        name: "Biometrics and DTR",
        description: "Personnel biometrics and daily time record documents.",
    },
    {
        code: "ACR",
        icon: ClipboardCheck,
        name: "Activity Completion Report",
        description: "Report used to document completed school activities.",
    },
    {
        code: "TO",
        icon: Plane,
        name: "Travel Order",
        description: "Authorization and location details for official travel.",
    },
    {
        code: "LF",
        icon: CalendarMinus,
        name: "Leave Form",
        description: "Application form for employee leave requests.",
    },
    {
        code: "SO",
        icon: FileText,
        name: "Special Order",
        description: "Request and authorization for required services.",
    },
    {
        code: "TRANSMITTAL",
        icon: Send,
        name: "Transmittal",
        description: "Covers district and division transmittal for document routing.",
    },
    {
        code: "SNSED",
        icon: Megaphone,
        name: "Nationwide Simultaneous Earthquake Drill",
        description: "Nationwide Simultaneous Earthquake Drill documentation.",
    },
    {
        code: "DPDS",
        icon: Database,
        name: "DepED Partnership Database System",
        description: "Records and manages school partnerships and stakeholder contributions.",
    },
    {
        code: "SBFP",
        icon: Utensils,
        name: "SBFP – School-Based Feeding Program",
        description: "School-Based Feeding Program documentation, beneficiary records, and related reports.",
    },
];

/* ─── Individual template card ──────────────────────────────── */

function TemplateCard({ formDef, summary }) {
    const [downloading, setDownloading] = useState(false);
    const Icon = formDef.icon;

    const hasTemplate = summary?.has_template ?? false;
    const template = summary?.template ?? null;

    const handleDownload = async () => {
        if (!hasTemplate || !template) return;
        setDownloading(true);
        try {
            await DownloadTemplate(formDef.code, template.original_name);
            toast.success(`${formDef.code} template downloaded.`);
        } catch (err) {
            const msg = err.response?.data?.message;
            toast.error(msg || "Failed to download template. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#3e963f]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-semibold">
                        {formDef.code}
                    </CardTitle>
                    <CardDescription>{formDef.name}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {formDef.description}
                </p>

                {hasTemplate ? (
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            {template?.last_updated && (
                                <p className="text-xs text-muted-foreground truncate">
                                    Updated {template.last_updated}
                                </p>
                            )}
                            {template?.file_size_formatted && (
                                <p className="text-xs text-muted-foreground">
                                    {template.file_size_formatted}
                                </p>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 gap-1.5"
                            onClick={handleDownload}
                            disabled={downloading}
                        >
                            {downloading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            {downloading ? "Downloading…" : "Download"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileX className="h-3.5 w-3.5 shrink-0" />
                        <span>Template not yet uploaded by admin</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ─── School Forms tab ──────────────────────────────────────── */

function SchoolFormsTab() {
    const [summaryMap, setSummaryMap] = useState({});
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await GetSchoolFormsSummary();
            const map = {};
            (data?.forms || []).forEach((item) => {
                map[item.form_code] = item;
            });
            setSummaryMap(map);
        } catch {
            setSummaryMap({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="grid gap-4">
            <CardHeader>
                <div className="flex gap-2">
                    <CardTitle className="text-3xl font-semibold">School Forms</CardTitle>
                    <Badge
                        variant="outline"
                        className="my-auto border-green-200 bg-green-50 text-green-700"
                    >
                        <BadgeCheck />
                        Official
                    </Badge>
                </div>
                <CardDescription>
                    Official DepEd Forms of Tagnao Elementary School
                </CardDescription>
            </CardHeader>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading templates…
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {SCHOOL_FORMS.map((form) => (
                        <TemplateCard
                            key={form.code}
                            formDef={form}
                            summary={summaryMap[form.code]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Administrative Forms tab ──────────────────────────────── */

function AdminFormsTab() {
    const [summaryMap, setSummaryMap] = useState({});
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await GetAdminFormsSummary();
            const map = {};
            (data?.forms || []).forEach((item) => {
                map[item.form_code] = item;
            });
            setSummaryMap(map);
        } catch {
            setSummaryMap({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="grid gap-4">
            <CardHeader>
                <div className="flex gap-2">
                    <CardTitle className="text-3xl font-semibold">Administrative Forms</CardTitle>
                    <Badge
                        variant="outline"
                        className="my-auto border-green-200 bg-green-50 text-green-700"
                    >
                        <BadgeCheck />
                        Official
                    </Badge>
                </div>
                <CardDescription>
                    Administrative documents of Tagnao Elementary School
                </CardDescription>
            </CardHeader>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading templates…
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ADMIN_FORMS.map((form) => (
                        <TemplateCard
                            key={form.code}
                            formDef={form}
                            summary={summaryMap[form.code]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Page ──────────────────────────────────────────────────── */

const FileTemplates = () => {
    return (
        <Tabs defaultValue="school-forms">
            <TabsList className="w-full">
                <TabsTrigger value="school-forms">School Forms</TabsTrigger>
                <TabsTrigger value="admin-forms">Administrative Forms</TabsTrigger>
            </TabsList>

            <TabsContent value="school-forms">
                <SchoolFormsTab />
            </TabsContent>
            <TabsContent value="admin-forms">
                <AdminFormsTab />
            </TabsContent>
        </Tabs>
    );
};

export default FileTemplates;