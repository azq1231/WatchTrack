"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Clapperboard, Loader2, Phone } from "lucide-react";

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
import { useAuth, useUser } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
  AuthErrorCodes,
} from "firebase/auth";

const formSchema = z.object({
  phone: z.string().min(10, "請輸入有效的手機號碼。"),
});

// A constant, hidden password for development purposes.
const DEV_PASSWORD = "dev-password-for-testing";
const EMAIL_DOMAIN = "watchtrack.app";

export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    const email = `${values.phone}@${EMAIL_DOMAIN}`;

    try {
      // Try to sign in first.
      await signInWithEmailAndPassword(auth, email, DEV_PASSWORD);
      router.push("/dashboard");
    } catch (signInError) {
      // If the user does not exist, create a new one.
      if ((signInError as AuthError).code === AuthErrorCodes.USER_DELETED) {
         try {
           await createUserWithEmailAndPassword(auth, email, DEV_PASSWORD);
           router.push("/dashboard");
         } catch (signUpError) {
            console.error("Sign-up failed after sign-in attempt:", signUpError);
            setError("登入時發生無法預期的錯誤，請稍後再試。");
            setIsSubmitting(false);
         }
      } else {
        // Handle other sign-in errors
        console.error("Login failed", signInError);
        setError("登入失敗，請檢查您的電話號碼並重試。");
        setIsSubmitting(false);
      }
    }
  };
  
  if (isUserLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (user) {
      router.push('/dashboard');
      return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl">WatchTrack</CardTitle>
        </div>
        <CardDescription>登入以追蹤您的節目</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>手機號碼</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="例如：0912-345-678" {...field} className="pl-10" disabled={isSubmitting} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "登入中..." : "登入"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
