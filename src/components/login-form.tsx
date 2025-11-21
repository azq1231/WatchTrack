"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Clapperboard, Loader2, Phone, KeyRound } from "lucide-react";

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
  AuthError,
} from "firebase/auth";

const formSchema = z.object({
  phone: z.string().min(1, "請輸入您的手機號碼。"),
  password: z.string().min(6, "密碼至少需要6個字元。"),
});

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
      password: "",
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [isUserLoading, user, router]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    const normalizedPhone = values.phone.replace(/\D/g, "");
    const email = `${normalizedPhone}@${EMAIL_DOMAIN}`;

    try {
      await signInWithEmailAndPassword(auth, email, values.password);
      // Successful sign-in will be handled by the useEffect hook
    } catch (signInError) {
      console.error("Login failed", signInError);
      const authError = signInError as AuthError;
      if (authError.code === 'auth/invalid-credential') {
        setError("登入失敗，請檢查您的電話號碼和密碼。");
      } else {
        setError("登入時發生無法預期的錯誤，請稍後再試。");
      }
      setIsSubmitting(false);
    }
  };
  
  if (isUserLoading || user) {
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密碼</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="******" {...field} className="pl-10" disabled={isSubmitting} />
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
