export function PageSkeleton() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-background/50 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <img
            src="/logo.png"
            alt="Niswartha"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          Loading Niswartha...
        </p>
      </div>
    </div>
  );
}

