import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, CheckCircle, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Detect if running in Standalone PWA mode (already installed & opened from home screen)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if user dismissed prompt previously
    const isDismissed = localStorage.getItem('morita_install_prompt_dismissed') === 'true';
    if (isDismissed) {
      return;
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Intercept beforeinstallprompt event for Android / Chrome / Edge / Brave / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. On iOS, show custom banner after a short 2-second delay if not standalone
    if (isIosDevice && !isStandalone && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 6. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsVisible(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('¡La Morita fue instalada con éxito en el dispositivo!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback if browser hasn't fired beforeinstallprompt yet
      alert('Para instalar La Morita:\n1. Abre el menú de opciones del navegador (⋮ o ⚙️).\n2. Selecciona "Añadir a la pantalla de inicio" o "Instalar aplicación".');
      return;
    }

    try {
      // Show native browser install prompt
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario aceptó la instalación de la PWA');
        setIsVisible(false);
      } else {
        console.log('El usuario rechazó la instalación de la PWA');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error al solicitar la instalación:', err);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('morita_install_prompt_dismissed', 'true');
  };

  if (!isVisible || isInstalled) return null;

  return (
    <>
      {/* Top Banner with La Morita signature design */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-morita-mulberry via-morita-terracotta to-morita-mulberry text-white shadow-lg border-b border-white/20 backdrop-blur-md animate-in slide-in-from-top duration-300">
        <div className="max-w-6xl mx-auto px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2.5">
          {/* Logo & Info */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src="/icon.svg"
                alt="La Morita Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md border border-white/30 object-cover bg-morita-beige"
                onError={(e) => {
                  // Fallback icon if image hasn't loaded yet
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-purple-950 p-0.5 rounded-full shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-amber-200 tracking-tight truncate">
                  Instalá la App de La Morita
                </span>
                <span className="hidden md:inline-block px-1.5 py-0.5 bg-white/20 text-[10px] uppercase font-black rounded-md text-white tracking-wide">
                  PWA Gratis
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-morita-beige/95 truncate font-medium">
                Acceso rápido desde tu pantalla de inicio como en la Play Store / App Store
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer flex items-center space-x-1.5 border border-amber-200"
              title="Instalar La Morita en tu celular"
            >
              <Download className="w-4 h-4 text-purple-950 stroke-[2.5]" />
              <span className="whitespace-nowrap">Instalar</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Cerrar aviso de instalación"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-morita-beige text-morita-mulberry w-full max-w-md rounded-2xl p-5 shadow-2xl border border-morita-sand relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-3.5 right-3.5 text-morita-mulberry/60 hover:text-morita-mulberry p-1 rounded-full hover:bg-morita-sand/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-morita-mulberry flex items-center justify-center text-white shadow-md">
                <Smartphone className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-morita-mulberry">
                  Instalar en iPhone / iPad (iOS)
                </h3>
                <p className="text-xs text-morita-mulberry/70">
                  Sigue estos 2 sencillos pasos en Safari:
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-white/80 p-3.5 rounded-xl border border-morita-sand text-xs text-morita-mulberry">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-morita-sand/50 rounded-lg shrink-0 text-morita-mulberry">
                  <Share className="w-5 h-5 text-morita-terracotta" />
                </div>
                <div>
                  <span className="font-bold block text-sm mb-0.5">1. Toca el botón "Compartir"</span>
                  <p className="text-morita-mulberry/80">
                    Ubicado en la barra inferior de navegación de tu navegador Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2 border-t border-morita-sand/60">
                <div className="p-2 bg-morita-sand/50 rounded-lg shrink-0 text-morita-mulberry">
                  <PlusSquare className="w-5 h-5 text-morita-mulberry" />
                </div>
                <div>
                  <span className="font-bold block text-sm mb-0.5">2. Elige "Agregar a Inicio"</span>
                  <p className="text-morita-mulberry/80">
                    Desplázate hacia abajo en la lista de opciones y presiona <b>"Agregar a la pantalla de inicio"</b>.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSGuide(false);
                setIsVisible(false);
                localStorage.setItem('morita_install_prompt_dismissed', 'true');
              }}
              className="w-full mt-4 py-2.5 bg-morita-mulberry hover:bg-morita-mulberry/90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-amber-300" />
              <span>Entendido</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
