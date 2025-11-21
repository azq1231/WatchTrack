
"use client";

import { useEffect, useState } from "react";
import VideoEntryForm from "@/components/video-entry-form";
import VideoList from "@/components/video-list";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, query, where, getDocs, writeBatch } from "firebase/firestore";
import { Loader2, Film, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ** 功能開關 **
// 設定為 true 來顯示「刪除所有影片」按鈕，設定為 false 來隱藏它。
const ENABLE_DELETE_ALL = true;

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [isUserLoading, user, router]);


  const videosCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'videos') : null
  , [firestore, user]);

  const { data: videos, isLoading: isLoadingVideos } = useCollection(videosCollectionRef);

  const handleAddVideo = async (name: string, episode: number) => {
    if (!user || !firestore || !videosCollectionRef) return;
    
    const q = query(videosCollectionRef, where("name", "==", name));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        // Update existing video
        const videoDoc = querySnapshot.docs[0];
        handleUpdateVideo(videoDoc.id, { episode });
    } else {
        // Add new video
        addDocumentNonBlocking(videosCollectionRef, {
            name,
            episode,
            userId: user.uid,
            createdAt: serverTimestamp()
        });
    }
  };

  const handleUpdateVideo = (id: string, updates: { episode: number }) => {
    if (!user || !firestore) return;
    const videoDocRef = doc(firestore, 'users', user.uid, 'videos', id);
    updateDocumentNonBlocking(videoDocRef, updates);
  };

  const handleDeleteVideo = (id: string) => {
    if (!user || !firestore) return;
    const videoDocRef = doc(firestore, 'users', user.uid, 'videos', id);
    deleteDocumentNonBlocking(videoDocRef);
  };

  const handleDeleteAllVideos = async () => {
    if (!user || !firestore || !videosCollectionRef) return;
    setIsDeletingAll(true);
    try {
      const querySnapshot = await getDocs(videosCollectionRef);
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast({
        title: "成功！",
        description: "您的所有影片進度都已刪除。",
      });
    } catch (error) {
      console.error("Error deleting all videos: ", error);
      toast({
        variant: "destructive",
        title: "發生錯誤",
        description: "刪除所有影片時發生問題，請稍後再試。",
      });
    } finally {
      setIsDeletingAll(false);
    }
  };
  

  if (isUserLoading || !user) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <VideoEntryForm onAddVideo={handleAddVideo} />

        {isLoadingVideos ? (
            <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
          <>
            {videos && videos.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <Film className="h-6 w-6 text-primary" />
                  <h2 className="font-headline text-xl font-semibold">我的影片清單</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{videos.length}</p>
                    <p className="text-xs text-muted-foreground">個影片</p>
                  </div>
                  {ENABLE_DELETE_ALL && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" disabled={isDeletingAll}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>您確定要刪除所有進度嗎？</AlertDialogTitle>
                          <AlertDialogDescription>
                            這個操作將會永久刪除您所有的影片追蹤記錄，而且無法復原。您確定要繼續嗎？
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAllVideos}
                            disabled={isDeletingAll}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeletingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            確定刪除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            )}
           <VideoList
              videos={videos || []}
              onUpdateVideo={handleUpdateVideo}
              onDeleteVideo={handleDeleteVideo}
            />
          </>
        )}
      </div>
    </div>
  );
}
