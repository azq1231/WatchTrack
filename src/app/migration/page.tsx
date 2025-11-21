
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function MigrationPage() {
  const firestore = useFirestore();
  const [oldUid, setOldUid] = useState('');
  const [newUid, setNewUid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleMigration = async () => {
    if (!oldUid || !newUid) {
      setError('舊的 UID 和新的 UID 都是必填項。');
      return;
    }

    if (oldUid === newUid) {
        setError('舊的 UID 和新的 UID 不能相同。');
        return;
    }

    setIsLoading(true);
    setStatus('');
    setError('');

    try {
      const oldVideosRef = collection(firestore, 'users', oldUid, 'videos');
      const snapshot = await getDocs(oldVideosRef);

      if (snapshot.empty) {
        setStatus('舊帳號沒有任何影片進度可供移轉。');
        setIsLoading(false);
        return;
      }

      const batch = writeBatch(firestore);
      let migratedCount = 0;

      snapshot.forEach((videoDoc) => {
        const videoData = videoDoc.data();
        const newVideoRef = doc(collection(firestore, 'users', newUid, 'videos'));
        
        batch.set(newVideoRef, {
          ...videoData,
          userId: newUid, // Update the userId to the new UID
        });
        migratedCount++;
      });
      
      // Optionally, you might want to delete old data. 
      // For safety, we will not delete old data automatically.
      // You can manually delete the old user account later from Firebase Console.

      await batch.commit();

      setStatus(`成功！ ${migratedCount} 筆影片進度已成功從 ${oldUid} 移轉至 ${newUid}。`);
    } catch (e: any) {
      console.error('Migration failed:', e);
      setError(`移轉失敗： ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>使用者資料移轉工具</CardTitle>
          <CardDescription>將影片進度從一個舊帳號移轉到一個新帳號。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>警告：危險操作</AlertTitle>
            <AlertDescription>
              這個工具會直接操作資料庫。在執行前，請務必在 Firebase 後台備份您的資料。移轉完成後，請立即通知開發人員移除此工具並恢復安全規則。
            </AlertDescription>
          </Alert>
        
          <div className="space-y-2">
            <Label htmlFor="oldUid">舊的使用者 UID (來源)</Label>
            <Input
              id="oldUid"
              placeholder="從 Firebase Authentication 複製來源使用者的 UID"
              value={oldUid}
              onChange={(e) => setOldUid(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newUid">新的使用者 UID (目的地)</Label>
            <Input
              id="newUid"
              placeholder="從 Firebase Authentication 複製目標使用者的 UID"
              value={newUid}
              onChange={(e) => setNewUid(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button onClick={handleMigration} disabled={isLoading || !oldUid || !newUid} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? '正在移轉...' : '開始移轉資料'}
          </Button>

          {status && <p className="text-sm text-green-600">{status}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

        </CardContent>
      </Card>
    </main>
  );
}
