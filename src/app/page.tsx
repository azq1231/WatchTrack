import LoginForm from '@/components/login-form';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find((img) => img.id === 'login-background');

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4">
      {loginBg && (
        <Image
          src={loginBg.imageUrl}
          alt={loginBg.description}
          fill
          priority
          className="object-cover -z-10 brightness-[.3]"
          data-ai-hint={loginBg.imageHint}
        />
      )}
      <LoginForm />
      <div className="mt-4 text-center text-sm text-black">
        還沒有帳號嗎？{' '}
        <Link href="/signup" className="underline hover:text-gray-700">
          註冊
        </Link>
      </div>
    </main>
  );
}
