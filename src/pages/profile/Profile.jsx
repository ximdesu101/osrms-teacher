import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
    TeacherUpdateProfile,
    TeacherUploadAvatar,
    TeacherRemoveAvatar,
} from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    UserRound,
    IdCardLanyard,
    UserStar,
    MapPin,
    Phone,
    SquarePen,
    Loader2,
    CircleCheck,
    Camera,
    Trash2,
    ImagePlus,
} from "lucide-react";

const SUFFIXES = ["none", "Jr.", "Sr.", "II", "III", "IV", "V"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const required = (label) => ({ value }) =>
    !value ? `${label} is required` : undefined;

const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-2 gap-2 py-2.5 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
            {value || <span className="text-muted-foreground italic">—</span>}
        </span>
    </div>
);

const getInitials = (user) => {
    const parts = [user?.first_name, user?.last_name].filter(Boolean);
    if (!parts.length) return "T";
    return parts.map((n) => n[0]).join("").slice(0, 2).toUpperCase();
};

const AvatarCard = ({ user, onUpdated }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [pendingFile, setPendingFile] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const uploadMutation = useMutation({
        mutationFn: TeacherUploadAvatar,
        onSuccess: (data) => {
            const updated = data.teacher;
            localStorage.setItem("teacher_user", JSON.stringify(updated));
            queryClient.invalidateQueries({ queryKey: ["teacher-me"] });
            toast.success("Profile picture updated.");
            clearPending();
            if (onUpdated) onUpdated(updated);
        },
        onError: (err) => {
            toast.error(
                err.response?.data?.message ||
                    err.response?.data?.errors?.avatar?.[0] ||
                    "Failed to upload profile picture."
            );
        },
    });

    const removeMutation = useMutation({
        mutationFn: TeacherRemoveAvatar,
        onSuccess: (data) => {
            const updated = data.teacher;
            localStorage.setItem("teacher_user", JSON.stringify(updated));
            queryClient.invalidateQueries({ queryKey: ["teacher-me"] });
            toast.success("Profile picture removed.");
            clearPending();
            if (onUpdated) onUpdated(updated);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to remove profile picture.");
        },
    });

    const clearPending = () => {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setPendingFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Only JPEG, PNG, WebP, and GIF images are allowed.");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_AVATAR_BYTES) {
            toast.error("Image size must not exceed 2 MB.");
            e.target.value = "";
            return;
        }

        if (preview) URL.revokeObjectURL(preview);
        setPendingFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSave = () => {
        if (pendingFile) uploadMutation.mutate(pendingFile);
    };

    const isBusy = uploadMutation.isPending || removeMutation.isPending;
    const displaySrc = preview || user?.profile_picture || "";
    const fullName = [user?.first_name, user?.middle_name, user?.last_name, user?.suffix]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <div className="relative group shrink-0">
                    <Avatar className="h-28 w-28 rounded-2xl border-2 border-border shadow-md">
                        <AvatarImage src={displaySrc} alt={fullName} className="object-cover" />
                        <AvatarFallback className="rounded-2xl text-2xl font-semibold bg-muted">
                            {getInitials(user)}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:pointer-events-none"
                        aria-label="Change profile picture"
                    >
                        <Camera className="h-7 w-7 text-white" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>

                <div className="flex flex-1 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">{fullName || "Teacher"}</h2>
                        <p className="text-sm text-muted-foreground">@{user?.username}</p>
                        {user?.position && (
                            <p className="mt-1 text-sm text-muted-foreground">{user.position}</p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        {pendingFile ? (
                            <>
                                <Button size="sm" onClick={handleSave} disabled={isBusy} className="gap-1.5">
                                    {uploadMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading…
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus className="h-4 w-4" />
                                            Save Photo
                                        </>
                                    )}
                                </Button>
                                <Button size="sm" variant="outline" onClick={clearPending} disabled={isBusy}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isBusy}
                                    className="gap-1.5"
                                >
                                    <Camera className="h-4 w-4" />
                                    {user?.profile_picture ? "Change Photo" : "Upload Photo"}
                                </Button>
                                {user?.profile_picture && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => removeMutation.mutate()}
                                        disabled={isBusy}
                                        className="gap-1.5 text-destructive hover:text-destructive"
                                    >
                                        {removeMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        Remove
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF · Max 2 MB</p>
                </div>
            </div>
        </div>
    );
};

const EditProfileDialog = ({ user, onSaved }) => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: TeacherUpdateProfile,
        onSuccess: (data) => {
            const updated = data.teacher;
            localStorage.setItem("teacher_user", JSON.stringify(updated));
            queryClient.invalidateQueries({ queryKey: ["teacher-me"] });
            toast.success("Profile updated successfully.");
            setOpen(false);
            if (onSaved) onSaved(updated);
        },
        onError: (err) => {
            if (err.response?.status === 422 && err.response.data?.errors) {
                Object.entries(err.response.data.errors).forEach(([key, messages]) => {
                    form.setFieldMeta(key, (meta) => ({
                        ...meta,
                        errorMap: { onSubmit: messages[0] },
                    }));
                });
                return;
            }
            toast.error(err.response?.data?.message || "Failed to update profile.");
        },
    });

    const form = useForm({
        defaultValues: {
            firstName: user?.first_name ?? "",
            middleName: user?.middle_name ?? "",
            lastName: user?.last_name ?? "",
            suffix: user?.suffix ?? "none",
            region: user?.region ?? "",
            province: user?.province ?? "",
            cityMunicipality: user?.city_municipality ?? "",
            barangay: user?.barangay ?? "",
            contactNumber: user?.contact_number ?? "",
        },
        onSubmit: async ({ value }) => {
            await updateMutation.mutateAsync(value);
        },
    });

    useEffect(() => {
        if (open && user) {
            form.reset({
                firstName: user.first_name ?? "",
                middleName: user.middle_name ?? "",
                lastName: user.last_name ?? "",
                suffix: user.suffix ?? "none",
                region: user.region ?? "",
                province: user.province ?? "",
                cityMunicipality: user.city_municipality ?? "",
                barangay: user.barangay ?? "",
                contactNumber: user.contact_number ?? "",
            });
        }
    }, [open, user]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                    <SquarePen className="h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <Separator />
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <FieldGroup className="grid grid-cols-2">
                            <form.Field name="firstName" validators={{ onChange: required("First name") }}>
                                {(field) => (
                                    <Field>
                                        <FieldLabel>First Name</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Juan"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon><UserRound /></InputGroupAddon>
                                        </InputGroup>
                                        {field.state.meta.errors?.length > 0 && (
                                            <FieldDescription className="text-destructive">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </form.Field>
                            <form.Field name="middleName">
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Middle Name</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Optional"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon><UserRound /></InputGroupAddon>
                                        </InputGroup>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>

                        <FieldGroup className="grid grid-cols-2">
                            <form.Field name="lastName" validators={{ onChange: required("Last name") }}>
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Last Name</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                placeholder="Dela Cruz"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon><UserRound /></InputGroupAddon>
                                        </InputGroup>
                                        {field.state.meta.errors?.length > 0 && (
                                            <FieldDescription className="text-destructive">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </form.Field>
                            <form.Field name="suffix">
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Suffix</FieldLabel>
                                        <Select value={field.state.value} onValueChange={field.handleChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {SUFFIXES.map((s) => (
                                                        <SelectItem key={s} value={s}>
                                                            {s === "none" ? "None" : s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>

                        <Separator className="my-1" />
                        <p className="text-xs font-medium text-muted-foreground">Address</p>

                        <form.Field name="region" validators={{ onChange: required("Region") }}>
                            {(field) => (
                                <Field>
                                    <FieldLabel>Region</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                        />
                                        <InputGroupAddon><MapPin /></InputGroupAddon>
                                    </InputGroup>
                                    {field.state.meta.errors?.length > 0 && (
                                        <FieldDescription className="text-destructive">
                                            {field.state.meta.errors[0]}
                                        </FieldDescription>
                                    )}
                                </Field>
                            )}
                        </form.Field>

                        <FieldGroup className="grid grid-cols-2">
                            <form.Field name="province" validators={{ onChange: required("Province") }}>
                                {(field) => (
                                    <Field>
                                        <FieldLabel>Province</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon><MapPin /></InputGroupAddon>
                                        </InputGroup>
                                        {field.state.meta.errors?.length > 0 && (
                                            <FieldDescription className="text-destructive">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </form.Field>
                            <form.Field name="cityMunicipality" validators={{ onChange: required("City/Municipality") }}>
                                {(field) => (
                                    <Field>
                                        <FieldLabel>City / Municipality</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                            />
                                            <InputGroupAddon><MapPin /></InputGroupAddon>
                                        </InputGroup>
                                        {field.state.meta.errors?.length > 0 && (
                                            <FieldDescription className="text-destructive">
                                                {field.state.meta.errors[0]}
                                            </FieldDescription>
                                        )}
                                    </Field>
                                )}
                            </form.Field>
                        </FieldGroup>

                        <form.Field name="barangay" validators={{ onChange: required("Barangay") }}>
                            {(field) => (
                                <Field>
                                    <FieldLabel>Barangay</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                        />
                                        <InputGroupAddon><MapPin /></InputGroupAddon>
                                    </InputGroup>
                                    {field.state.meta.errors?.length > 0 && (
                                        <FieldDescription className="text-destructive">
                                            {field.state.meta.errors[0]}
                                        </FieldDescription>
                                    )}
                                </Field>
                            )}
                        </form.Field>

                        <Separator className="my-1" />

                        <form.Field name="contactNumber" validators={{ onChange: required("Contact number") }}>
                            {(field) => (
                                <Field>
                                    <FieldLabel>Contact Number</FieldLabel>
                                    <InputGroup>
                                        <InputGroupInput
                                            placeholder="09XXXXXXXXX"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                        />
                                        <InputGroupAddon><Phone /></InputGroupAddon>
                                    </InputGroup>
                                    {field.state.meta.errors?.length > 0 && (
                                        <FieldDescription className="text-destructive">
                                            {field.state.meta.errors[0]}
                                        </FieldDescription>
                                    )}
                                </Field>
                            )}
                        </form.Field>
                    </FieldGroup>

                    <DialogFooter className="mt-6 gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={updateMutation.isPending}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting || updateMutation.isPending}
                                    className="gap-1.5"
                                >
                                    {updateMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            )}
                        </form.Subscribe>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const Profile = () => {
    const { user: storedUser, setUser: setStoredUser } = useAuth();
    const [user, setUser] = useState(storedUser);

    const handleSaved = (updated) => {
        setUser(updated);
        setStoredUser(updated);
    };

    if (!user) {
        return (
            <div className="text-sm text-muted-foreground">
                Unable to load profile. Please refresh.
            </div>
        );
    }

    const fullName = [user.first_name, user.middle_name, user.last_name, user.suffix]
        .filter(Boolean)
        .join(" ");

    return (
        <div className="mx-auto grid w-full max-w-3xl gap-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">My Profile</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Manage your photo and personal information.
                    </p>
                </div>
                <EditProfileDialog user={user} onSaved={handleSaved} />
            </div>

            <AvatarCard user={user} onUpdated={handleSaved} />

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-5 py-3">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Personal Information</h3>
                </div>
                <div className="px-5">
                    <InfoRow label="Full Name" value={fullName} />
                    <Separator />
                    <InfoRow label="First Name" value={user.first_name} />
                    <Separator />
                    <InfoRow label="Middle Name" value={user.middle_name} />
                    <Separator />
                    <InfoRow label="Last Name" value={user.last_name} />
                    <Separator />
                    <InfoRow label="Suffix" value={user.suffix} />
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-5 py-3">
                    <IdCardLanyard className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Account Information</h3>
                </div>
                <div className="px-5">
                    <InfoRow label="Employee ID" value={user.teacher_id} />
                    <Separator />
                    <InfoRow label="Username" value={user.username} />
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 py-2.5 text-sm">
                        <span className="text-muted-foreground">Account Status</span>
                        <span className="flex items-center gap-1.5 font-medium capitalize">
                            <CircleCheck
                                className={
                                    user.status === "active"
                                        ? "h-4 w-4 text-green-600"
                                        : "h-4 w-4 text-muted-foreground"
                                }
                            />
                            {user.status}
                        </span>
                    </div>
                    <Separator />
                    <InfoRow
                        label="Activated"
                        value={
                            user.activated_at
                                ? new Date(user.activated_at).toLocaleDateString()
                                : null
                        }
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-5 py-3">
                    <UserStar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Employment</h3>
                </div>
                <div className="px-5">
                    <InfoRow label="Position" value={user.position} />
                    <Separator />
                    <InfoRow label="Class Advisory" value={user.class_advisory} />
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-5 py-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Address</h3>
                </div>
                <div className="px-5">
                    <InfoRow label="Region" value={user.region} />
                    <Separator />
                    <InfoRow label="Province" value={user.province} />
                    <Separator />
                    <InfoRow label="City / Municipality" value={user.city_municipality} />
                    <Separator />
                    <InfoRow label="Barangay" value={user.barangay} />
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-2 border-b px-5 py-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Contact</h3>
                </div>
                <div className="px-5">
                    <InfoRow label="Contact Number" value={user.contact_number} />
                </div>
            </div>
        </div>
    );
};

export default Profile;
