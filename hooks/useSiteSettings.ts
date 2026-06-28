import { useEffect, useState } from 'react';

interface SiteSettings {
  site_name: string;
  site_logo?: string;
}

const defaultSettings: SiteSettings = {
  site_name: '樱道 API',
  site_logo: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    let mounted = true;

    fetch(`/api/settings/public?_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data?.settings) return;

        setSettings({
          site_name: data.settings.site_name || defaultSettings.site_name,
          site_logo: data.settings.site_logo || '',
        });
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}
