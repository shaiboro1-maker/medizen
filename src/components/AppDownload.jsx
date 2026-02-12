import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Smartphone, Download, Plus, HelpCircle } from "lucide-react";
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
      // Detect platform and show specific instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('להתקנה ב-iPhone:\n1. לחץ על כפתור השיתוף למטה\n2. גלול למטה ובחר "הוסף למסך הבית"\n3. לחץ על "הוסף"');
      } else if (isAndroid) {
        alert('להתקנה ב-Android:\n1. לחץ על תפריט הדפדפן (⋮)\n2. בחר "התקן אפליקציה" או "הוסף למסך הבית"\n3. אשר את ההתקנה');
      } else {
        alert('להתקנת האפליקציה:\nחפש את אייקון ההתקנה בשורת הכתובת של הדפדפן, או בתפריט הדפדפן בחר "התקן אפליקציה"');
      }
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
    <div className="bg-gradient-to-l from-teal-600 to-emerald-600 rounded-xl shadow-md p-4 text-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Smartphone size={20}/>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-0.5">התקן את האפליקציה</h3>
          <p className="text-xs text-teal-50">גישה מהירה מהמסך הראשי</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl("Support")}>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-lg">
              <HelpCircle size={16}/>
            </Button>
          </Link>
          <Button onClick={handleInstall} size="sm" className="bg-white text-teal-700 hover:bg-teal-50 rounded-lg px-4 text-xs font-semibold">
            <Plus size={14} className="ml-1"/>
            התקן
          </Button>
        </div>
      </div>
    </div>
  );
}