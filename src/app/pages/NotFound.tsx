import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-primary">
          <h1 className="text-8xl font-serif font-bold">404</h1>
          <div className="h-1 w-24 bg-primary mx-auto mt-4 rounded-full" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full gap-2"
            size="lg"
          >
            <Home className="h-5 w-5" />
            Go to Home
          </Button>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}