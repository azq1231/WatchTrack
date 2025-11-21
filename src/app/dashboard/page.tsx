"use client";

import { useMemo, useState } from "react";
import VideoEntryForm from "@/components/video-entry-form";
import VideoList from "@/components/video-list";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, writeBatch, query, where, getDocs } from "firebase/firestore";
import { Loader2, Import } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { seedData } from "@/lib/seed-data";
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';


export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const videosCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'videos') : null
  , [firestore, user]);

  const { data: videos, isLoading: isLoadingVideos } = useCollection(videosCollectionRef);

  const handleAddVideo = async (name: string, episode: number) => {
    if (!user || !firestore || !videosCollectionRef) return;
    
    const q = query(videosCollectionRef, where("name", "==", name));

    try {
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
    } catch (error) {
        console.error("Error handling video:", error);
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
  
  const handleImportSeedData = async () => {
    if (!user || !firestore || !videosCollectionRef) return;

    setIsImporting(true);
    try {
      const batch = writeBatch(firestore);
      
      seedData.forEach(video => {
        const docRef = doc(videosCollectionRef);
        batch.set(docRef, {
          ...video,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();

      toast({
        title: "成功！",
        description: "您的影片清單已成功匯入。",
      });
    } catch (error) {
      console.error("Error importing seed data: ", error);
      toast({
        variant: "destructive",
        title: "發生錯誤",
        description: "匯入影片清單時發生問題，請稍後再試。",
      });
    } finally {
      setIsImporting(false);
    }
  };


  if (isUserLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
    router.replace('/');
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const showImportButton = videos && videos.length === 0;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <VideoEntryForm onAddVideo={handleAddVideo} />

        {showImportButton && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center">
            <h3 className="font-headline text-xl font-semibold">要匯入您的觀看清單嗎？</h3>
            <p className="text-sm text-muted-foreground">
              我們注意到您的清單是空的。要從您上次提供的列表中載入影片進度嗎？
            </p>
            <Button onClick={handleImportSeedData} disabled={isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  匯入中...
                </>
              ) : (
                <>
                  <Import className="mr-2 h-4 w-4" />
                  是，請匯入資料
                </>
              )}
            </Button>
          </div>
        )}

        {isLoadingVideos ? (
            <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
           <VideoList
              videos={videos || []}
              onUpdateVideo={handleUpdateVideo}
              onDeleteVideo={handleDeleteVideo}
            />
        )}
      </div>
    </div>
  );
}
