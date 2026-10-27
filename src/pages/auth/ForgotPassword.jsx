import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Field,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { 
    KeyRound, 
    Send 
} from 'lucide-react';

const ForgotPassword = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <a href="#" className="text-sm underline-offset-2 hover:underline">
                    Forgot your password?
                </a>
            </DialogTrigger>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Enter your one-time recovery code.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <Field className="space-y-2">
                    <FieldLabel htmlFor="forgot-pass">Recovery Code</FieldLabel>
                    <InputGroup>
                        <InputGroupInput
                            id="forgot-pass"
                            type="text"
                            autoComplete="false"
                            placeholder="0327-1119"
                            required
                        />
                        <InputGroupAddon>
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                        </InputGroupAddon>
                    </InputGroup>
                </Field>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">
                            Close
                        </Button>
                    </DialogClose>
                    <Button variant="default" className="bg-[#3e963f] hover:bg-[#3e963f]">
                        <Send/>
                        Submit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ForgotPassword