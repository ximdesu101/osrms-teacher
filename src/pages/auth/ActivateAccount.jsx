import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    UserStar,
    User,
    Lock,
    Eye,
    EyeOff,
    Asterisk,
    Loader,
    CircleCheck,
    CircleX,
} from "lucide-react";
import LoginImage from "@/assets/LoginBGI.jpg";
import Logo from "@/assets/Logo.png";
import { TeacherLookup, TeacherActivate } from "@/services/authService";

// How long to wait after the user stops typing before firing the lookup (ms)
const LOOKUP_DEBOUNCE_MS = 600;

const ActivateAccount = ({ className, ...props }) => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [teacherId, setTeacherId] = useState("");
    const [activationCode, setActivationCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    // Auto-filled teacher name (read-only once resolved)
    const [lookedUpName, setLookedUpName] = useState(null); // { first_name, last_name } | null
    const [lookupStatus, setLookupStatus] = useState("idle"); // idle | loading | found | not_found
    const [lookupError, setLookupError] = useState("");

    // Per-field submission errors
    const [fieldErrors, setFieldErrors] = useState({});

    // Debounce ref
    const debounceRef = useRef(null);

    // --- Debounced lookup on teacherId change ---
    useEffect(() => {
        // Reset name whenever the ID changes
        setLookedUpName(null);
        setLookupError("");
        setFieldErrors((prev) => ({ ...prev, teacherId: undefined }));

        if (!teacherId.trim()) {
            setLookupStatus("idle");
            return;
        }

        setLookupStatus("loading");

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const data = await TeacherLookup(teacherId.trim());
                setLookedUpName(data);
                setLookupStatus("found");
                setLookupError("");
            } catch (err) {
                setLookedUpName(null);
                setLookupStatus("not_found");
                const msg = err.response?.data?.message || "Teacher ID not found.";
                setLookupError(msg);
            }
        }, LOOKUP_DEBOUNCE_MS);

        return () => clearTimeout(debounceRef.current);
    }, [teacherId]);

    // --- Activation mutation ---
    const activateMutation = useMutation({
        mutationFn: TeacherActivate,
        onSuccess: (data) => {
            localStorage.setItem("teacher_token", data.token);
            localStorage.setItem("teacher_user", JSON.stringify(data.teacher));
            toast.success(`Account activated! Welcome, ${data.teacher.first_name}.`);
            navigate("/dashboard", { replace: true });
        },
        onError: (err) => {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422 && data?.errors) {
                const keyMap = {
                    teacherId: "teacherId",
                    activationCode: "activationCode",
                    password: "password",
                };
                const mapped = {};
                Object.entries(data.errors).forEach(([k, msgs]) => {
                    mapped[keyMap[k] ?? k] = msgs[0];
                });
                setFieldErrors(mapped);
                return;
            }

            if (status === 409) {
                toast.error(data?.message || "This account is already activated.");
                return;
            }

            toast.error(data?.message || "Activation failed. Please check your details.");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setFieldErrors({});

        if (lookupStatus !== "found") {
            setFieldErrors({ teacherId: "Please enter a valid Teacher ID first." });
            return;
        }

        if (password !== passwordConfirm) {
            setFieldErrors({ password_confirmation: "Passwords do not match." });
            return;
        }

        activateMutation.mutate({
            teacherId: teacherId.trim(),
            firstName: lookedUpName.first_name,
            lastName: lookedUpName.last_name,
            activationCode: activationCode.trim(),
            password,
            password_confirmation: passwordConfirm,
        });
    };

    // Status icon for the Teacher ID field (left side)
    const teacherIdAddon = () => {
        if (lookupStatus === "found") {
            return <CircleCheck className="h-4 w-4 text-green-600" />;
        }

        if (lookupStatus === "not_found") {
            return <CircleX className="h-4 w-4 text-destructive" />;
        }

        return <UserStar className="h-4 w-4 text-muted-foreground" />;
    };

    const restDisabled = lookupStatus !== "found" || activateMutation.isPending;

    return (
        <div className={cn("relative w-screen h-screen overflow-hidden", className)} {...props}>
            <div className="absolute inset-0 z-0">
                <img src={LoginImage} alt="login background image" className="w-full h-full object-cover" />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-6 md:p-10 z-10 backdrop-blur-xs">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <Card className="overflow-hidden p-0 bg-background/95 shadow-2xl">
                        <CardContent className="grid p-0 md:grid-cols-2">

                            {/* Left panel — branding */}
                            <div className="relative hidden bg-[#0b7a3b] text-teal-50 md:flex md:flex-col md:items-center md:justify-center p-8 text-center space-y-4">
                                <div className="h-35 w-35 rounded-full shadow-inner">
                                    <img src={Logo} alt="tagnao-logo" />
                                </div>
                                <div className="space-y-2 max-w-sm">
                                    <h2 className="text-2xl font-bold tracking-tight text-white">
                                        Welcome to Tagnao Elementary School
                                    </h2>
                                    <p className="text-sm text-teal-100/90 leading-relaxed">
                                        School Records Management System
                                    </p>
                                </div>
                            </div>

                            {/* Right panel — form */}
                            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <h1 className="text-2xl font-bold">Activate Your Account</h1>
                                        <p className="text-balance text-muted-foreground">
                                            Enter your assigned Teacher ID — your name will be verified automatically.
                                        </p>
                                    </div>

                                    {/* Teacher ID with live lookup indicator */}
                                    <Field>
                                        <FieldLabel htmlFor="teacher-id">Teacher ID</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="teacher-id"
                                                type="text"
                                                autoComplete="off"
                                                placeholder="26-0001"
                                                value={teacherId}
                                                onChange={(e) => setTeacherId(e.target.value)}
                                                required
                                            />

                                            {/* Left: Status icon */}
                                            <InputGroupAddon align="inline-start">
                                                {teacherIdAddon()}
                                            </InputGroupAddon>

                                            {/* Right: Loading spinner */}
                                            {lookupStatus === "loading" && (
                                                <InputGroupAddon align="inline-end">
                                                    <Loader className="size-4 animate-spin text-muted-foreground" />
                                                </InputGroupAddon>
                                            )}
                                        </InputGroup>

                                        {lookupStatus === "not_found" && (
                                            <FieldDescription className="text-destructive">
                                                {lookupError}
                                            </FieldDescription>
                                        )}

                                        {fieldErrors.teacherId && (
                                            <FieldDescription className="text-destructive">
                                                {fieldErrors.teacherId}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Auto-filled First + Last name — always visible, read-only when found */}
                                    <FieldGroup className="grid grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="firstname">First Name</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="firstname"
                                                    type="text"
                                                    placeholder="Auto-filled"
                                                    value={lookedUpName?.first_name ?? ""}
                                                    readOnly
                                                    className={
                                                        lookupStatus === "found"
                                                            ? "text-foreground cursor-not-allowed"
                                                            : "text-muted-foreground cursor-not-allowed"
                                                    }
                                                />
                                                <InputGroupAddon>
                                                    {lookupStatus === "found"
                                                        ? <CircleCheck className="h-4 w-4 text-green-600" />
                                                        : <User className="text-muted-foreground" />
                                                    }
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="lastname">Last Name</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="lastname"
                                                    type="text"
                                                    placeholder="Auto-filled"
                                                    value={lookedUpName?.last_name ?? ""}
                                                    readOnly
                                                    className={
                                                        lookupStatus === "found"
                                                            ? "text-foreground cursor-not-allowed"
                                                            : "text-muted-foreground cursor-not-allowed"
                                                    }
                                                />
                                                <InputGroupAddon>
                                                    {lookupStatus === "found"
                                                        ? <CircleCheck className="h-4 w-4 text-green-600" />
                                                        : <User className="text-muted-foreground" />
                                                    }
                                                </InputGroupAddon>
                                            </InputGroup>
                                        </Field>
                                    </FieldGroup>

                                    {/* Activation code */}
                                    <Field>
                                        <FieldLabel htmlFor="code">One-time Activation Code</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="code"
                                                type="text"
                                                autoComplete="off"
                                                placeholder="XXXX-XXXX"
                                                value={activationCode}
                                                onChange={(e) => {
                                                    setActivationCode(e.target.value);
                                                    setFieldErrors((p) => ({ ...p, activationCode: undefined }));
                                                }}
                                                disabled={restDisabled}
                                                required
                                            />
                                            <InputGroupAddon><Asterisk /></InputGroupAddon>
                                        </InputGroup>
                                        {fieldErrors.activationCode && (
                                            <FieldDescription className="text-destructive">
                                                {fieldErrors.activationCode}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Password + Confirm */}
                                    <FieldGroup className="grid grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    placeholder="• • • • • • • •"
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(e.target.value);
                                                        setFieldErrors((p) => ({ ...p, password: undefined }));
                                                    }}
                                                    disabled={restDisabled}
                                                    required
                                                />
                                                <InputGroupAddon><Lock /></InputGroupAddon>
                                                <InputGroupAddon align="inline-end">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                aria-label="Toggle password visibility"
                                                                onClick={() => setShowPassword((p) => !p)}
                                                                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                                            >
                                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{showPassword ? "Hide password" : "Show password"}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            {fieldErrors.password && (
                                                <FieldDescription className="text-destructive">
                                                    {fieldErrors.password}
                                                </FieldDescription>
                                            )}
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                                            <InputGroup>
                                                <InputGroupInput
                                                    id="confirm-password"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    placeholder="• • • • • • • •"
                                                    value={passwordConfirm}
                                                    onChange={(e) => {
                                                        setPasswordConfirm(e.target.value);
                                                        setFieldErrors((p) => ({ ...p, password_confirmation: undefined }));
                                                    }}
                                                    disabled={restDisabled}
                                                    required
                                                />
                                                <InputGroupAddon><Lock /></InputGroupAddon>
                                                <InputGroupAddon align="inline-end">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                aria-label="Toggle confirm password visibility"
                                                                onClick={() => setShowConfirmPassword((p) => !p)}
                                                                className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                                                            >
                                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{showConfirmPassword ? "Hide password" : "Show password"}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            {fieldErrors.password_confirmation && (
                                                <FieldDescription className="text-destructive">
                                                    {fieldErrors.password_confirmation}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    </FieldGroup>

                                    <Field>
                                        <Button
                                            type="submit"
                                            className="bg-[#3e963f] hover:bg-[#3e963f]"
                                            disabled={lookupStatus !== "found" || activateMutation.isPending}
                                        >
                                            {activateMutation.isPending ? (
                                                <>
                                                    <Loader className="h-4 w-4 animate-spin" />
                                                    Activating...
                                                </>
                                            ) : (
                                                "Activate Account"
                                            )}
                                        </Button>
                                    </Field>

                                    <FieldDescription className="text-center">
                                        Already have an account?{" "}
                                        <Link to="/">Login your account</Link>
                                    </FieldDescription>
                                </FieldGroup>
                            </form>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ActivateAccount;
