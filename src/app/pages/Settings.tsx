import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    notifications: {
      email: true,
      push: true,
      updates: false,
    },
  });

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-serif font-bold">Settings</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Profile Photo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {currentUser?.name ? currentUser.name.charAt(0) : '?'}
              </div>
              <Button
                size="icon"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Change Photo</p>
              <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB</p>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={formData.notifications.email}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, email: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get push notifications</p>
              </div>
              <Switch
                checked={formData.notifications.push}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, push: checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ashram Updates</p>
                <p className="text-sm text-muted-foreground">News from saved ashrams</p>
              </div>
              <Switch
                checked={formData.notifications.updates}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    notifications: { ...formData.notifications, updates: checked },
                  })
                }
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Privacy & Security</h2>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Terms of Service
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <Button className="w-full gap-2 h-12" onClick={handleSave}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </main>
    </div>
  );
}
