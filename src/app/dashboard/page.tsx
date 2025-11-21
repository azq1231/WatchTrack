
"use client";

import { useEffect, useState } from "react";
import VideoEntryForm from "@/components/video-entry-form";
import VideoList from "@/components/video-list";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, serverTimestamp, query, where, getDocs, writeBatch } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

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
