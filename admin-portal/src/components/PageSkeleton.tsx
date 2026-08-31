import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export function PageSkeleton() {
  return (
    <div className="flex min-h-[65vh] w-full items-center justify-center bg-background/50 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-32 h-32 flex items-center justify-center">
          <DotLottieReact
            src="https://lottie.host/f1920018-4203-4927-a43e-aa0bff45eb09/I8cwfrA9rp.json"
            loop
            autoplay
          />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Loading Niswartha...
        </p>
      </div>
    </div>
  );
}
