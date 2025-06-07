import { SignupForm } from "@/components/auth/SignupForm";
import { PharmaTrackIcon } from "@/components/icons";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/10 p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
         <PharmaTrackIcon className="w-8 h-8" />
         <span className="text-xl font-headline">PharmaTrack</span>
       </Link>
      <SignupForm />
    </div>
  );
}
