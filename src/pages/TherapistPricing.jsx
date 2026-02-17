import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Check, Crown, Zap, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const PACKAGES = [
  {
    id: "basic",
    name: "חבילה בסיסית",
    price: "49",
    currency: "₪",
    period: "לחודש",
    icon: <Star size={24}/>,
    color: "from-blue-400 to-cyan-400",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&h=400&fit=crop",
    features: [
      "כרטיס ביקור דיגיטלי מותאם אישית",
      "גלריית תמונות ווידאו",
      "פרטי קשר ושעות פעילות",
      "קישורים לרשתות חברתיות",
      "דירוג וביקורות לקוחות",
      "תיאור שירותים ומחירון",
      "דף נחיתה עם הוראות הורדה",
    ]
  },
  {
    id: "pro",
    name: "חבילת Pro",
    price: "99",
    currency: "₪",
    period: "לחודש",
    icon: <Zap size={24}/>,
    color: "from-purple-400 to-pink-400",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    popular: true,
    features: [
      "כל היכולות של החבילה הבסיסית",
      "בוט חכם לניהול לידים וצ'אט אוטומטי",
      "תזמון תורים אוטומטי",
      "תזכורות ללקוחות באמצעות SMS",
      "CRM מובנה לניהול לקוחות",
      "לוח מודעות לפרסום אירועים וקורסים",
      "העלאת תרגילים ומדיטציות ללקוחות",
    ]
  },
  {
    id: "premium",
    name: "חבילת Premium",
    price: "149",
    currency: "₪",
    period: "לחודש",
    icon: <Crown size={24}/>,
    color: "from-amber-400 to-orange-400",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    features: [
      "כל היכולות של חבילת Pro",
      "סליקת תשלומים והנהלת חשבוניות",
      "פופ-אפ בדף הבית 4 פעמים ביום",
      "פוש אפ שבועי למנויים באיזור הרלוונטי",
      "דשבורד פיננסי מתקדם",
      "אנליטיקס ודוחות מפורטים",
      "תמיכה ייעודית VIP 24/7",
      "אפשרות לחנות מוצרים מקוונת",
    ]
  },
];

export default function TherapistPricing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [therapist, setTherapist] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const therapists = await base44.entities.Therapist.filter({ user_email: me.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const handleSelectPackage = async (packageId) => {
    // In production, this would integrate with payment gateway
    alert(`בחרת בחבילת ${PACKAGES.find(p => p.id === packageId)?.name}. תכונה זו תהיה זמינה בקרוב!`);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowRight size={16} className="ml-2"/> חזור
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            בחר את החבילה המתאימה לך
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            התחל עם החבילה הבסיסית ושדרג בכל עת למקסימום יכולות
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold">
            🎁 התנסות 14 יום חינם - ללא אשראי!
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${pkg.popular ? 'border-4 border-purple-400 shadow-2xl' : 'border border-gray-200'}`}>
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-bold">
                      🔥 הכי פופולרי
                    </div>
                  </div>
                )}
                
                <div className="relative h-48 overflow-hidden">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className={`absolute bottom-4 right-4 w-14 h-14 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center`}>
                    {pkg.icon}
                  </div>
                </div>
                
                <CardHeader className="pt-6">
                  <CardTitle className="text-center text-2xl">{pkg.name}</CardTitle>
                  <div className="text-center mt-4">
                    <span className="text-5xl font-black text-gray-900">{pkg.price}</span>
                    <span className="text-2xl text-gray-600 mr-1">{pkg.currency}</span>
                    <div className="text-sm text-gray-500 mt-1">{pkg.period}</div>
                    <div className="text-xs text-green-600 font-semibold mt-2">14 יום ניסיון חינם</div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check size={18} className="text-green-600 mt-0.5 flex-shrink-0"/>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}

                  <Button
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`w-full mt-6 ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
                        : `bg-gradient-to-r ${pkg.color} hover:opacity-90`
                    } text-white font-bold py-6`}
                  >
                    {therapist?.subscription_type === pkg.id ? "החבילה הנוכחית" : "בחר חבילה"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-3">שאלות? צריך עזרה בבחירה?</h2>
          <p className="text-gray-600 mb-6">
            הצוות שלנו כאן כדי לעזור לך למצוא את החבילה המושלמת עבורך
          </p>
          <Button 
            onClick={() => window.open('https://wa.me/972523753285', '_blank')}
            className="bg-[#7C9885] hover:bg-[#6A8573] px-8 py-6 text-lg"
          >
            צור קשר עם התמיכה
          </Button>
        </div>
      </div>
    </div>
  );
}