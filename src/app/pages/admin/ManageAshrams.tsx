import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  ArrowLeft, 
  Plus, 
  Home,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Search,
  Eye,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockAshrams } from '../../data/mock';

export function ManageAshrams() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const ashrams = mockAshrams;

  const filteredAshrams = ashrams.filter(ashram =>
    ashram.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ashram.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/admin')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Manage Ashrams</h1>
            <p className="text-xs text-muted-foreground">Add and manage orphanages</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search ashrams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <main className="flex-1 p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Home className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{ashrams.length}</p>
              <p className="text-xs text-muted-foreground">Total Ashrams</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <Eye className="h-5 w-5 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">1.2k</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <Button 
          className="w-full mb-6 h-12 gap-2"
          onClick={() => navigate('/admin/ashrams/create')}
        >
          <Plus className="h-5 w-5" />
          Add New Ashram
        </Button>

        {/* Ashrams List */}
        <div className="space-y-4">
          {filteredAshrams.map((ashram) => (
            <Card key={ashram.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={ashram.imageUrl} 
                      alt={ashram.name}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-3 pr-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">{ashram.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="h-3 w-3" />
                          <span>{ashram.location}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        Active
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{ashram.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{ashram.contact.email}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs flex-1"
                        onClick={() => navigate(`/admin/ashrams/edit/${ashram.id}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs px-2 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAshrams.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <Home className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">No ashrams found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search</p>
          </Card>
        )}
      </main>
    </div>
  );
}
