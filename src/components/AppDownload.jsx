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
    <section className="bg-gradient-to-bl from-teal-700 via-emerald-600 to-teal-600 py-16 px-4">
      <div className="max-w-5xl mx-auto text-center text-white">
        <Smartphone size={64} className="mx-auto mb-6 opacity-90"/>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          התקן את האפליקציה
        </h2>
        <p className="text-lg md:text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
          גישה מהירה ונוחה לכל השירותים מהמסך הראשי של הנייד - קביעת תורים, תרגילים, מתכונים ועוד
        </p>
        <Button onClick={handleInstall} size="lg" className="bg-white text-teal-700 hover:bg-teal-50 rounded-full px-8 py-6 text-lg font-semibold shadow-lg">
          <Plus size={20} className="ml-2"/>
          {isInstallable ? 'התקן עכשיו' : 'הוסף למסך הבית'}
        </Button>
        <p className="text-sm text-teal-100 mt-6">התקנה מהירה ישירות מהדפדפן</p>
      </div>
    </section>
  );
}