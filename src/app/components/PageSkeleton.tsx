import { TwoDotLoader } from './TwoDotLoader';

export function PageSkeleton() {
  return (
    <div className="flex min-h-[85vh] w-full items-center justify-center bg-background/50 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <TwoDotLoader size={56} message="Loading Niswartha..." />
      </div>
    </div>
  );
}

