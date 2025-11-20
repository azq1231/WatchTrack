"use client";

import { useState } from "react";
import type { VideoProgress } from "@/lib/types";
import VideoEntryForm from "@/components/video-entry-form";
import VideoList from "@/components/video-list";
import { useToast } from "@/hooks/use-toast";

const initialVideos: VideoProgress[] = [
    { id: '1', name: 'Stranger Things', episode: 8 },
    { id: '2', name: 'The Witcher', episode: 4 },
    { id: '3', name: 'Arcane', episode: 9 },
    { id: '4', name: 'Breaking Bad', episode: 62 },
];


export default function DashboardPage() {
  const [videos, setVideos] = useState<VideoProgress[]>(initialVideos);
  const { toast } = useToast();

  const handleAddVideo = (name: string, episode: number) => {
    const existingVideo = videos.find(v => v.name.toLowerCase() === name.toLowerCase());
    
    if (existingVideo) {
      handleUpdateVideo(existingVideo.id, { episode });
    } else {
      const newVideo: VideoProgress = {
        id: crypto.randomUUID(),
        name,
        episode,
      };
      setVideos((prev) => [newVideo, ...prev]);
    }
  };

  const handleUpdateVideo = (id: string, updates: Partial<VideoProgress>) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, ...updates } : video
      )
    );
  };

  const handleDeleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== id));
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <VideoEntryForm onAddVideo={handleAddVideo} />
        <VideoList
          videos={videos}
          onUpdateVideo={handleUpdateVideo}
          onDeleteVideo={handleDeleteVideo}
        />
      </div>
    </div>
  );
}
