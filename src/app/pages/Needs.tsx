import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { mockNeeds } from '../data/mock';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Link } from 'react-router';
import { api } from '../lib/api';
import type { Need } from '../types';
import { ScrollReveal } from '../components/ScrollReveal';

export function Needs() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [needs, setNeeds] = useState<Need[]>(mockNeeds);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getNeeds();
        if (data.length > 0) setNeeds(data);
      } catch {
        /* mock */
      }
    })();
  }, []);

  const categories = ['All', 'Food', 'Clothes', 'Education', 'Healthcare', 'Other'];

  const filteredNeeds = needs.filter(need => {
    const matchesCategory = filter === 'All' || need.category === filter;
    const matchesSearch = need.title.toLowerCase().includes(search.toLowerCase()) || 
                          need.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-16 lg:top-20 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="section-container py-4 lg:py-6">
          <h1 className="text-2xl font-serif font-bold text-primary mb-4 lg:text-3xl">Urgent Needs</h1>
          
          <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search needs..." 
            className="pl-9 bg-muted/50 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap lg:px-4 lg:py-1.5"
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
        </div>
      </div>

      <div className="section-container py-8 space-y-6 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNeeds.map(need => {
          const goal = Number(need.quantityRequired) || 0;
          const raised = Number(need.quantityFulfilled) || 0;
          const remaining = Math.max(0, goal - raised);
          const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
          return (
          <ScrollReveal key={need.id}>
          <Card className="overflow-hidden border-none shadow-sm bg-card">
            <div className="flex flex-col sm:flex-row gap-4 p-4">
              <div className="relative h-48 sm:h-32 sm:w-32 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={need.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80'} 
                  alt={need.title}
                  className="w-full h-full object-cover"
                />
                {need.urgency === 'high' && (
                  <Badge variant="destructive" className="absolute top-2 right-2">Urgent</Badge>
                )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{need.category}</span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {pct}% funded
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-1">{need.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{need.description}</p>
                  <p className="text-xs font-semibold text-primary mb-1">
                    ₹{remaining.toLocaleString()} left to complete this need
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Goal ₹{goal.toLocaleString()} · Raised ₹{raised.toLocaleString()}
                  </p>
                </div>

                <div>
                  <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden mb-2 mt-2">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${goal > 0 ? Math.min(100, (raised / goal) * 100) : 0}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm" asChild>
                       <Link to={`/donate-flow/${need.ashramId}/${need.id}`}>
                         Donate now
                       </Link>
                    </Button>
                    <Button variant="outline" size="sm">Share</Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          </ScrollReveal>
          );
        })}
        </div>
        {filteredNeeds.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No needs found matching your criteria.</p>
            </div>
        )}
      </div>
    </div>
  );
}