import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Heart, Activity, CheckCircle2, Clock, XCircle, IndianRupee, User, Mail, Phone, MapPin, Shield, Edit3, Award, Sparkles, ShieldAlert, Move, Save, Plus, Trash2, RotateCw, Eye, Maximize2, Camera } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { mockAshrams } from '../data/mock';
import { api } from '../lib/api';
import { SUPERHERO_BADGES, getBadgeForDonation, type SuperheroBadge } from '../lib/superheroBadges';
import { TransparentCarGraphic } from '../components/TransparentCarGraphic';
import { toast } from 'sonner';

export interface ProfileFreeElement {
  id: string;
  url: string;
  x: number; // left %
  y: number; // top %
  width: number; // width in px
  rotation: number; // deg
  opacity: number; // 0.1 - 1.0
  cropTop?: number; // crop top edge % (0 to 50)
  cropBottom?: number; // crop bottom edge % (0 to 50)
  cropLeft?: number; // crop left edge % (0 to 50)
  cropRight?: number; // crop right edge % (0 to 50)
}

export interface DesignTemplate {
  id: string;
  name: string;
  createdAt: string;
  bgUrl: string;
  bgPosX: number;
  bgPosY: number;
  bgZoom: number;
  customElements: ProfileFreeElement[];
}

