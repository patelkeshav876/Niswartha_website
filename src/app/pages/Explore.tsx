import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Search, MapPin, ExternalLink } from 'lucide-react';
import { mockAshrams } from '../data/mock';
import { Link } from 'react-router';
import { api } from '../lib/api';
import type { Ashram } from '../types';
import { ScrollReveal } from '../components/ScrollReveal';

export function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [ashrams, setAshrams] = useState<Ashram[]>(mockAshrams);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getAshrams();
        if (data.length > 0) setAshrams(data);
      } catch {
        /* mock */
      }
    })();
  }, []);

  const filteredAshrams = ashrams.filter(ashram => 
    ashram.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ashram.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 py-4 border-b">
        <h1 className="text-2xl font-serif font-bold text-foreground">Discover Ashrams</h1>
        <div className="mt-4 relative">
          <Input 
            placeholder="Search by name or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 rounded-full bg-muted/50 border-none shadow-inner h-12" 
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 pb-24">
        {filteredAshrams.map((ashram) => (
          <ScrollReveal key={ashram.id}>
          <Link to={`/ashram/${ashram.id}`}>
            <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 w-full relative">
                <img src={ashram.imageUrl} alt={ashram.name} className="h-full w-full object-cover" />
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  Verified NGO
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-foreground font-serif">{ashram.name}</h2>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {ashram.location}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{ashram.description}</p>
                <div className="flex gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">Child Care</Badge>
                  <Badge variant="secondary" className="text-xs">Education</Badge>
                  <Badge variant="outline" className="text-xs ml-auto flex items-center gap-1">
                    Visit <ExternalLink className="h-3 w-3" />
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
          </ScrollReveal>
        ))}

        {filteredAshrams.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No ashrams found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}