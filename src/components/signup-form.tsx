"use client";

import { useState } from "react";
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
import { useAuth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  AuthError,
  AuthErrorCodes,
} from "firebase/auth";

const formSchema = z.object({
  phone: z.string().min(10, "請輸入有效的手機號碼。"),
  password: z.string().min(6, "密碼至少需要6個字元。"),
});

const EMAIL_DOMAIN = "watchtrack.app";

export default function SignupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    const email = `${values.phone}@${EMAIL_DOMAIN}`;

    try {
      await createUserWithEmailAndPassword(auth, email, values.password);
      router.push("/dashboard");
    } catch (signUpError) {
      console.error("Sign-up failed:", signUpError);
      const authError = signUpError as AuthError;
      if (authError.code === AuthErrorCodes.EMAIL_EXISTS) {
        setError("這個手機號碼已經被註冊了。");
      } else if (authError.code === AuthErrorCodes.WEAK_PASSWORD) {
        setError("密碼強度不足，請使用至少6個字元。");
      } else {
        setError("註冊時發生無法預期的錯誤，請稍後再試。");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-card/80 backdrop-blur-sm animate-in fade-in-0 zoom-in-95">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            <CardTitle className="font-headline text-3xl">WatchTrack</CardTitle>
        </div>
        <CardDescription>建立您的帳號</CardDescription>
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
                      <Input type="password" placeholder="至少6個字元" {...field} className="pl-10" disabled={isSubmitting} />
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
              {isSubmitting ? "註冊中..." : "註冊"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