export function Profile() {
  const { currentUser, token } = useUser();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalDonations: 0,
    donationCount: 0,
    livesImpacted: 0,
    ashramSupported: 0,
    recent: [] as any[],
  });

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  // Super Admin Drag & Free Size Elements States
  const isSuperAdmin = currentUser?.email === 'keshavpatel3690@gmail.com' || currentUser?.role === 'super_admin';
  const [dragMode, setDragMode] = useState(true); // Default active for Super Admin
  const [bgPosX, setBgPosX] = useState(50);
  const [bgPosY, setBgPosY] = useState(50);
  const [bgZoom, setBgZoom] = useState(125);

  // Free Size Image Layers & Design Template States
  const [customElements, setCustomElements] = useState<ProfileFreeElement[]>([]);
  const [selectedElemId, setSelectedElemId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveTemplateInput, setShowSaveTemplateInput] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const newBgUrl = reader.result;
        try {
          await api.updateConfig({
            ...config,
            profileBgUrl: newBgUrl,
          });
          setConfig((prev: any) => ({ ...prev, profileBgUrl: newBgUrl }));
          toast.success('Account background image updated successfully!');
        } catch {
          toast.error('Failed to update background photo');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Pointer drag & resize tracking
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
      if (cfg?.profileBgPosX !== undefined) setBgPosX(Number(cfg.profileBgPosX));
      if (cfg?.profileBgPosY !== undefined) setBgPosY(Number(cfg.profileBgPosY));
      if (cfg?.profileBgZoom !== undefined) setBgZoom(Number(cfg.profileBgZoom));

      if (Array.isArray(cfg?.profileTemplates)) {
        setTemplates(cfg.profileTemplates);
      }

      // Load free size elements or default F1 car element
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
    }).catch(() => null);
  }, []);

  useEffect(() => {
    if (!currentUser?.dateOfBirth) return;
    const today = new Date();
    const parts = currentUser.dateOfBirth.split('-');
    if (parts.length === 3) {
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      if (today.getMonth() + 1 === month && today.getDate() === day) {
        toast.success(
          `🎉 Happy Birthday ${currentUser.name}! Wishing you a joyful and wonderful day from everyone at Niswartha! 🎂🎁🥳`,
          { duration: 9000 }
        );
      }
    }
  }, [currentUser?.dateOfBirth, currentUser?.name]);

  useEffect(() => {
    if (!currentUser?.id || !token) return;
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const donations = await api.getDonations(currentUser.id);
        const safeArr = Array.isArray(donations) ? donations : [];
        const total = safeArr.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
        const uniqueAshrams = new Set(safeArr.map((d: any) => d.ashramId).filter(Boolean)).size;

        setStats({
          totalDonations: total,
          donationCount: safeArr.length,
          livesImpacted: Math.floor(total / 500) + safeArr.length * 2,
          ashramSupported: uniqueAshrams,
          recent: safeArr.slice(0, 6),
        });
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser?.id, token]);

  // Handle Adding New Free Size Image
  const handleAddCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

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
        setDragMode(true);
        toast.success('New free-size image added! Drag image to move, or drag corner handles to resize.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Pointer Down for Card / Elements Drag or Corner Resize
  const handlePointerDown = (
    e: React.PointerEvent,
    elemId?: string,
    actionType: 'move' | 'resize' = 'move'
  ) => {
    if (!isSuperAdmin) return;
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
      // Corner Drag Resizing width directly with mouse
      const deltaX = e.clientX - resizeStartRef.current.x;
      const newWidth = Math.max(40, Math.min(850, Math.round(resizeStartRef.current.initWidth + deltaX)));
      setCustomElements((prev) =>
        prev.map((item) => (item.id === resizingElemId ? { ...item, width: newWidth } : item))
      );
    } else if (draggingElemId) {
      // Dragging Image Position X, Y (Position up to 200%)
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

  const handleSaveBgPosition = async () => {
    try {
      await api.updateConfig({
        ...config,
        profileBgPosX: bgPosX,
        profileBgPosY: bgPosY,
        profileBgZoom: bgZoom,
        profileCustomElements: customElements,
      });
      toast.success(`Saved all free-size images and background position!`);
      setDragMode(false);
    } catch {
      toast.error('Failed to save configuration.');
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
    toast.success('Image deleted');
  };

  const resetCropSelectedElem = () => {
    if (!selectedElemId) return;
    setCustomElements((prev) =>
      prev.map((item) =>
        item.id === selectedElemId ? { ...item, cropTop: 0, cropBottom: 0, cropLeft: 0, cropRight: 0 } : item
      )
    );
    toast.success('Crop reset to 100% full view');
  };

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
    setShowSaveTemplateInput(false);

    try {
      await api.updateConfig({
        ...config,
        profileTemplates: updatedTemplates,
      });
      toast.success(`Design saved as template "${newTemplate.name}"!`);
    } catch {
      toast.error('Failed to save design template');
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const target = templates.find((t) => t.id === templateId);
    if (!target) return;

    setBgPosX(target.bgPosX);
    setBgPosY(target.bgPosY);
    setBgZoom(target.bgZoom);
    setCustomElements(target.customElements);
    setSelectedElemId(null);
    toast.success(`Applied template "${target.name}"!`);
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

  const handleNudge = (dir: 'up' | 'down' | 'left' | 'right') => {
    const step = 4;
    if (selectedElemId) {
      setCustomElements((prev) =>
        prev.map((item) => {
          if (item.id !== selectedElemId) return item;
          let x = item.x;
          let y = item.y;
          if (dir === 'left') x = Math.max(0, x - step);
          if (dir === 'right') x = Math.min(100, x + step);
          if (dir === 'up') y = Math.max(0, y - step);
          if (dir === 'down') y = Math.min(100, y + step);
          return { ...item, x, y };
        })
      );
    } else {
      if (dir === 'up') setBgPosY((prev) => Math.max(0, prev - step));
      if (dir === 'down') setBgPosY((prev) => Math.min(100, prev + step));
      if (dir === 'left') setBgPosX((prev) => Math.max(0, prev - step));
      if (dir === 'right') setBgPosX((prev) => Math.min(100, prev + step));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="border-0 bg-emerald-100 text-emerald-800 text-[9px] font-bold">Completed</Badge>;
      case 'pending':
        return <Badge className="border-0 bg-amber-100 text-amber-800 text-[9px] font-bold">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-[9px] font-bold">Failed</Badge>;
      default:
        return null;
    }
  };

  if (!currentUser) return null;

  const bgUrl = config?.profileBgUrl || '/f1-flag.jpg';
  const bgOpacity = config?.profileOverlayOpacity !== undefined ? Number(config.profileOverlayOpacity) : 0.9;
  const bgObjectFit = (config?.profileBgObjectFit || 'cover') as 'cover' | 'contain' | 'fill';
  const bgRotation = Number(config?.profileBgRotation || 0);

  const activeSelectedElem = customElements.find((x) => x.id === selectedElemId);

  return (
    <div className="section-container max-w-5xl mx-auto pt-24 lg:pt-28 pb-8 space-y-8 animate-fade-up">
      {/* Hidden File Input for Adding Custom Free Size Images */}
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

      {/* Super Admin Free Size Image Studio Toolbar */}
      {isSuperAdmin && (
        <Card className="border border-amber-400/50 bg-zinc-950 text-white p-4 sm:p-5 rounded-3xl shadow-xl space-y-4 max-w-[1024px] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Super Admin Free-Size Banner Studio</p>
                <p className="text-[11px] text-zinc-400">Add, drag, resize, rotate, crop & adjust any images on your profile banner</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Theme Off (Default Standard Profile Mode) */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const newThemeDisabled = !config?.disableProfileTheme;
                  try {
                    await api.updateConfig({ ...config, disableProfileTheme: newThemeDisabled });
                    setConfig((prev: any) => ({ ...prev, disableProfileTheme: newThemeDisabled }));
                    toast.success(newThemeDisabled ? 'Theme OFF: Standard Default Profile mode activated' : 'Theme ON: Custom Profile Theme activated');
                  } catch {
                    toast.error('Could not update theme setting');
                  }
                }}
                className={`rounded-full text-xs font-bold h-8 px-3 gap-1.5 border-amber-400/50 ${
                  config?.disableProfileTheme ? 'bg-amber-500 text-zinc-950' : 'bg-white/10 text-amber-300 hover:bg-white/20'
                }`}
              >
                🎨 {config?.disableProfileTheme ? 'Theme: OFF (Standard Mode)' : 'Theme: ON (Custom Banner)'}
              </Button>

              {/* Toggle Superhero Badges Section */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const newBadgesDisabled = config?.enableSuperheroBadges === false ? true : false;
                  try {
                    await api.updateConfig({ ...config, enableSuperheroBadges: newBadgesDisabled });
                    setConfig((prev: any) => ({ ...prev, enableSuperheroBadges: newBadgesDisabled }));
                    toast.success(newBadgesDisabled ? 'Superhero Badges section enabled' : 'Superhero Badges section disabled');
                  } catch {
                    toast.error('Could not update badges setting');
                  }
                }}
                className={`rounded-full text-xs font-bold h-8 px-3 gap-1.5 border-emerald-400/50 ${
                  config?.enableSuperheroBadges === false ? 'bg-red-500/20 text-red-300 border-red-400/50' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                🎖️ {config?.enableSuperheroBadges === false ? 'Badges: OFF' : 'Badges: ON'}
              </Button>

              {/* Save Design as Reusable Template Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSaveTemplateInput(!showSaveTemplateInput)}
                className="rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border-amber-400/50 hover:bg-amber-400 hover:text-zinc-950 h-8 px-3 gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                💾 Save as Template
              </Button>

              {/* Add Free Size Image Button */}
              <Button
                type="button"
                size="sm"
                onClick={() => addImageInputRef.current?.click()}
                className="rounded-full text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 h-8 px-4 gap-1.5 shadow-md"
              >
                <Plus className="h-4 w-4" /> Add Free-Size Image
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDragMode(!dragMode)}
                className={`rounded-full text-xs font-bold gap-1.5 h-8 px-4 border-amber-400/50 ${
                  dragMode ? 'bg-amber-400 text-zinc-950 hover:bg-amber-300' : 'bg-white/10 text-amber-300 hover:bg-white/20'
                }`}
              >
                <Move className="h-3.5 w-3.5" />
                {dragMode ? '🖐️ Studio Dragging ON' : 'Turn ON Drag Mode'}
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleSaveBgPosition}
                className="rounded-full text-xs font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 h-8 px-4 gap-1.5 shadow-md"
              >
                <Save className="h-3.5 w-3.5" />
                Save Layout ({customElements.length} Images)
              </Button>
            </div>
          </div>

          {/* Save Template Input Row */}
          {showSaveTemplateInput && (
            <div className="bg-amber-400/10 p-3 rounded-2xl border border-amber-400/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Input
                  type="text"
                  placeholder="Enter Template Name (e.g. F1 Red Theme)..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="h-8 text-xs bg-zinc-900 border-amber-400/50 text-white rounded-xl"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveAsTemplate}
                  className="h-8 px-4 text-xs font-bold bg-amber-400 text-zinc-950 hover:bg-amber-300 rounded-xl shrink-0"
                >
                  Save Template
                </Button>
              </div>
            </div>
          )}

          {/* Load Saved Templates Dropdown */}
          {templates.length > 0 && (
            <div className="flex items-center gap-3 pt-2 border-t border-white/10 text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 shrink-0">
                📂 Load Saved Design Template:
              </span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleApplyTemplate(e.target.value);
                  e.target.value = '';
                }}
                className="h-8 rounded-xl border border-amber-400/40 text-xs px-3 bg-zinc-900 text-amber-200 font-bold max-w-xs cursor-pointer"
              >
                <option value="">-- Choose a Saved Template ({templates.length} available) --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    ✨ {t.name} ({t.customElements.length} layers, {t.createdAt})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Selected Image Adjustments Toolbar */}
          {dragMode && (
            <div className="pt-3 border-t border-white/10 space-y-3">
              {/* Selected Image Controls */}
              {activeSelectedElem ? (
                <div className="bg-white/10 p-3 rounded-2xl border border-amber-400/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-white/10">
                    <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Maximize2 className="h-3.5 w-3.5" /> Adjusting Selected Image ({activeSelectedElem.id})
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetCropSelectedElem}
                        className="h-6 px-2 text-[10px] font-bold text-amber-300 border-amber-400/40 hover:bg-amber-400/20 rounded-full"
                      >
                        ✂️ Reset Crop
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={deleteSelectedElem}
                        className="h-6 px-2 text-[10px] font-bold text-red-400 hover:bg-red-500/20 rounded-full gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Remove Image
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 text-xs">
                    {/* Position X Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300 uppercase text-[9px]">
                        <span>Position X</span>
                        <span className="font-mono text-amber-300">{activeSelectedElem.x}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="200"
                        value={activeSelectedElem.x}
                        onChange={(e) => updateSelectedElem('x', Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* Position Y Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300 uppercase text-[9px]">
                        <span>Position Y</span>
                        <span className="font-mono text-amber-300">{activeSelectedElem.y}%</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="200"
                        value={activeSelectedElem.y}
                        onChange={(e) => updateSelectedElem('y', Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* Width / Size Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between font-bold text-zinc-300 uppercase text-[9px]">
                        <span>Size / Width</span>
                        <span className="font-mono text-amber-300">{activeSelectedElem.width}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="850"
                        step="5"
                        value={activeSelectedElem.width}
                        onChange={(e) => updateSelectedElem('width', Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* ⬆️ Crop Top (Upward Crop) */}
                    <div className="space-y-1 bg-white/5 p-1 rounded-lg border border-amber-400/30">
                      <div className="flex justify-between font-bold text-amber-300 uppercase text-[9px]">
                        <span>⬆️ Crop Top</span>
                        <span className="font-mono">{activeSelectedElem.cropTop || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={activeSelectedElem.cropTop || 0}
                        onChange={(e) => updateSelectedElem('cropTop', Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* ⬇️ Crop Bottom (Downward Crop) */}
                    <div className="space-y-1 bg-white/5 p-1 rounded-lg border border-amber-400/30">
                      <div className="flex justify-between font-bold text-amber-300 uppercase text-[9px]">
                        <span>⬇️ Crop Bot</span>
                        <span className="font-mono">{activeSelectedElem.cropBottom || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={activeSelectedElem.cropBottom || 0}
                        onChange={(e) => updateSelectedElem('cropBottom', Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* ⬅️ Crop Left */}
                    <div className="space-y-1 bg-white/5 p-1 rounded-lg border border-amber-400/30">
                      <div className="flex justify-between font-bold text-amber-300 uppercase text-[9px]">
                        <span>⬅️ Crop Left</span>
                        <span className="font-mono">{activeSelectedElem.cropLeft || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={activeSelectedElem.cropLeft || 0}
                        onChange={(e) => updateSelectedElem('cropLeft', Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* ➡️ Crop Right */}
                    <div className="space-y-1 bg-white/5 p-1 rounded-lg border border-amber-400/30">
                      <div className="flex justify-between font-bold text-amber-300 uppercase text-[9px]">
                        <span>➡️ Crop Right</span>
                        <span className="font-mono">{activeSelectedElem.cropRight || 0}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={activeSelectedElem.cropRight || 0}
                        onChange={(e) => updateSelectedElem('cropRight', Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>

                    {/* Rotation Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-300">Rotate Angle</label>
                      <select
                        value={activeSelectedElem.rotation}
                        onChange={(e) => updateSelectedElem('rotation', Number(e.target.value))}
                        className="w-full h-6 rounded-md border border-white/20 text-[11px] px-1 bg-zinc-900 text-white font-bold"
                      >
                        <option value={0}>0° Normal</option>
                        <option value={45}>45° Angle</option>
                        <option value={90}>90° Clockwise</option>
                        <option value={180}>180° Inverted</option>
                        <option value={270}>270° Counter</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-300/80 italic font-mono">
                  💡 Click on any image on the red banner below to select it, drag to move, drag corner handles to resize, or use Top/Bottom/Left/Right crop sliders!
                </p>
              )}

              {/* General Banner Nudge & Zoom Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Nudge Selected Image / Banner:</span>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleNudge('left')} className="h-7 w-7 p-0 rounded-lg text-xs bg-white/10">⬅️</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleNudge('up')} className="h-7 w-7 p-0 rounded-lg text-xs bg-white/10">⬆️</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleNudge('down')} className="h-7 w-7 p-0 rounded-lg text-xs bg-white/10">⬇️</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleNudge('right')} className="h-7 w-7 p-0 rounded-lg text-xs bg-white/10">➡️</Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 shrink-0">Backdrop Zoom:</span>
                  <input
                    type="range"
                    min="100"
                    max="300"
                    step="5"
                    value={bgZoom}
                    onChange={(e) => setBgZoom(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-xs font-mono font-bold text-amber-300 shrink-0">{bgZoom}%</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setBgZoom(150); setBgPosX(50); setBgPosY(50); toast.success('Applied 1024px Full-Width Zoom Fit!'); }}
                    className="h-7 px-2 text-[10px] font-bold bg-amber-400/20 text-amber-300 border-amber-400/50 hover:bg-amber-400 hover:text-zinc-950 rounded-full shrink-0"
                  >
                    🔍 1024px Zoom
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setBgZoom(200); setBgPosX(50); setBgPosY(50); toast.success('Applied 200% Zoom Preset!'); }}
                    className="h-7 px-2 text-[10px] font-bold bg-amber-400/20 text-amber-300 border-amber-400/50 hover:bg-amber-400 hover:text-zinc-950 rounded-full shrink-0"
                  >
                    ⚡ 200% Zoom
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Top Profile Header Banner Card (Super Admin 1024px Free-Size Layer Studio / Standard Default Mode) */}
      <Card
        ref={cardRef}
        onPointerDown={(e) => handlePointerDown(e)}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-full max-w-[1024px] mx-auto min-h-[200px] shadow-2xl rounded-3xl overflow-hidden p-6 sm:p-8 relative select-none touch-none transition-all ${
          config?.disableProfileTheme 
            ? 'bg-gradient-to-br from-[#0F6D4E] to-emerald-900 text-white border-none' 
            : 'border border-red-500/40 bg-zinc-950 text-white'
        } ${dragMode && !config?.disableProfileTheme ? 'ring-4 ring-amber-400/80 shadow-amber-500/20' : ''}`}
      >
        {/* Configurable Drag-Repositioned Background Image */}
        {!config?.disableProfileTheme && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={bgUrl}
              alt="Profile Banner Background"
              style={{
                objectFit: bgObjectFit,
                objectPosition: `${bgPosX}% ${bgPosY}%`,
                opacity: bgOpacity,
                transform: `scale(${bgZoom / 100}) ${bgRotation ? `rotate(${bgRotation}deg)` : ''}`,
              }}
              className="w-full h-full origin-center transition-transform duration-75 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/75 via-black/45 to-black/80" />
          </div>
        )}

        {/* Free-Size Custom Image Layers Added by Super Admin */}
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
            {isSuperAdmin && (
              <div
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg opacity-90 group-hover:opacity-100 whitespace-nowrap flex items-center gap-1 cursor-pointer pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); setSelectedElemId(elem.id); }}
              >
                <Move className="h-2.5 w-2.5" /> Drag & Resize ({elem.width}px)
              </div>
            )}

            {/* Corner Resize Handles for Direct Mouse Drag Sizing */}
            {isSuperAdmin && selectedElemId === elem.id && (
              <>
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nwse-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                  title="Drag corner to resize"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nesw-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                  title="Drag corner to resize"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nesw-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                  title="Drag corner to resize"
                />
                <div
                  onPointerDown={(e) => handlePointerDown(e, elem.id, 'resize')}
                  className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 border-2 border-black rounded-full cursor-nwse-resize z-50 hover:scale-125 shadow-lg pointer-events-auto"
                  title="Drag corner to resize"
                />
              </>
            )}

            <TransparentCarGraphic
              src={elem.url}
              alt="Free-size Element"
              className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] pointer-events-none"
            />
          </div>
        ))}

        {/* Drag Helper Visual Cue */}
        {dragMode && (
          <div className="absolute inset-0 z-10 border-2 border-dashed border-amber-400/60 rounded-3xl pointer-events-none flex items-start justify-center pt-2 bg-black/10">
            
          </div>
        )}

        <div className="absolute top-2.5 right-4 z-50 flex items-center gap-2">
          
          <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-amber-300 pointer-events-none select-none drop-shadow-md hidden sm:inline">
            🏎️ SCUDERIA F1 TEAM // RPM 12,000
          </span>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative shrink-0 group cursor-pointer" onClick={() => navigate('/settings')}>
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-[28px] sm:rounded-[32px] bg-white/10 backdrop-blur-md border-2 border-amber-400/50 flex items-center justify-center text-3xl font-bold font-serif text-white shadow-2xl overflow-hidden relative">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                currentUser.name?.charAt(0)?.toUpperCase() || 'U'
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold">
                Edit
              </div>
            </div>

            {/* Corner Orange Pencil Camera Edit Badge Overlay (Screenshot 1 & 2) */}
            <div
              className="absolute -bottom-1 -right-1 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#F97316] text-white flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              title="Click to edit profile photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">{currentUser.name}</h1>
              <Badge className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase text-[9px] font-mono tracking-widest px-2.5 py-0.5 font-bold">
                {currentUser.role === 'super_admin' ? '🏁 Super Admin Driver' : currentUser.role === 'admin' ? '🏎️ Pit Captain' : '⚡ F1 Hero Supporter'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <p className="text-xs sm:text-sm text-emerald-100/90 flex items-center gap-1.5 font-mono">
                <Mail className="h-3.5 w-3.5 text-emerald-300" /> {currentUser.email}
              </p>
              {currentUser.dateOfBirth && (
                <Badge className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold px-2.5 py-0.5 flex items-center gap-1">
                  🎂 DOB: {new Date(currentUser.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Badge>
              )}
            </div>
            {currentUser.bio && (
              <p className="text-xs text-white/80 italic max-w-lg pt-1 font-serif leading-relaxed">
                "{currentUser.bio}"
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Marvel & DC Superhero Circular Badges Showcase */}
      {config?.enableSuperheroBadges !== false && (
        <Card className="border-2 border-emerald-500/40 bg-gradient-to-br from-red-950/90 via-[#091510] to-emerald-950/95 text-white rounded-3xl p-6 shadow-2xl space-y-4 overflow-hidden relative shadow-emerald-950/30">
          {/* Ambient Theme Color Rays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,109,78,0.35),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(153,27,27,0.25),transparent_50%)] pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-15 pointer-events-none">
            <Sparkles className="h-36 w-36 text-emerald-400" />
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between border-b border-emerald-500/30 pb-3 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow-md">
                <Award className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white tracking-tight flex items-center gap-2">
                  Superhero Honor Badges
                </h3>
                <p className="text-[11px] text-emerald-200/80">Awarded for each contribution supporting hearing-impaired children</p>
              </div>
            </div>
            <Badge className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 uppercase text-[9px] font-mono font-bold tracking-wider px-3 py-1 shadow-sm">
              ✨ {stats.donationCount} Badges Earned
            </Badge>
          </div>

          <div className="relative z-10 flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-hide">
            {SUPERHERO_BADGES.map((badge, idx) => {
              const isEarned = idx < Math.max(1, stats.donationCount);
              return isEarned ? (
                <div
                  key={badge.id}
                  className="flex flex-col items-center min-w-[100px] p-3 rounded-2xl border border-emerald-400/50 bg-emerald-950/40 backdrop-blur-md shadow-lg shadow-emerald-950/40 scale-105 transition-all hover:scale-110 hover:border-amber-400"
                >
                  <div
                    className={`h-14 w-14 rounded-full bg-gradient-to-tr ${badge.bgGradient} border-2 border-emerald-300 flex items-center justify-center text-white font-black text-lg shadow-[0_0_14px_rgba(52,211,153,0.35)] mb-2 relative overflow-hidden`}
                  >
                    {badge.imageUrl ? (
                      <img src={badge.imageUrl} alt={badge.hero} className="h-full w-full object-cover" />
                    ) : (
                      <span className="drop-shadow-md">{badge.iconSymbol}</span>
                    )}
                    <div className="absolute inset-0 bg-white/10 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                  </div>
                  <p className="text-[10px] font-bold text-center text-white truncate max-w-[90px]">{badge.hero}</p>
                  <p className="text-[8px] text-emerald-300 font-mono mt-0.5 font-bold tracking-wider uppercase flex items-center gap-0.5">
                    ⚡ UNLOCKED
                  </p>
                </div>
              ) : (
                <div
                  key={badge.id}
                  className="flex flex-col items-center min-w-[100px] p-3 rounded-2xl border border-red-950/60 bg-black/60 opacity-60 transition-all hover:opacity-80"
                >
                  <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-zinc-900 via-zinc-800 to-red-950 border-2 border-red-900/60 flex items-center justify-center text-amber-400 font-black text-xl shadow-inner mb-2 relative overflow-hidden">
                    <span className="drop-shadow-md opacity-80">🔒</span>
                    <div className="absolute inset-0 bg-white/5 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
                  </div>
                  <p className="text-[10px] font-bold text-center text-zinc-400 truncate max-w-[90px]">Surprise Badge</p>
                  <p className="text-[8px] text-zinc-500 font-mono mt-0.5">Mystery Hero</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Main Grid: Impact Metrics & Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Impact Metrics & Recent Donations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Total Contributions',
                value: `₹${stats.totalDonations.toLocaleString()}`,
                desc: 'All-time support',
                color: 'bg-emerald-50 text-[#0F6D4E]',
                icon: IndianRupee,
              },
              {
                label: 'Lives Supported',
                value: stats.livesImpacted,
                desc: 'Estimated educational reach',
                color: 'bg-indigo-50 text-indigo-600',
                icon: Heart,
              },
              {
                label: 'Ashrams Funded',
                value: stats.ashramSupported,
                desc: 'Supported units',
                color: 'bg-amber-50 text-amber-600',
                icon: Activity,
              },
            ].map((stat, i) => (
              <Card key={i} className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold truncate">{stat.label}</p>
                    <p className="text-lg font-bold text-zinc-900 mt-0.5 truncate">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent Donations List Card with Marvel & DC Superhero Badges */}
          <Card className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 font-serif">Recent Transaction Activities</h3>
                <p className="text-[11px] text-zinc-500">Superhero Badges awarded per contribution</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/donation-history')}
                className="rounded-full border-zinc-200 text-xs font-bold h-8"
              >
                View Full History
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="h-14 rounded-xl bg-zinc-100 animate-pulse" />
                ))}
              </div>
            ) : stats.recent.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 space-y-3">
                <p className="text-xs">No transactions recorded yet under your account.</p>
                <Button
                  size="sm"
                  onClick={() => navigate('/needs')}
                  className="rounded-full bg-[#0F6D4E] text-white font-bold text-xs shadow-sm"
                >
                  Explore Urgent Needs
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recent.map((donation, idx) => {
                  const ashram = mockAshrams.find((a) => a.id === donation.ashramId);
                  const badge = getBadgeForDonation(donation.id || idx);
                  return (
                    <div key={donation.id || idx} className="p-3.5 rounded-2xl border border-zinc-200/80 bg-white hover:border-emerald-400 transition-all flex items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Circular Superhero Badge */}
                        <div
                          className={`h-11 w-11 rounded-full bg-gradient-to-tr ${badge.bgGradient} border-2 ${badge.accentBorder} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0 relative overflow-hidden`}
                        >
                          <span>{badge.iconSymbol}</span>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-900 truncate text-xs">
                              {ashram?.name || 'General Support Contribution'}
                            </h4>
                            <Badge className="bg-amber-100 text-amber-900 border-none font-bold text-[8px] px-2">
                              {badge.hero} Badge
                            </Badge>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            {new Date(donation.date || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })} • {badge.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-zinc-900">₹{Number(donation.amount).toLocaleString()}</p>
                        <div className="mt-0.5">{getStatusBadge(donation.status || 'completed')}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Column: Profile Information Card */}
        <div className="space-y-6">
          <Card className="border border-zinc-200/80 shadow-xs rounded-2xl bg-white p-6 space-y-5">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-[#0F6D4E]" />
              Account Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Full Name</p>
                <p className="font-bold text-zinc-800 mt-0.5">{currentUser.name}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Email Address</p>
                <p className="font-bold text-zinc-800 mt-0.5 truncate">{currentUser.email}</p>
              </div>

              {currentUser.phone && (
                <div>
                  <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Phone Number</p>
                  <p className="font-bold text-zinc-800 mt-0.5">{currentUser.phone}</p>
                </div>
              )}

              {currentUser.location && (
                <div>
                  <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">Location</p>
                  <p className="font-bold text-zinc-800 mt-0.5">{currentUser.location}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <Button
                variant="outline"
                className="w-full rounded-xl text-xs font-bold border-zinc-200"
                onClick={() => navigate('/settings')}
              >
                Account Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}