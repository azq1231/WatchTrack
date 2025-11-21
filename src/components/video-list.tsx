"use client";

import { useState, useMemo, useEffect } from "react";
import type { VideoProgress } from "@/lib/types";
import VideoCard from "./video-card";
import { Input } from "./ui/input";
import { Search, Video, Loader2, Trash2 } from "lucide-react";
import { useDoc, useFirestore } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
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
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

type VideoListProps = {
  videos: VideoProgress[];
  onUpdateVideo: (id: string, updates: Partial<VideoProgress>) => void;
  onDeleteVideo: (id: string) => void;
};

export default function VideoList({ videos, onUpdateVideo, onDeleteVideo }: VideoListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Firestore reference for the feature flag
  const featureConfigRef = useMemo(() =>
    firestore ? doc(firestore, 'config', 'features') : null
  , [firestore]);
  const { data: featureConfig, isLoading: isLoadingFeatures } = useDoc(featureConfigRef);
  const isDeleteAllEnabled = featureConfig?.isDeleteAllEnabled === true;

  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [videos, searchTerm]);

  const handleDeleteAllVideos = async () => {
    if (!firestore || !videos.length) return;
    const user = videos[0].userId;
    if (!user) return;

    setIsDeletingAll(true);
    try {
      const batch = writeBatch(firestore);
      videos.forEach((video) => {
        const videoRef = doc(firestore, 'users', user, 'videos', video.id);
        batch.delete(videoRef);
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


  return (
    <div className="space-y-6">
      {videos.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋影片名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
           {isDeleteAllEnabled && !isLoadingFeatures && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeletingAll}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>刪除全部</span>
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
      )}


      {videos.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium font-headline">尚未追蹤任何影片</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            在上方新增影片以開始追蹤您的進度。
          </p>
        </div>
      )}

      {videos.length > 0 && filteredVideos.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium font-headline">找不到結果</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            請嘗試不同的搜尋詞。
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVideos.map((video) => (
          <div key={video.id} className="animate-in fade-in-0 zoom-in-95">
            <VideoCard
              video={video}
              onUpdate={onUpdateVideo}
              onDelete={onDeleteVideo}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
