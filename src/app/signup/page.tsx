import SignupForm from '@/components/signup-form';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export default function SignupPage() {
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
      <SignupForm />
      <div className="mt-4 text-center text-sm text-gray-300">
        已經有帳號了嗎？{' '}
        <Link href="/" className="underline text-white hover:text-gray-200">
          登入
        </Link>
      </div>
    </main>
  );
}
