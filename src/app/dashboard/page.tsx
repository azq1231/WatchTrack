"use client";

import { useMemo } from "react";
import VideoEntryForm from "@/components/video-entry-form";
import VideoList from "@/components/video-list";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where, writeBatch } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const videosCollectionRef = useMemoFirebase(() =>
    user ? collection(firestore, 'users', user.uid, 'videos') : null
  , [firestore, user]);

  const { data: videos, isLoading: isLoadingVideos } = useCollection(videosCollectionRef);

  const handleAddVideo = async (name: string, episode: number) => {
    if (!user || !videosCollectionRef) return;

    // Check if video with the same name already exists
    const existingVideo = videos?.find(v => v.name.toLowerCase() === name.toLowerCase());

    if (existingVideo) {
      handleUpdateVideo(existingVideo.id, { episode });
    } else {
       await addDoc(videosCollectionRef, {
        name,
        episode,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    }
  };

  const handleUpdateVideo = async (id: string, updates: { episode: number }) => {
    if (!user) return;
    const videoDocRef = doc(firestore, 'users', user.uid, 'videos', id);
    await updateDoc(videoDocRef, updates);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!user) return;
    const videoDocRef = doc(firestore, 'users', user.uid, 'videos', id);
    await deleteDoc(videoDocRef);
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
