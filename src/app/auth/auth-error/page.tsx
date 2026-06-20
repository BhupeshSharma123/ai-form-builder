import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute -top-[40%] -left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-red-600/20 to-orange-600/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-white/60 mb-6">
            Something went wrong during authentication. The link may be invalid or expired.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600">
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-xl border-white/10 text-white hover:bg-white/10">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
