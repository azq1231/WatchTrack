"use client";

import { useState, useMemo } from "react";
import type { VideoProgress } from "@/lib/types";
import VideoCard from "./video-card";
import { Input } from "./ui/input";
import { Search, Video } from "lucide-react";

type VideoListProps = {
  videos: VideoProgress[];
  onUpdateVideo: (id: string, updates: Partial<VideoProgress>) => void;
  onDeleteVideo: (id: string) => void;
};

export default function VideoList({ videos, onUpdateVideo, onDeleteVideo }: VideoListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [videos, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {videos.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium font-headline">No videos tracked</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a video above to start tracking your progress.
          </p>
        </div>
      )}

      {videos.length > 0 && filteredVideos.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium font-headline">No results found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term.
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
