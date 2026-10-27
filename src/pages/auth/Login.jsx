import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
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
    Lock,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";
import LoginImage from "@/assets/LoginBGI.jpg";
import Logo from "@/assets/Logo.png";
import ForgotPassword from "./ForgotPassword";
import { useLogin } from "@/hooks/useAuth";

const Login = ({ className, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const loginMutation = useLogin();

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation.mutate({ username, password });
    };

    return (
        <div className={cn("relative w-screen h-screen overflow-hidden", className)} {...props}>
            <div className="absolute inset-0 z-0">
                <img
                    src={LoginImage}
                    alt="login background image"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-6 md:p-10 z-10 backdrop-blur-xs">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <Card className="overflow-hidden p-0 bg-background/95 shadow-2xl">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <h1 className="text-2xl font-bold">Welcome back, Teacher</h1>
                                        <p className="text-balance text-muted-foreground">
                                            Login to your registered account
                                        </p>
                                    </div>

                                    <Field>
                                        <FieldLabel htmlFor="username">Username</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="username"
                                                type="text"
                                                autoComplete="off"
                                                placeholder="Juan.DelaCruz101"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                            <InputGroupAddon><UserStar /></InputGroupAddon>
                                        </InputGroup>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="off"
                                                placeholder="• • • • • • • •"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
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
                                    </Field>

                                    <div>
                                        <ForgotPassword />
                                    </div>

                                    <Field>
                                        <Button
                                            type="submit"
                                            className="bg-[#3e963f] hover:bg-[#3e963f]"
                                            disabled={loginMutation.isPending}
                                        >
                                            {loginMutation.isPending ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Logging in...
                                                </>
                                            ) : (
                                                "Login"
                                            )}
                                        </Button>
                                    </Field>

                                    <FieldDescription className="text-center">
                                        Don&apos;t have an account?{" "}
                                        <Link to="/activate-account">Activate your account</Link>
                                    </FieldDescription>
                                </FieldGroup>
                            </form>

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
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Login;
