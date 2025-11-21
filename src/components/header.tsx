"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ChangePasswordForm from "./change-password-form";

export default function Header() {
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">WatchTrack</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="帳號設定"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>帳號設定</DialogTitle>
                <DialogDescription>
                  在這裡變更您的密碼。
                </DialogDescription>
              </DialogHeader>
              <ChangePasswordForm />
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="登出"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
