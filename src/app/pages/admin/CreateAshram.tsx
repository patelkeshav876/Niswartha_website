import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  ArrowLeft, 
  Save,
  Upload,
  Home,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function CreateAshram() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    phone: '',
    email: '',
    website: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to create ashram
    console.log('Creating ashram:', formData);
    navigate('/admin/ashrams');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin/ashrams')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Add New Ashram</h1>
            <p className="text-xs text-muted-foreground">Create orphanage profile</p>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
          {/* Image Upload */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <Label className="text-sm font-bold mb-3 block">Profile Image</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Upload ashram photo</p>
                <p className="text-xs text-muted-foreground mb-3">JPG, PNG up to 5MB</p>
                <Button type="button" size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Basic Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Ashram Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter ashram name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="City, State"
                    className="pl-10"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about the ashram..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Provide a brief description of the ashram's mission and activities
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold mb-3">Contact Information</h3>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@ashram.org"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm">Website (Optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://ashram.org"
                    className="pl-10"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Section */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-bold mb-3">Photo Gallery</h3>
              <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/50">
                <ImageIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Upload gallery photos</p>
                <p className="text-xs text-muted-foreground mb-3">Add multiple photos (up to 10)</p>
                <Button type="button" size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/admin/ashrams')}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              Save Ashram
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
