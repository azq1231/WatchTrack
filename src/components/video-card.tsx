"use client";

import type { VideoProgress } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog"

type VideoCardProps = {
  video: VideoProgress;
  onUpdate: (id: string, updates: Partial<VideoProgress>) => void;
  onDelete: (id: string) => void;
};

export default function VideoCard({ video, onUpdate, onDelete }: VideoCardProps) {

  const handleIncrement = () => {
    onUpdate(video.id, { episode: video.episode + 1 });
  };

  const handleDecrement = () => {
    if (video.episode > 0) {
      onUpdate(video.id, { episode: video.episode - 1 });
    }
  };

  return (
    <Card className="group relative transition-shadow hover:shadow-lg h-full flex flex-col">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">刪除</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您確定嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作將永久刪除您在「{video.name}」的進度。此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(video.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">刪除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CardHeader>
        <CardTitle className="font-headline pr-10">{video.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-end">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">目前集數</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleDecrement}
              disabled={video.episode === 0}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">減少集數</span>
            </Button>
            <span className="text-2xl font-bold font-mono w-16 text-center tabular-nums">
              {video.episode}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleIncrement}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">增加集數</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
