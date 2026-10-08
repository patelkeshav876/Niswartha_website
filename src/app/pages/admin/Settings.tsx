import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, User, Bell, Shield, LogOut, Image as ImageIcon, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export function Settings() {
  const [config, setConfig] = useState<any>({
    aboutHeroImgUrl: '',
    aboutAssemblyImgUrl: '',
    aboutAwardImgUrl: '',
    aboutPrincipalImgUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [activePicker, setActivePicker] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.getConfig();
        if (c) setConfig(c);
      } catch {
        // use fallback
      }
    })();
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await api.updateConfig(config);
      toast.success('About page images updated successfully!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-12">
      <div className="bg-background sticky top-0 z-10 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold font-serif text-zinc-900">Admin Settings</h1>
          </div>
          <Button onClick={handleSaveConfig} disabled={loading} size="sm" className="rounded-full gap-1.5 shadow">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 w-full">
        {/* About Page Pictures Management */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold font-serif text-zinc-900">About Us Page Custom Pictures</h2>
          </div>
          <Card className="border border-zinc-200 shadow-sm rounded-2xl bg-white overflow-hidden p-5">
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              Customize the images displayed on the public About Us page. Choose photos from your Media Library or upload new pictures.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">1. Hero Campus Building Photo</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutHeroImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutHeroImgUrl: e.target.value })}
                    placeholder="Entrance building picture URL..."
                    className="rounded-xl text-xs bg-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs whitespace-nowrap"
                    onClick={() => setActivePicker('hero')}
                  >
                    Select Photo
                  </Button>
                </div>
                {config.aboutHeroImgUrl && (
                  <img src={config.aboutHeroImgUrl} alt="" className="h-20 w-full object-cover rounded-xl border mt-2" />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">2. School Assembly Photo</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutAssemblyImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutAssemblyImgUrl: e.target.value })}
                    placeholder="School ground assembly picture URL..."
                    className="rounded-xl text-xs bg-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs whitespace-nowrap"
                    onClick={() => setActivePicker('assembly')}
                  >
                    Select Photo
                  </Button>
                </div>
                {config.aboutAssemblyImgUrl && (
                  <img src={config.aboutAssemblyImgUrl} alt="" className="h-20 w-full object-cover rounded-xl border mt-2" />
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700 uppercase">3. National Award Certificate Photo</Label>
                <div className="flex gap-2">
                  <Input
                    value={config.aboutAwardImgUrl || ''}
                    onChange={(e) => setConfig({ ...config, aboutAwardImgUrl: e.target.value })}
                    placeholder="Award certificate picture URL..."
                    className="rounded-xl text-xs bg-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs whitespace-nowrap"
                    onClick={() => setActivePicker('award')}
                  >
                    Select Photo
                  </Button>
                </div>
                {config.aboutAwardImgUrl && (
                  <img src={config.aboutAwardImgUrl} alt="" className="h-20 w-full object-cover rounded-xl border mt-2" />
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <Label className="text-xs font-bold text-zinc-900 uppercase flex items-center gap-2">
                  <User className="h-4 w-4 text-[#0F6D4E]" />
                  4. School Principal Portrait Photo (About Us Page)
                </Label>
                <p className="text-[11px] text-zinc-500 mb-2">
                  This picture appears on the public About Us page next to the Principal's Message (Dr. Meenal Sudhir Sangole).
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {config.aboutPrincipalImgUrl ? (
                    <img src={config.aboutPrincipalImgUrl} alt="Principal" className="h-20 w-20 object-cover rounded-full border-2 border-[#0F6D4E] shadow-sm shrink-0" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-[#0F6D4E]/10 border-2 border-[#0F6D4E]/20 text-[#0F6D4E] flex items-center justify-center font-bold text-xl shrink-0">
                      P
                    </div>
                  )}
                  <div className="flex-1 space-y-2 w-full">
                    <Input
                      value={config.aboutPrincipalImgUrl || ''}
                      onChange={(e) => setConfig({ ...config, aboutPrincipalImgUrl: e.target.value })}
                      placeholder="Paste Principal picture URL..."
                      className="rounded-xl text-xs bg-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl text-xs flex-1 bg-white border-zinc-200"
                        onClick={() => setActivePicker('principal')}
                      >
                        Select from Media Library
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Account & System Preferences */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">System Preferences</h2>
          <Card className="border border-zinc-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">System Notifications</span>
                </div>
                <span className="text-xs text-primary font-bold">Enabled</span>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium text-sm">Admin Access & Role Security</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold">Active</span>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <MediaPickerModal
        open={Boolean(activePicker)}
        onOpenChange={() => setActivePicker(null)}
        allowedTypes="image"
        title="Select Photo from Media Library"
        onSelectMedia={(media) => {
          if (activePicker === 'hero') setConfig({ ...config, aboutHeroImgUrl: media.url });
          if (activePicker === 'assembly') setConfig({ ...config, aboutAssemblyImgUrl: media.url });
          if (activePicker === 'award') setConfig({ ...config, aboutAwardImgUrl: media.url });
          if (activePicker === 'principal') setConfig({ ...config, aboutPrincipalImgUrl: media.url });
        }}
      />
    </div>
  );
}