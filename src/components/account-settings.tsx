"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { KeyRound, Loader2, Download, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { updatePassword, AuthError } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "./ui/separator";
import type { VideoProgress } from "@/lib/types";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";

const passwordFormSchema = z.object({
    newPassword: z.string().min(6, "新密碼至少需要6個字元。"),
    confirmPassword: z.string().min(6, "確認密碼至少需要6個字元。"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "兩次輸入的密碼不一致。",
    path: ["confirmPassword"],
});

type AccountSettingsProps = {
    videos: VideoProgress[];
};

export default function AccountSettings({ videos }: AccountSettingsProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!user) {
        setPasswordError("無法變更密碼，請重新登入後再試。");
        return;
    }
    
    setIsSubmittingPassword(true);
    setPasswordError(null);

    try {
      await updatePassword(user, values.newPassword);
      toast({
        title: "成功！",
        description: "您的密碼已成功更新。",
      });
      passwordForm.reset();
    } catch (updateError) {
      const authError = updateError as AuthError;
      if (authError.code === 'auth/requires-recent-login') {
         setPasswordError("此為敏感操作，請重新登入後再試。");
      } else {
        console.error("Password update failed", updateError);
        setPasswordError("密碼更新失敗，請稍後再試。");
      }
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleExport = () => {
    if (!videos || videos.length === 0) {
        toast({
            variant: "destructive",
            title: "沒有資料可匯出",
            description: "您的帳號中沒有任何影片進度。",
        });
        return;
    }

    const dataToExport = videos.map(({ name, episode }) => ({ name, episode }));
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "watchtrack_data.json";
    link.click();
    link.remove();
     toast({
        title: "匯出成功",
        description: `已將 ${videos.length} 筆影片進度匯出。`,
      });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !firestore) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                 throw new Error("無法讀取檔案內容。");
            }
            const importedData: Omit<VideoProgress, 'id' | 'userId' | 'createdAt'>[] = JSON.parse(text);

            if (!Array.isArray(importedData)) {
                throw new Error("檔案格式不正確，應為一個陣列。");
            }

            const batch = writeBatch(firestore);
            const userVideosRef = collection(firestore, 'users', user.uid, 'videos');
            
            let importCount = 0;

            for (const item of importedData) {
                // Basic validation for the imported item
                if (typeof item.name !== 'string' || typeof item.episode !== 'number') {
                    console.warn("略過格式不符的項目:", item);
                    continue;
                }
                
                const newDocRef = doc(userVideosRef); // Create a new document reference for each item
                batch.set(newDocRef, { ...item, userId: user.uid, createdAt: serverTimestamp() });
                importCount++;
            }
            
            await batch.commit();

            toast({
                title: "匯入成功！",
                description: `成功匯入了 ${importCount} 筆影片進度。頁面將會自動重新整理。`,
            });
            // Use a short delay before reloading to allow the user to read the toast.
            setTimeout(() => window.location.reload(), 1500);

        } catch (error: any) {
            console.error("Import failed:", error);
            toast({
                variant: "destructive",
                title: "匯入失敗",
                description: error.message || "處理檔案時發生錯誤。請確認檔案格式正確，並在匯入前清空現有資料。",
            });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    reader.readAsText(file);
  };


  return (
    <div className="space-y-4">
        {/* Data Management Section */}
        <div className="space-y-4">
            <h4 className="font-medium">資料管理</h4>
             <div className="p-4 border rounded-lg space-y-4">
                <p className="text-sm text-muted-foreground">
                    您可以將所有影片進度匯出成一個JSON檔案作為備份，或是在新帳號中匯入。匯入前請先刪除新帳號的所有資料以避免重複。
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        匯出進度
                    </Button>

                    <Button onClick={handleImportClick} variant="outline" className="w-full sm:w-auto" disabled={isImporting}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        匯入進度
                    </Button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                        accept=".json"
                    />
                </div>
            </div>
        </div>

        <Separator />
        
        {/* Change Password Section */}
        <div className="space-y-2">
            <h4 className="font-medium">變更密碼</h4>
             <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>新密碼</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="至少6個字元" {...field} className="pl-10" disabled={isSubmittingPassword} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>確認新密碼</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="再次輸入新密碼" {...field} className="pl-10" disabled={isSubmittingPassword} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {passwordError && <p className="text-sm font-medium text-destructive">{passwordError}</p>}
                <Button type="submit" disabled={isSubmittingPassword}>
                  {isSubmittingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmittingPassword ? "更新中..." : "更新密碼"}
                </Button>
              </form>
            </Form>
        </div>
    </div>
  );
}
