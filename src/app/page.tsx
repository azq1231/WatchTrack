import LoginForm from '@/components/login-form';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
    </main>
  );
}
