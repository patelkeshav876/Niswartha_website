import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Calendar } from 'lucide-react';
import { api } from '../lib/api';
import { mockAshrams } from '../data/mock';
import type { Album } from '../types';

export function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lightbox state
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await api.getAlbums();
        if (data.length > 0) {
          setAlbums(data);
        } else {
          // Fallback mock albums
          const ashram = mockAshrams[0];
          const mockData: Album[] = [
            {
              id: 'album-1',
              name: 'Industrial Institute campus',
              description: 'Campus buildings, workshop classrooms, and our deaf & dumb vocational training areas.',
              coverUrl: ashram.imageUrl,
              images: ashram.gallery || [ashram.imageUrl],
              createdAt: new Date().toISOString(),
            },
            {
              id: 'album-2',
              name: 'Student Activities',
              description: 'Our speech-therapy sessions, computer classes, yoga training, and classroom learning.',
              coverUrl: ashram.gallery?.[1] || ashram.imageUrl,
              images: ashram.gallery || [ashram.imageUrl],
              createdAt: new Date().toISOString(),
            },
            {
              id: 'album-3',
              name: 'Celebrations & Events',
              description: 'Moments of festival functions, drawing competitions, and visits from special volunteers.',
              coverUrl: ashram.gallery?.[2] || ashram.imageUrl,
              images: ashram.gallery || [ashram.imageUrl],
              createdAt: new Date().toISOString(),
            }
          ];
          setAlbums(mockData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlbums();
  }, []);

  const openLightbox = (album: Album, index: number) => {
    setActiveAlbum(album);
    setPhotoIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setActiveAlbum(null);
    document.body.style.overflow = 'unset';
  };

  const nextPhoto = () => {
    if (!activeAlbum) return;
    setPhotoIndex((prev) => (prev + 1) % activeAlbum.images.length);
  };

  const prevPhoto = () => {
    if (!activeAlbum) return;
    setPhotoIndex((prev) => (prev - 1 + activeAlbum.images.length) % activeAlbum.images.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeAlbum) return;
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAlbum]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative py-16 bg-[#0F6D4E] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="section-container relative text-center space-y-3">
          <h1 className="text-3xl font-bold font-serif sm:text-4xl md:text-5xl">Photo Gallery</h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm sm:text-base">
            Take a look inside the daily life, events, and activities at Niswartha orphanage and deaf school.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="section-container py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {albums.map((album) => (
              <div key={album.id} className="space-y-6">
                <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 font-serif">{album.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{album.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0F6D4E] bg-emerald-50 px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {album.images.length} Photos
                  </div>
                </div>

                {/* Images grid inside album */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {album.images.map((imgUrl, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openLightbox(album, idx)}
                      className="relative group aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer shadow-sm border border-zinc-100/50"
                    >
                      <img
                        src={imgUrl}
                        alt={`${album.name} image ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="text-xs text-white font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                          View Large
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeAlbum && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between p-4 sm:p-6 text-white bg-gradient-to-b from-black/50 to-transparent">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold truncate">{activeAlbum.name}</h3>
                <p className="text-xs text-white/60">
                  Photo {photoIndex + 1} of {activeAlbum.images.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="text-white hover:bg-white/10 rounded-full h-10 w-10 shrink-0"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Main Picture Frame */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {/* Image Container with key to trigger animation on photo switch */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={photoIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  src={activeAlbum.images[photoIndex]}
                  alt="Gallery large preview"
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl select-none"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {activeAlbum.images.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail slider (Desktop only) */}
            <div className="hidden md:block p-6 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex justify-center gap-2 overflow-x-auto py-2 max-w-3xl mx-auto">
                {activeAlbum.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoIndex(idx)}
                    className={cn(
                      'relative h-14 w-14 rounded-lg overflow-hidden shrink-0 transition-all border-2',
                      photoIndex === idx ? 'border-primary scale-105' : 'border-transparent opacity-55 hover:opacity-100'
                    )}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility classname merger
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
