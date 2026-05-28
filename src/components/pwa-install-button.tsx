'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isIosDevice() {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  const mediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const navStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mediaStandalone || navStandalone;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneMode());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowIosHelp(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const canShowInstall = useMemo(() => {
    if (installed) return false;
    if (deferredPrompt) return true;
    if (isIosDevice()) return true;
    return false;
  }, [installed, deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    if (isIosDevice()) {
      setShowIosHelp((value) => !value);
    }
  };

  if (!canShowInstall) return null;

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
      <Button onClick={handleInstall} className="bg-emerald-600 hover:bg-emerald-700">
        {deferredPrompt ? <Download className="mr-2 h-4 w-4" /> : <Smartphone className="mr-2 h-4 w-4" />}
        Instalar app MercaSENA
      </Button>

      {showIosHelp && (
        <p className="mt-3 text-sm text-emerald-800">
          En iPhone/iPad: toca Compartir en Safari y luego selecciona Agregar a pantalla de inicio.
        </p>
      )}
    </div>
  );
}
