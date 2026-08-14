import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Sparkles,
  Plus,
  Move,
  Save,
  Trash2,
  Maximize2,
  Check,
  Palette,
  RotateCw,
  Eye,
  Layers,
} from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import type { ProfileFreeElement, DesignTemplate } from '../pages/Profile';

export function ThemePaletteStudio() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Studio states
  const [dragMode, setDragMode] = useState(true);
  const [bgUrl, setBgUrl] = useState('/f1-flag.jpg');
  const [bgPosX, setBgPosX] = useState(50);
  const [bgPosY, setBgPosY] = useState(50);
  const [bgZoom, setBgZoom] = useState(125);
  const [bgOpacity, setBgOpacity] = useState(0.9);
  const [bgRotation, setBgRotation] = useState(0);

  const [customElements, setCustomElements] = useState<ProfileFreeElement[]>([]);
  const [selectedElemId, setSelectedElemId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // Pointer drag tracking
  const [isDraggingBg, setIsDraggingBg] = useState(false);
  const [draggingElemId, setDraggingElemId] = useState<string | null>(null);
  const [resizingElemId, setResizingElemId] = useState<string | null>(null);

  const dragStartRef = useRef<{ x: number; y: number; initPosX: number; initPosY: number }>({
    x: 0,
    y: 0,
    initPosX: 50,
    initPosY: 50,
  });

  const resizeStartRef = useRef<{ x: number; y: number; initWidth: number }>({
    x: 0,
    initWidth: 160,
  });

  useEffect(() => {
    void api.getConfig().then((cfg) => {
      setConfig(cfg);
      if (cfg?.profileBgUrl) setBgUrl(cfg.profileBgUrl);
      if (cfg?.profileBgPosX !== undefined) setBgPosX(Number(cfg.profileBgPosX));
      if (cfg?.profileBgPosY !== undefined) setBgPosY(Number(cfg.profileBgPosY));
      if (cfg?.profileBgZoom !== undefined) setBgZoom(Number(cfg.profileBgZoom));
      if (cfg?.profileOverlayOpacity !== undefined) setBgOpacity(Number(cfg.profileOverlayOpacity));
      if (cfg?.profileBgRotation !== undefined) setBgRotation(Number(cfg.profileBgRotation));

      if (Array.isArray(cfg?.profileTemplates)) {
        setTemplates(cfg.profileTemplates);
      }

      if (Array.isArray(cfg?.profileCustomElements) && cfg.profileCustomElements.length > 0) {
        setCustomElements(cfg.profileCustomElements);
      } else {
        const defaultCarUrl = cfg?.profileCarUrl || '/f1-car.png';
        setCustomElements([
          {
            id: 'car_main',
            url: defaultCarUrl,
            x: 82,
            y: 72,
            width: 190,
            rotation: 0,
            opacity: 1.0,
            cropTop: 0,
            cropBottom: 0,
            cropLeft: 0,
            cropRight: 0,
          },
        ]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Handle Adding New Free-Size Image
  const handleAddCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newElem: ProfileFreeElement = {
          id: `elem_${Date.now()}`,
          url: reader.result,
          x: 50,
          y: 50,
          width: 180,
          rotation: 0,
          opacity: 1.0,
          cropTop: 0,
          cropBottom: 0,
          cropLeft: 0,
          cropRight: 0,
        };
        setCustomElements((prev) => [...prev, newElem]);
        setSelectedElemId(newElem.id);
        toast.success('New free-size layer added to Theme Studio!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBgUrl(reader.result);
        toast.success('Background photo updated!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Pointer Down for Canvas & Corner Handles
  const handlePointerDown = (
    e: React.PointerEvent,
    elemId?: string,
    actionType: 'move' | 'resize' = 'move'
  ) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    e.stopPropagation();

    if (elemId) {
      setSelectedElemId(elemId);

      if (actionType === 'resize') {
        setResizingElemId(elemId);
        const targetElem = customElements.find((x) => x.id === elemId);
        if (targetElem) {
          resizeStartRef.current = {
            x: e.clientX,
            initWidth: targetElem.width,
          };
        }
      } else {
        setDraggingElemId(elemId);
        const targetElem = customElements.find((x) => x.id === elemId);
        if (targetElem) {
          dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            initPosX: targetElem.x,
            initPosY: targetElem.y,
          };
        }
      }
    } else {
      setIsDraggingBg(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initPosX: bgPosX,
        initPosY: bgPosY,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    if (resizingElemId) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(40, Math.min(850, Math.round(resizeStartRef.current.initWidth + deltaX)));
      setCustomElements((prev) =>
        prev.map((item) => (item.id === resizingElemId ? { ...item, width: newWidth } : item))
      );
    } else if (draggingElemId) {
      const deltaX = Math.round(((e.clientX - dragStartRef.current.x) / rect.width) * 100);
      const deltaY = Math.round(((e.clientY - dragStartRef.current.y) / rect.height) * 100);

      const newX = Math.max(-50, Math.min(200, dragStartRef.current.initPosX + deltaX));
      const newY = Math.max(-50, Math.min(200, dragStartRef.current.initPosY + deltaY));

      setCustomElements((prev) =>
        prev.map((item) => (item.id === draggingElemId ? { ...item, x: newX, y: newY } : item))
      );
    } else if (isDraggingBg) {
      const deltaX = Math.round(((e.clientX - dragStartRef.current.x) / rect.width) * 100);
      const deltaY = Math.round(((e.clientY - dragStartRef.current.y) / rect.height) * 100);

      setBgPosX(Math.max(-50, Math.min(200, dragStartRef.current.initPosX + deltaX)));
      setBgPosY(Math.max(-50, Math.min(200, dragStartRef.current.initPosY + deltaY)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDraggingBg(false);
    setDraggingElemId(null);
    setResizingElemId(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Save current design live
  const handleSaveLiveConfig = async () => {
    try {
      await api.updateConfig({
        ...config,
        profileBgUrl: bgUrl,
        profileBgPosX: bgPosX,
        profileBgPosY: bgPosY,
        profileBgZoom: bgZoom,
        profileOverlayOpacity: bgOpacity,
        profileBgRotation: bgRotation,
        profileCustomElements: customElements,
        profileTemplates: templates,
      });
      toast.success('Live Theme Palette design saved & published across the platform!');
    } catch {
      toast.error('Failed to save theme palette');
    }
  };

  // Template Management
  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const newTemplate: DesignTemplate = {
      id: `template_${Date.now()}`,
      name: newTemplateName.trim(),
      createdAt: new Date().toLocaleDateString(),
      bgUrl: bgUrl,
      bgPosX: bgPosX,
      bgPosY: bgPosY,
      bgZoom: bgZoom,
      customElements: customElements,
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    setNewTemplateName('');
    setShowSaveInput(false);

    try {
      await api.updateConfig({
        ...config,
        profileBgUrl: bgUrl,
        profileBgPosX: bgPosX,
        profileBgPosY: bgPosY,
        profileBgZoom: bgZoom,
        profileCustomElements: customElements,
        profileTemplates: updatedTemplates,
      });
      toast.success(`Theme Template "${newTemplate.name}" created!`);
    } catch {
      toast.error('Failed to save template');
    }
  };

  const handleApplyTemplate = (tpl: DesignTemplate) => {
    setBgUrl(tpl.bgUrl);
    setBgPosX(tpl.bgPosX);
    setBgPosY(tpl.bgPosY);
    setBgZoom(tpl.bgZoom);
    setCustomElements(tpl.customElements);
    setSelectedElemId(null);
    toast.success(`Loaded template "${tpl.name}" into Theme Studio!`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const updated = templates.filter((t) => t.id !== templateId);
    setTemplates(updated);
    try {
      await api.updateConfig({
        ...config,
        profileTemplates: updated,
      });
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const updateSelectedElem = (key: keyof ProfileFreeElement, val: any) => {
    if (!selectedElemId) return;
    setCustomElements((prev) =>
      prev.map((item) => (item.id === selectedElemId ? { ...item, [key]: val } : item))
    );
  };

  const deleteSelectedElem = () => {
    if (!selectedElemId) return;
    setCustomElements((prev) => prev.filter((item) => item.id !== selectedElemId));
    setSelectedElemId(null);
    toast.success('Layer deleted');
  };

  const activeSelectedElem = customElements.find((x) => x.id === selectedElemId);

  return (
    <div className="space-y-6 animate-fade-up">
      <input
        type="file"
        ref={addImageInputRef}
        onChange={handleAddCustomImage}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={bgInputRef}
        onChange={handleBgImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-zinc-950 flex items-center gap-2">
            <Palette className="h-5 w-5 text-amber-500" />
            Super Admin Theme Studio & Palette Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Design, drag-reposition, resize, crop, and save reusable branding templates across the platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs gap-1.5 shadow"
          >
            <Sparkles className="h-4 w-4" /> Save Design as Template
          </Button>

          <Button
            type="button"
            onClick={handleSaveLiveConfig}
            className="rounded-full bg-[#0F6D4E] hover:bg-[#0c593f] text-white font-bold text-xs gap-1.5 shadow"
          >
            <Save className="h-4 w-4" /> Publish Live Design
          </Button>
        </div>
      </div>

      {/* Template Name Prompt Row */}
      {showSaveInput && (
        <Card className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-3">
          <Input
            type="text"
            placeholder="Template Name (e.g. Scuderia F1 Red Theme)..."
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            className="h-9 text-xs bg-white border-amber-300 rounded-xl"
          />
          <Button
            type="button"
            onClick={handleSaveAsTemplate}
            className="h-9 px-4 text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 rounded-xl shrink-0"
          >
            Save Template
          </Button>
        </Card>
      )}

      {/* Interactive Studio Canvas Preview */}
      <Card
        ref={cardRef}
        onPointerDown={(e) => handlePointerDown(e)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full max-w-[1024px] mx-auto min-h-[260px] border-2 border-amber-400 shadow-2xl bg-zinc-950 text-white rounded-3xl overflow-hidden p-6 sm:p-8 relative select-none touch-none"
      >
        {/* Backdrop Image */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={bgUrl}
            alt="Studio Banner"
            style={{
              objectFit: 'cover',
              objectPosition: `${bgPosX}% ${bgPosY}%`,
              opacity: bgOpacity,
              transform: `scale(${bgZoom / 100}) ${bgRotation ? `rotate(${bgRotation}deg)` : ''}`,
            }}
            className="w-full h-full origin-center transition-transform duration-75 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/75 via-black/45 to-black/80" />
        </div>

        {/* Free-Size Custom Image Layers */}
        {customElements.map((elem) => (
          <div
            key={elem.id}
            onPointerDown={(e) => handlePointerDown(e, elem.id, 'move')}
            style={{
              left: `${elem.x}%`,
              top: `${elem.y}%`,
              width: `${elem.width}px`,
              opacity: elem.opacity,
              transform: `translate(-50%, -50%) ${elem.rotation ? `rotate(${elem.rotation}deg)` : ''}`,
              clipPath: `inset(${elem.cropTop || 0}% ${elem.cropRight || 0}% ${elem.cropBottom || 0}% ${elem.cropLeft || 0}%)`,
            }}
            className={`absolute z-40 cursor-grab active:cursor-grabbing transition-all duration-75 group ${
              selectedElemId === elem.id ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black/70 rounded-xl scale-[1.02]' : ''
            }`}
          >
            <div
              className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap flex items-center gap-1 cursor-pointer pointer-events-auto"
              onClick={(e) => { e.stopPropagation(); setSelectedElemId(elem.id); }}
            >
              <Move className="h-2.5 w-2.5" /> Drag & Resize ({elem.width}px)
            </div>

            {selectedElemId === elem.id && (
              <>
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nwse-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nesw-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nesw-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nwse-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                />
              </>
            )}

            <img src={elem.url} alt="Layer" className="w-full h-auto object-contain pointer-events-none drop-shadow-2xl" />
          </div>
        ))}

        {/* Live Banner Overlay Content */}
        <div className="relative z-20 flex flex-col justify-between h-full min-h-[190px]">
          <div className="flex items-center justify-between">
            <Badge className="bg-amber-400 text-zinc-950 font-black uppercase text-[10px] px-3 py-1 rounded-full shadow-lg">
              ✨ Live Theme Banner Canvas Studio
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => bgInputRef.current?.click()}
                className="h-7 text-[10px] font-bold bg-white/20 hover:bg-white/30 text-white rounded-full"
              >
                Change Backdrop Photo
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => addImageInputRef.current?.click()}
                className="h-7 text-[10px] font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 rounded-full"
              >
                <Plus className="h-3 w-3" /> Add Image Layer
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white drop-shadow-md">
              Super Admin Theme Palette Studio
            </h3>
            <p className="text-xs text-amber-200/90 font-medium">
              Drag images on canvas to reposition, use 4 corner handles to resize, and save custom design templates
            </p>
          </div>
        </div>
      </Card>

      {/* Layer Adjustments Toolbar */}
      <Card className="border border-zinc-200 bg-white p-5 rounded-3xl space-y-4 shadow-sm">
        {activeSelectedElem ? (
          <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4 text-amber-600" /> Adjusting Selected Layer ({activeSelectedElem.id})
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={deleteSelectedElem}
                className="h-7 px-3 text-[10px] font-bold text-red-600 hover:bg-red-100 rounded-full gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove Layer
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-zinc-700 uppercase text-[9px]">
                  <span>Position X</span>
                  <span className="font-mono text-amber-600">{activeSelectedElem.x}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="200"
                  value={activeSelectedElem.x}
                  onChange={(e) => updateSelectedElem('x', Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-zinc-700 uppercase text-[9px]">
                  <span>Position Y</span>
                  <span className="font-mono text-amber-600">{activeSelectedElem.y}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="200"
                  value={activeSelectedElem.y}
                  onChange={(e) => updateSelectedElem('y', Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-zinc-700 uppercase text-[9px]">
                  <span>Size / Width</span>
                  <span className="font-mono text-amber-600">{activeSelectedElem.width}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="850"
                  step="5"
                  value={activeSelectedElem.width}
                  onChange={(e) => updateSelectedElem('width', Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-amber-900 uppercase text-[9px]">
                  <span>⬆️ Crop Top</span>
                  <span className="font-mono">{activeSelectedElem.cropTop || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeSelectedElem.cropTop || 0}
                  onChange={(e) => updateSelectedElem('cropTop', Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-amber-900 uppercase text-[9px]">
                  <span>⬇️ Crop Bot</span>
                  <span className="font-mono">{activeSelectedElem.cropBottom || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeSelectedElem.cropBottom || 0}
                  onChange={(e) => updateSelectedElem('cropBottom', Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-amber-900 uppercase text-[9px]">
                  <span>⬅️ Crop Left</span>
                  <span className="font-mono">{activeSelectedElem.cropLeft || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeSelectedElem.cropLeft || 0}
                  onChange={(e) => updateSelectedElem('cropLeft', Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-amber-900 uppercase text-[9px]">
                  <span>➡️ Crop Right</span>
                  <span className="font-mono">{activeSelectedElem.cropRight || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeSelectedElem.cropRight || 0}
                  onChange={(e) => updateSelectedElem('cropRight', Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-zinc-700">Rotate Angle</label>
                <select
                  value={activeSelectedElem.rotation}
                  onChange={(e) => updateSelectedElem('rotation', Number(e.target.value))}
                  className="w-full h-6 rounded-md border text-[11px] px-1 bg-white text-zinc-900 font-bold"
                >
                  <option value={0}>0° Normal</option>
                  <option value={45}>45° Angle</option>
                  <option value={90}>90° Clockwise</option>
                  <option value={180}>180° Inverted</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic font-mono">
            💡 Click on any image layer on the canvas above to select it, drag to move, drag corner handles to resize, or adjust position/crop sliders!
          </p>
        )}

        {/* Global Backdrop Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t text-xs">
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-zinc-700 uppercase text-[10px]">
              <span>Backdrop Zoom:</span>
              <span className="font-mono text-amber-600">{bgZoom}%</span>
            </div>
            <input
              type="range"
              min="100"
              max="300"
              step="5"
              value={bgZoom}
              onChange={(e) => setBgZoom(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-bold text-zinc-700 uppercase text-[10px]">
              <span>Overlay Opacity:</span>
              <span className="font-mono text-amber-600">{Math.round(bgOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          <div className="flex items-center gap-2 justify-end pt-3 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setBgZoom(150); setBgPosX(50); setBgPosY(50); toast.success('Applied 1024px Full-Width Zoom Fit!'); }}
              className="h-8 px-3 text-[10px] font-bold rounded-full border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
            >
              🔍 1024px Zoom
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setBgZoom(200); setBgPosX(50); setBgPosY(50); toast.success('Applied 200% Zoom Preset!'); }}
              className="h-8 px-3 text-[10px] font-bold rounded-full border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100"
            >
              ⚡ 200% Zoom
            </Button>
          </div>
        </div>
      </Card>

      {/* Saved Theme Templates Grid */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-zinc-950 flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" /> Saved Design Palette Templates ({templates.length})
          </h3>
          <span className="text-xs text-muted-foreground font-mono">1-click application to live platform</span>
        </div>

        {templates.length === 0 ? (
          <Card className="p-8 text-center bg-zinc-50 border-dashed rounded-3xl">
            <Palette className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-700">No saved templates yet</p>
            <p className="text-xs text-zinc-500 mt-1">Design a theme on the canvas above and click "Save Design as Template" to add your first template!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="border border-zinc-200 rounded-3xl p-4 bg-white shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-zinc-900 truncate">{tpl.name}</h4>
                    <span className="text-[10px] font-mono text-zinc-400">{tpl.createdAt}</span>
                  </div>
                  <div className="relative aspect-video rounded-xl bg-zinc-950 overflow-hidden border">
                    <img
                      src={tpl.bgUrl || '/f1-flag.jpg'}
                      alt=""
                      className="w-full h-full object-cover opacity-80"
                      style={{ objectPosition: `${tpl.bgPosX}% ${tpl.bgPosY}%` }}
                    />
                    <Badge className="absolute bottom-2 left-2 bg-amber-400 text-zinc-950 text-[9px] font-bold">
                      {tpl.customElements?.length || 0} Layers
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="flex-1 h-8 text-xs font-bold bg-amber-500 text-zinc-950 hover:bg-amber-400 rounded-xl gap-1"
                  >
                    <Check className="h-3.5 w-3.5" /> Load & Apply
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="h-8 w-8 text-red-500 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
