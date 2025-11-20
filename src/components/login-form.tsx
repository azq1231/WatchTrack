"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Clapperboard, KeyRound, Loader2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number."),
  otp: z.string().length(6, "OTP must be 6 digits."),
});

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      otp: "",
    },
  });

  const handleSendOtp = async () => {
    const phoneValid = await form.trigger("phone");
    if (!phoneValid) {
      form.setFocus("phone");
      return;
    }
    setIsSendingOtp(true);
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setIsSendingOtp(false);
      form.setFocus("otp");
    }, 1500);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    // Simulate API call and validation
    setTimeout(() => {
      // In a real app, you'd verify the OTP here.
      // For this demo, we'll always succeed.
      console.log("Login successful with values:", values);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl">WatchTrack</CardTitle>
        </div>
        <CardDescription>Log in to track your shows</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g., 555-123-4567" {...field} className="pl-10" disabled={otpSent || isSendingOtp} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {otpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in-0">
                    <FormLabel>One-Time Password (OTP)</FormLabel>
                    <FormControl>
                      <div className="relative">
                         <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Enter 6-digit OTP" {...field} className="pl-10" disabled={isLoggingIn} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!otpSent ? (
              <Button type="button" onClick={handleSendOtp} className="w-full" disabled={isSendingOtp}>
                {isSendingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSendingOtp ? "Sending..." : "Send OTP"}
              </Button>
            ) : (
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoggingIn ? "Logging in..." : "Login"}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
