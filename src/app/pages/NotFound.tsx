import { useNavigate } from 'react';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 shadow-inner">
          <img
            src="/logo.png"
            alt="Niswartha"
            width={72}
            height={72}
            className="h-20 w-20 object-contain"
          />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-serif font-bold text-foreground">404 - Page Not Found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for doesn't exist or has been moved to another location.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/')} 
            className="flex-1 gap-2 rounded-full h-11"
            size="lg"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="flex-1 gap-2 rounded-full h-11"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}