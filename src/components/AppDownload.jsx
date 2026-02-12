import React, { useState, useEffect } from "react";
import { Smartphone, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppDownload({ variant = "default" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('התקן את האפליקציה על ידי לחיצה על "הוסף למסך הבית" בדפדפן שלך');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };
  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-l from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={24}/>
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">התקן את האפליקציה</h3>
            <p className="text-sm text-teal-50">גישה מהירה מהמסך הראשי</p>
          </div>
          <Button onClick={handleInstall} variant="secondary" className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl">
            <Plus size={16} className="ml-2"/> התקן
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="fixed top-20 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-40 bg-gradient-to-l from-teal-600 to-emerald-600 rounded-2xl shadow-2xl p-5 text-white">
      <div className="text-center">
        <div className="flex items-center gap-3 mb-3">
          <Smartphone size={32} className="opacity-90"/>
          <h3 className="text-lg font-bold">התקן את האפליקציה</h3>
        </div>
        <p className="text-sm text-teal-50 mb-4">
          גישה מהירה לכל השירותים מהמסך הראשי
        </p>
        <Button onClick={handleInstall} className="w-full bg-white text-teal-700 hover:bg-teal-50 rounded-xl">
          <Plus size={16} className="ml-2"/>
          {isInstallable ? 'התקן עכשיו' : 'הוסף למסך הבית'}
        </Button>
      </div>
    </section>
  );
}