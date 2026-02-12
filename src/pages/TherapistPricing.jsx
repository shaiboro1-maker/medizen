import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  {
    id: "trial",
    name: "ניסיון חינם",
    price: "חינם",
    duration: "14 יום",
    features: [
      "מיני-סייט בסיסי",
      "עד 10 תורים בחודש",
      "ניהול לקוחות בסיסי",
      "תמיכה בדוא\"ל"
    ],
    cta: "התחל ניסיון חינם",
    popular: false,
    icon: <Zap className="text-blue-500" size={32}/>
  },
  {
    id: "basic",
    name: "בסיסי",
    price: "89",
    duration: "לחודש",
    features: [
      "כל מה שיש בחינם",
      "תורים ללא הגבלה",
      "מיני-סייט מותאם אישית",
      "העלאת תכנים ומדיה",
      "ניהול זמינות מתקדם",
      "תזכורות אוטומטיות",
      "בוט וואטסאפ",
      "דוחות וסטטיסטיקות",
      "תמיכה מהירה"
    ],
    cta: "התחל עכשיו",
    popular: true,
    icon: <Sparkles className="text-amber-500" size={32}/>
  },
  {
    id: "premium",
    name: "פרימיום",
    price: "199",
    duration: "לחודש",
    features: [
      "כל מה שיש בבסיסי",
      "קידום בדף הבית",
      "תג 'מומלץ' בכרטיס",
      "עדיפות בתוצאות חיפוש",
      "קמפיינים פרסומיים",
      "ניהול 4 נציגויות",
      "אוטומציה לחימום לידים",
      "גישה למועדון מטפלים",
      "תמיכה VIP 24/7"
    ],
    cta: "שדרג לפרימיום",
    popular: false,
    icon: <Crown className="text-purple-500" size={32}/>
  }
];

export default function TherapistPricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const subscribeMutation = useMutation({
    mutationFn: async (planId) => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      
      if (therapists.length === 0) {
        throw new Error("לא נמצא פרופיל מטפל");
      }

      const subscriptionType = planId === "trial" ? "free" : planId === "basic" ? "basic" : "premium";
      const expiresDate = new Date();
      expiresDate.setMonth(expiresDate.getMonth() + (planId === "trial" ? 0.5 : 1));

      await base44.entities.Therapist.update(therapists[0].id, {
        subscription_type: subscriptionType,
        subscription_expires: expiresDate.toISOString().split('T')[0],
        is_featured: planId === "premium"
      });

      return { success: true };
    },
    onSuccess: () => {
      navigate("/TherapistDashboard");
    }
  });

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    subscribeMutation.mutate(planId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            בחר את החבילה המתאימה לך
          </h1>
          <p className="text-lg text-gray-600">
            כל החבילות כוללות ניסיון ללא התחייבות - אפשר לבטל בכל עת
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl shadow-xl p-8 ${
                plan.popular ? "ring-4 ring-teal-500 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    הכי פופולרי
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-black text-teal-600">
                    {plan.price}
                  </span>
                  {plan.price !== "חינם" && <span className="text-gray-500">₪</span>}
                </div>
                <p className="text-gray-500 text-sm mt-1">{plan.duration}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="text-teal-500 flex-shrink-0 mt-0.5" size={18}/>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={subscribeMutation.isPending && selectedPlan === plan.id}
                className={`w-full rounded-full py-6 font-bold text-base ${
                  plan.popular
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {subscribeMutation.isPending && selectedPlan === plan.id ? "מעבד..." : plan.cta}
              </Button>

              {plan.id === "trial" && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  ללא צורך בפרטי אשראי
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">יש לך שאלות? אנחנו כאן לעזור</p>
          <Button variant="outline" onClick={() => navigate("/Support")}>
            צור קשר עם התמיכה
          </Button>
        </div>
      </div>
    </div>
  );
}