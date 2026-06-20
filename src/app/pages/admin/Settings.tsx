import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ArrowLeft, User, Bell, Shield, LogOut } from 'lucide-react';

export function Settings() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-background sticky top-0 z-10 border-b p-4">
        <div className="flex items-center gap-4">
           <Link to="/admin">
             <Button variant="ghost" size="icon" className="-ml-2">
               <ArrowLeft className="h-6 w-6" />
             </Button>
           </Link>
           <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Account</h2>
          <Card className="border-none shadow-sm overflow-hidden">
             <div className="divide-y">
                <div className="p-4 flex items-center justify-between hover:bg-muted/30 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-medium">Profile Details</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-muted/30 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Privacy & Security</span>
                  </div>
                </div>
             </div>
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Preferences</h2>
          <Card className="border-none shadow-sm overflow-hidden">
             <div className="divide-y">
                <div className="p-4 flex items-center justify-between hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <span className="font-medium">Notifications</span>
                  </div>
                  {/* Toggle would go here */}
                  <span className="text-xs text-primary font-bold">ON</span>
                </div>
             </div>
          </Card>
        </section>

        <div className="pt-4">
           <Button variant="destructive" className="w-full">
             <LogOut className="h-4 w-4 mr-2" />
             Log Out
           </Button>
        </div>
      </div>
    </div>
  );
}