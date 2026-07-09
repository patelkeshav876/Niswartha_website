import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Trash, ArrowUp, ArrowDown, Type, Image as ImageIcon, Video, Eye, EyeOff, Layout } from 'lucide-react';
import { ImageUploadWithCamera } from './ImageUploadWithCamera';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video';
  // Text attributes
  text?: string;
  style?: 'h1' | 'h2' | 'h3' | 'paragraph';
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  // Image attributes
  images?: string[];
  layout?: 'single' | 'grid' | 'carousel';
  // Video attributes
  videoUrl?: string;
}

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function RichContentEditor({ blocks, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const addTextBlock = () => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'text',
      text: '',
      style: 'paragraph',
      align: 'left',
      bold: false,
      italic: false
    };
    onChange([...blocks, newBlock]);
  };

  const addImageBlock = () => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'image',
      images: [],
      layout: 'single'
    };
    onChange([...blocks, newBlock]);
  };

  const addVideoBlock = () => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: 'video',
      videoUrl: ''
    };
    onChange([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[nextIndex];
    newBlocks[nextIndex] = temp;
    onChange(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // Converts standard YouTube URLs into embeddable format
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/embed/')) return url;
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return `https://www.youtube.com/embed/${urlParams.get('v')}`;
      }
    } catch {
      // return original on fail
    }
    return url;
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-card text-foreground">
      {/* Editor Header tabs */}
      <div className="flex justify-between items-center bg-muted/40 border-b px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rich Visual Editor</span>
        <div className="flex bg-muted/80 rounded-lg p-0.5 ring-1 ring-border">
          <Button
            type="button"
            size="sm"
            variant={activeTab === 'edit' ? 'default' : 'ghost'}
            className="rounded-md h-7 text-xs px-3"
            onClick={() => setActiveTab('edit')}
          >
            <Plus className="h-3 w-3 mr-1" />
            Build Blocks
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            className="rounded-md h-7 text-xs px-3"
            onClick={() => setActiveTab('preview')}
          >
            <Eye className="h-3 w-3 mr-1" />
            Live Preview
          </Button>
        </div>
      </div>

      {activeTab === 'edit' ? (
        <div className="p-4 space-y-6 min-h-[250px]">
          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border-2 border-dashed border-muted/80 rounded-xl">
              <Layout className="h-10 w-10 text-muted/50 mb-2" />
              <p className="text-sm font-semibold">No blocks yet</p>
              <p className="text-xs max-w-xs mt-1">Stitch together headings, formatted paragraphs, single/multi image slots, or videos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div key={block.id} className="relative border rounded-xl p-4 bg-muted/20 hover:border-primary/20 transition-all flex flex-col gap-3 group">
                  {/* Block Actions */}
                  <div className="absolute right-3 top-3 flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === blocks.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => removeBlock(block.id)}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Header/Info */}
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    {block.type === 'text' && <Type className="h-3.5 w-3.5" />}
                    {block.type === 'image' && <ImageIcon className="h-3.5 w-3.5" />}
                    {block.type === 'video' && <Video className="h-3.5 w-3.5" />}
                    <span className="capitalize">{block.type} Block</span>
                  </div>

                  {/* Block Body Editors */}
                  {block.type === 'text' && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <select
                          value={block.style}
                          onChange={(e) => updateBlock(block.id, { style: e.target.value as any })}
                          className="text-xs bg-card border rounded-md px-2 py-1"
                        >
                          <option value="paragraph">Paragraph Text</option>
                          <option value="h1">Heading 1</option>
                          <option value="h2">Heading 2</option>
                          <option value="h3">Heading 3</option>
                        </select>

                        <select
                          value={block.align}
                          onChange={(e) => updateBlock(block.id, { align: e.target.value as any })}
                          className="text-xs bg-card border rounded-md px-2 py-1"
                        >
                          <option value="left">Align Left</option>
                          <option value="center">Align Center</option>
                          <option value="right">Align Right</option>
                        </select>

                        <div className="flex border rounded-md overflow-hidden bg-card">
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { bold: !block.bold })}
                            className={`px-2 py-1 text-xs font-bold border-r ${block.bold ? 'bg-primary/10 text-primary' : ''}`}
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { italic: !block.italic })}
                            className={`px-2 py-1 text-xs italic ${block.italic ? 'bg-primary/10 text-primary' : ''}`}
                          >
                            I
                          </button>
                        </div>
                      </div>

                      <Textarea
                        value={block.text}
                        onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                        placeholder="Write block content..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  {block.type === 'image' && (
                    <div className="space-y-3 pr-20">
                      <div className="flex gap-2 items-center">
                        <select
                          value={block.layout}
                          onChange={(e) => updateBlock(block.id, { layout: e.target.value as any })}
                          className="text-xs bg-card border rounded-md px-2 py-1"
                        >
                          <option value="single">Single Large Banner</option>
                          <option value="grid">Grid Layout (Multi-image)</option>
                          <option value="carousel">Horizontal Carousel</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {block.images?.map((img, i) => (
                          <div key={i} className="relative aspect-video rounded-lg overflow-hidden border">
                            <img src={img} className="h-full w-full object-cover" alt="" />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                              onClick={() => {
                                const list = [...(block.images || [])];
                                list.splice(i, 1);
                                updateBlock(block.id, { images: list });
                              }}
                            >
                              <Trash className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <ImageUploadWithCamera
                        label="Upload / Capture Image"
                        onImageSelected={(url) => {
                          const list = [...(block.images || []), url];
                          updateBlock(block.id, { images: list });
                        }}
                      />
                    </div>
                  )}

                  {block.type === 'video' && (
                    <div className="space-y-3 pr-20">
                      <Input
                        value={block.videoUrl}
                        onChange={(e) => updateBlock(block.id, { videoUrl: e.target.value })}
                        placeholder="Paste YouTube video link or direct mp4 URL..."
                        className="text-xs"
                      />
                      {block.videoUrl && (
                        <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border">
                          {block.videoUrl.includes('youtube') || block.videoUrl.includes('youtu.be') ? (
                            <iframe
                              src={getEmbedUrl(block.videoUrl)}
                              className="h-full w-full"
                              title="Preview"
                              allowFullScreen
                            />
                          ) : (
                            <video src={block.videoUrl} className="h-full w-full" controls muted />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stacker Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={addTextBlock} className="rounded-xl">
              <Type className="h-3.5 w-3.5 mr-1" />
              Add Text
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addImageBlock} className="rounded-xl">
              <ImageIcon className="h-3.5 w-3.5 mr-1" />
              Add Image Slot
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addVideoBlock} className="rounded-xl">
              <Video className="h-3.5 w-3.5 mr-1" />
              Add Video Embed
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-6 bg-zinc-50 border-t min-h-[250px]">
          {blocks.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">No blocks to preview.</p>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              {blocks.map((block) => {
                if (block.type === 'text') {
                  const textClass = `
                    ${block.style === 'h1' ? 'text-2xl font-bold font-serif md:text-3xl' : ''}
                    ${block.style === 'h2' ? 'text-xl font-bold font-serif md:text-2xl' : ''}
                    ${block.style === 'h3' ? 'text-lg font-bold font-serif' : ''}
                    ${block.style === 'paragraph' ? 'text-sm text-zinc-600 leading-relaxed' : ''}
                    ${block.align === 'center' ? 'text-center' : ''}
                    ${block.align === 'right' ? 'text-right' : ''}
                    ${block.bold ? 'font-bold' : ''}
                    ${block.italic ? 'italic' : ''}
                  `.trim();
                  return (
                    <div key={block.id} className={textClass}>
                      {block.text ? block.text.split('\n').map((para, pIdx) => <p key={pIdx} className="mb-2">{para}</p>) : <span className="text-zinc-300 italic">[Empty text block]</span>}
                    </div>
                  );
                }

                if (block.type === 'image') {
                  if (!block.images || block.images.length === 0) {
                    return (
                      <div key={block.id} className="h-36 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-300 text-xs italic">
                        [Image block - no photos uploaded]
                      </div>
                    );
                  }

                  if (block.layout === 'grid') {
                    return (
                      <div key={block.id} className="grid grid-cols-2 gap-3">
                        {block.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="aspect-square rounded-xl overflow-hidden shadow-sm">
                            <img src={img} className="h-full w-full object-cover hover:scale-105 transition-transform" alt="" />
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (block.layout === 'carousel') {
                    return (
                      <div key={block.id} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {block.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="w-56 h-36 rounded-xl shrink-0 overflow-hidden shadow-sm">
                            <img src={img} className="h-full w-full object-cover" alt="" />
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <div key={block.id} className="rounded-xl overflow-hidden shadow-md max-w-md mx-auto">
                      <img src={block.images[0]} className="w-full object-cover" alt="" />
                    </div>
                  );
                }

                if (block.type === 'video') {
                  if (!block.videoUrl) {
                    return (
                      <div key={block.id} className="h-24 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-300 text-xs italic">
                        [Video block - no link provided]
                      </div>
                    );
                  }
                  return (
                    <div key={block.id} className="aspect-video rounded-xl overflow-hidden shadow-md">
                      {block.videoUrl.includes('youtube') || block.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={getEmbedUrl(block.videoUrl)}
                          className="h-full w-full"
                          title="Embed"
                          allowFullScreen
                        />
                      ) : (
                        <video src={block.videoUrl} className="h-full w-full" controls />
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Visual Renderer for Rich visual blocks. Safe from arbitrary XSS scripting injection.
 */
export function RichBlocksRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks || !Array.isArray(blocks)) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/embed/')) return url;
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return `https://www.youtube.com/embed/${urlParams.get('v')}`;
      }
    } catch {
      // return original
    }
    return url;
  };

  return (
    <div className="space-y-5">
      {blocks.map((block) => {
        if (block.type === 'text') {
          const textClass = `
            ${block.style === 'h1' ? 'text-2xl font-bold font-serif md:text-3xl' : ''}
            ${block.style === 'h2' ? 'text-xl font-bold font-serif md:text-2xl' : ''}
            ${block.style === 'h3' ? 'text-lg font-bold font-serif' : ''}
            ${block.style === 'paragraph' ? 'text-sm text-zinc-600 leading-relaxed font-sans' : ''}
            ${block.align === 'center' ? 'text-center' : ''}
            ${block.align === 'right' ? 'text-right' : ''}
            ${block.bold ? 'font-bold' : ''}
            ${block.italic ? 'italic' : ''}
          `.trim();
          return (
            <div key={block.id} className={textClass}>
              {block.text ? block.text.split('\n').map((para, pIdx) => <p key={pIdx} className="mb-2">{para}</p>) : null}
            </div>
          );
        }

        if (block.type === 'image') {
          if (!block.images || block.images.length === 0) return null;

          if (block.layout === 'grid') {
            return (
              <div key={block.id} className="grid grid-cols-2 gap-3 my-4">
                {block.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="aspect-square rounded-xl overflow-hidden shadow-sm bg-muted">
                    <img src={img} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" alt="" />
                  </div>
                ))}
              </div>
            );
          }

          if (block.layout === 'carousel') {
            return (
              <div key={block.id} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide my-4">
                {block.images.map((img, imgIdx) => (
                  <div key={imgIdx} className="w-56 h-36 rounded-xl shrink-0 overflow-hidden shadow-sm bg-muted">
                    <img src={img} className="h-full w-full object-cover" alt="" />
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={block.id} className="rounded-xl overflow-hidden shadow-md max-w-md mx-auto my-4 bg-muted">
              <img src={block.images[0]} className="w-full object-cover" alt="" />
            </div>
          );
        }

        if (block.type === 'video') {
          if (!block.videoUrl) return null;
          return (
            <div key={block.id} className="aspect-video rounded-xl overflow-hidden shadow-md my-4">
              {block.videoUrl.includes('youtube') || block.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(block.videoUrl)}
                  className="h-full w-full"
                  title="Embed"
                  allowFullScreen
                />
              ) : (
                <video src={block.videoUrl} className="h-full w-full" controls />
              )}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
