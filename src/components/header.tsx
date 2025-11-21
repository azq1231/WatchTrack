"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clapperboard, LogOut, Settings, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
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
  const { user } = useUser();
  const firestore = useFirestore();

  const videosCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'videos') : null
  , [firestore, user]);

  const { data: videos, isLoading: isLoadingVideos } = useCollection(videosCollectionRef);


  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden items-center md:flex">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">WatchTrack</span>
          </Link>
        </div>
        
        {user && !isLoadingVideos && videos && videos.length > 0 && (
            <div className="hidden items-center gap-3 border-l pl-4 md:flex">
                <Film className="h-6 w-6 text-primary" />
                <h2 className="font-headline text-lg font-semibold">我的影片清單</h2>
                <span className="text-lg font-bold text-primary">{videos.length}</span>
                <span className="text-sm text-muted-foreground">個影片</span>
            </div>
        )}

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
