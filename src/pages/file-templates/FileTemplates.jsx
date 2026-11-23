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
    Fingerprint,
    ClipboardCheck,
    Database,
    Plane,
    FileText,
    Megaphone,
    Send,
    CalendarMinus,
    Utensils,
    FileStack,
} from "lucide-react";

import { GetSchoolFormsSummary, GetAdminFormsSummary, GetFormCards, DownloadTemplate } from "@/services/templateService";

const ICON_MAP = {
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
    Fingerprint,
    ClipboardCheck,
    Database,
    Plane,
    FileText,
    Megaphone,
    Send,
    CalendarMinus,
    Utensils,
    FileStack,
    // Common admin icon names
    Apple: Utensils,
};

function TemplateCard({ card, summary }) {
    const [downloading, setDownloading] = useState(false);
    const Icon = ICON_MAP[card.icon_name] || FileStack;

    const hasTemplate = summary?.has_template ?? false;
    const template = summary?.template ?? null;

    const handleDownload = async () => {
        if (!hasTemplate || !template) return;
        setDownloading(true);
        try {
            await DownloadTemplate(card.code, template.original_name);
            toast.success(`${card.code} template downloaded.`);
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
                        {card.code}
                    </CardTitle>
                    <CardDescription>{card.name}</CardDescription>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {card.description || "No description provided."}
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

function FormsTab({ category, title, description }) {
    const [summaryMap, setSummaryMap] = useState({});
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryData, cardData] = await Promise.all([
                category === "school_forms" ? GetSchoolFormsSummary() : GetAdminFormsSummary(),
                GetFormCards(category),
            ]);

            const map = {};
            (summaryData?.forms || []).forEach((item) => {
                map[item.form_code] = item;
            });
            setSummaryMap(map);
            setCards(Array.isArray(cardData) ? cardData : []);
        } catch {
            setSummaryMap({});
            setCards([]);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="grid gap-4">
            <CardHeader>
                <div className="flex gap-2">
                    <CardTitle className="text-3xl font-semibold">{title}</CardTitle>
                    <Badge
                        variant="outline"
                        className="my-auto border-green-200 bg-green-50 text-green-700"
                    >
                        <BadgeCheck />
                        Official
                    </Badge>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading templates…
                </div>
            ) : cards.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No forms found.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <TemplateCard
                            key={card.id || card.code}
                            card={card}
                            summary={summaryMap[card.code]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const FileTemplates = () => {
    return (
        <Tabs defaultValue="school-forms">
            <TabsList className="w-full">
                <TabsTrigger value="school-forms">School Forms</TabsTrigger>
                <TabsTrigger value="admin-forms">Administrative Forms</TabsTrigger>
            </TabsList>

            <TabsContent value="school-forms">
                <FormsTab
                    category="school_forms"
                    title="School Forms"
                    description="Official DepEd Forms of Tagnao Elementary School"
                />
            </TabsContent>
            <TabsContent value="admin-forms">
                <FormsTab
                    category="admin_forms"
                    title="Administrative Forms"
                    description="Administrative documents of Tagnao Elementary School"
                />
            </TabsContent>
        </Tabs>
    );
};

export default FileTemplates;
