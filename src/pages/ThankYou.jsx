import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600"/>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">תודה שנרשמת לאפליקציית MediZen! 🎉</h1>
        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
          מהיום תוכל לקבל לקוחות חדשים בקלות ולנהל את הקליניקה שלך בצורה קלה ומקצועית
        </p>
        <p className="text-sm text-gray-500 mb-6">
          פרטייך נשלחו לאישור האדמין. נעדכן אותך ב-48 שעות הקרובות.
        </p>
        <div className="bg-[#F5F1E8] rounded-2xl p-6 mb-6 text-right">
          <h3 className="font-bold text-lg mb-3 text-[#7C9885]">מה קיבלת בהרשמה:</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Check size={16} className="text-[#7C9885] mt-1"/>
              <span>כרטיס ביקור דיגיטלי מותאם אישית</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="text-[#7C9885] mt-1"/>
              <span>לוח מודעות לפרסום אירועים וקורסים</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="text-[#7C9885] mt-1"/>
              <span>העלאת תרגילים ומדיטציות ללקוחות</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="text-[#7C9885] mt-1"/>
              <span>מוזיקה וסאונד לקליניקה</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="text-[#7C9885] mt-1"/>
              <span>בוט חכם לחימום לידים ויצירת קשר עם לקוחות</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={16} className="text-[#7C9885] mt-1"/>
              <span>קהילת מטפלים ותמיכה מקצועית</span>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <Button onClick={() => navigate(createPageUrl("TherapistOnboarding"))} className="bg-gradient-to-l from-[#7C9885] to-[#B8A393] hover:opacity-90 px-6 py-6 text-lg font-bold">
            🚀 התחל הגדרה מודרכת
          </Button>
          <Button onClick={() => navigate(createPageUrl("TherapistPricing"))} variant="outline" className="border-2 border-[#7C9885] text-[#7C9885] hover:bg-[#7C9885] hover:text-white px-6 py-6 text-lg font-bold">
            ⭐ שדרג חבילה
          </Button>
        </div>
        <Button onClick={() => navigate(createPageUrl("Landing"))} variant="ghost" className="text-gray-500">
          חזרה לדף הבית
        </Button>
      </motion.div>
    </div>
  );
}