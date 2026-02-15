import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { Check, X, ChevronRight, Calendar, DollarSign, Globe, Image, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import AppDownload from "../components/AppDownload";

const ONBOARDING_STEPS = [
  {
    id: "minisite",
    title: "השלם את המיני-סייט שלך",
    description: "תמונת פרופיל, לוגו, עיצוב וגלריה",
    icon: <Globe size={20}/>,
    page: "TherapistMiniSiteSettings",
    checkField: (therapist) => therapist?.profile_image && therapist?.minisite_settings
  },
  {
    id: "services",
    title: "הגדר שירותים וטיפולים",
    description: "מחירון, משך טיפול, ודמי רצינות",
    icon: <DollarSign size={20}/>,
    page: "TherapistServices",
    checkEntity: "Service"
  },
  {
    id: "availability",
    title: "קבע זמינות שבועית",
    description: "שעות פעילות לקבלת תורים",
    icon: <Calendar size={20}/>,
    page: "TherapistAvailability",
    checkEntity: "Availability"
  },

  {
    id: "pricing",
    title: "בחר חבילת מנוי",
    description: "שדרג לפיצ'רים מתקדמים",
    icon: <Star size={20}/>,
    page: "TherapistPricing"
  }
];

export default function TherapistOnboarding() {
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) {
        setTherapist(therapists[0]);
        
        const servs = await base44.entities.Service.filter({ therapist_id: therapists[0].id });
        setServices(servs);
        
        const avail = await base44.entities.Availability.filter({ therapist_id: therapists[0].id });
        setAvailability(avail);
        
        checkCompletedSteps(therapists[0], servs, avail);
      }
    };
    init();
  }, []);

  const checkCompletedSteps = (therapist, servs, avail) => {
    const completed = [];
    
    if (therapist?.profile_image && therapist?.minisite_settings) completed.push("minisite");
    if (servs?.length > 0) completed.push("services");
    if (avail?.length > 0) completed.push("availability");
    if (therapist?.subscription_type !== "free") completed.push("pricing");
    
    setCompletedSteps(completed);
  };

  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

  const handleSkip = () => {
    // Check if all steps are completed
    if (completedSteps.length < ONBOARDING_STEPS.length) {
      alert("יש להשלים את כל השלבים לפני המעבר לדשבורד");
      return;
    }
    navigate(createPageUrl("TherapistDashboard"));
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#7C9885] to-[#B8A393] rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={40} className="text-white"/>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3">ברוך הבא ל-MediZen! 🎉</h1>
          <p className="text-lg text-gray-600 mb-6">
            בואו נגדיר את החשבון שלך תוך דקות ספורות
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">התקדמות</span>
              <span className="text-sm font-semibold text-[#7C9885]">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3"/>
            <p className="text-xs text-gray-500 mt-2">
              {completedSteps.length} מתוך {ONBOARDING_STEPS.length} שלבים הושלמו
            </p>
          </div>
        </motion.div>

        <div className="space-y-4 mb-8">
          {ONBOARDING_STEPS.map((step, i) => {
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} cursor-pointer hover:shadow-md transition-all`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                        {isCompleted ? (
                          <Check size={24} className="text-white"/>
                        ) : (
                          <span className="text-gray-600">{step.icon}</span>
                        )}
                      </div>
                      
                      <div className="flex-1 text-right">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      
                      {!isCompleted && (
                        <Button 
                          onClick={() => navigate(createPageUrl(step.page))}
                          className="bg-[#7C9885] hover:bg-[#6A8573]"
                        >
                          התחל <ChevronRight size={16} className="mr-2"/>
                        </Button>
                      )}
                      
                      {isCompleted && (
                        <Badge className="bg-green-500">הושלם</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5DDD3] p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7C9885] to-[#B8A393] rounded-xl flex items-center justify-center">
              <Globe size={24} className="text-white"/>
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-lg text-gray-900">הורד את אפליקציית המטפלים</h3>
              <p className="text-sm text-gray-600">PWA - התקן ישירות מהדפדפן ללא App Store</p>
            </div>
          </div>
          <AppDownload variant="compact"/>
        </div>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="text-yellow-500"/>
              החבילות שלנו
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-green-50 border-2 border-green-400 p-4 rounded-lg mb-3 text-center">
              <Badge className="bg-green-500 mb-2">🎁 ניסיון חינם</Badge>
              <h4 className="font-bold text-lg mb-1">14 יום ללא עלות</h4>
              <p className="text-xs text-gray-600">ללא כרטיס אשראי • ביטול בכל עת</p>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold mb-2">בסיסית - ₪49</h4>
                <p className="text-xs text-gray-600">כרטיס ביקור דיגיטלי וגלריה</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-purple-400">
                <Badge className="bg-purple-500 mb-2">פופולרי</Badge>
                <h4 className="font-bold mb-2">Pro - ₪99</h4>
                <p className="text-xs text-gray-600">+ בוט חכם וניהול תורים</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-bold mb-2">Premium - ₪149</h4>
                <p className="text-xs text-gray-600">+ סליקה ופרסום בדף הבית</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate(createPageUrl("TherapistPricing"))}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              השווה חבילות
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center gap-4">
          {progress === 100 ? (
            <Button 
              onClick={() => navigate(createPageUrl("TherapistDashboard"))}
              className="bg-gradient-to-l from-[#7C9885] to-[#B8A393] px-8"
            >
              סיימתי! לדשבורד <Check size={16} className="mr-2"/>
            </Button>
          ) : (
            <Button 
              onClick={handleSkip}
              variant="outline"
              className="px-8 opacity-50 cursor-not-allowed"
              disabled
            >
              יש להשלים את כל השלבים
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}