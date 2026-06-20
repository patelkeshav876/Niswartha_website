import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Search, Trash2, ArrowLeft, Image as ImageIcon, Heart } from 'lucide-react';
import { mockPosts } from '../../data/mock';
import { Link } from 'react-router';

export function FeedManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const myPosts = mockPosts.filter(post => post.ashramId === 'ashram-1'); 

  const filteredPosts = myPosts.filter(post => 
    post.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="bg-background sticky top-0 z-10 border-b p-4">
        <div className="flex items-center gap-4 mb-4">
           <Link to="/admin">
             <Button variant="ghost" size="icon" className="-ml-2">
               <ArrowLeft className="h-6 w-6" />
             </Button>
           </Link>
           <h1 className="text-xl font-bold">Manage Feed</h1>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search posts..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredPosts.map(post => (
          <Card key={post.id} className="overflow-hidden border shadow-sm">
            <div className="flex h-32">
              <div className="w-32 h-full bg-gray-100 relative">
                 <img src={post.imageUrl} className="h-full w-full object-cover" alt="Post" />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                   <p className="text-sm line-clamp-3 text-foreground font-medium leading-tight">{post.caption}</p>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3 fill-current text-red-500" />
                      <span>{post.likes} likes</span>
                   </div>
                   <div className="flex gap-2">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredPosts.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
                <p>No posts yet.</p>
            </div>
        )}
      </div>
    </div>
  );
}