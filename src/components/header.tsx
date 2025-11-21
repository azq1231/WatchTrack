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
import AccountSettings from "./account-settings";
import { ScrollArea } from "./ui/scroll-area";

export default function Header() {
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();

  const videosCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'videos') : null
  , [firestore, user]);

  const { data: videos, isLoading: isLoadingVideos } = useCollection(videosCollectionRef);

  const userPhoneNumber = user?.email?.split('@')[0] ?? '';

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Clapperboard className="h-6 w-6 text-primary" />
            <span className="hidden font-bold font-headline text-lg sm:inline-block">WatchTrack</span>
          </Link>
        </div>
        
        {user && !isLoadingVideos && videos && (
            <div className="flex items-center gap-2 border-l pl-3 sm:pl-4">
                <Film className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                <div className="flex items-baseline gap-2">
                  <h2 className="font-headline text-md sm:text-lg font-semibold">{userPhoneNumber}<span className="hidden md:inline">的清單</span></h2>
                  <span className="text-lg sm:text-xl font-bold text-primary">{videos.length}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline-block">個影片</span>
                </div>
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
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>帳號設定</DialogTitle>
                <DialogDescription>
                  管理您的帳號資訊、密碼與資料。
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh] overflow-y-auto py-4 pr-4">
                <AccountSettings videos={videos || []} />
              </ScrollArea>
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
