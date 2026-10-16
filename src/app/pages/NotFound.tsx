import { useNavigate } from 'react';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import { TwoDotLoader } from '../components/TwoDotLoader';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="space-y-6 max-w-md mx-auto">
        <div className="py-8 flex items-center justify-center">
          <TwoDotLoader size={64} />
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