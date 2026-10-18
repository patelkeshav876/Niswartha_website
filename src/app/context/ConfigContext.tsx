import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { api, applyThemeColor } from '../lib/api';

interface ConfigContextType {
  config: any;
  loading: boolean;
}

const ConfigContext = createContext<ConfigContextType>({ config: null, loading: false });

function getInitialConfig() {
  try {
    const saved = localStorage.getItem('site_config');
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<any>(() => getInitialConfig());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const c = await api.getConfig();
        if (active && c) {
          setConfig((prev: any) => (JSON.stringify(prev) === JSON.stringify(c) ? prev : c));
          if (c.primaryThemeColor) applyThemeColor(c.primaryThemeColor);
        }
      } catch {
        // use cached
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Listen to immediate config updates dispatched by Admin Settings
  useEffect(() => {
    const handleConfigUpdate = (e: any) => {
      if (e?.detail) {
        setConfig((prev: any) => ({ ...prev, ...e.detail }));
        if (e.detail.primaryThemeColor) applyThemeColor(e.detail.primaryThemeColor);
      }
    };
    window.addEventListener('niswartha_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('niswartha_config_updated', handleConfigUpdate);
  }, []);

  // Memoize value to avoid unnecessary React reconciliation cycles
  const value = useMemo(() => ({ config, loading }), [config, loading]);

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
