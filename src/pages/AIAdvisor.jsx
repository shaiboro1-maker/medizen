import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, Heart, Music, Utensils, Activity, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function AIAdvisor() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ["myDiary", user?.email],
    queryFn: () => base44.entities.DiaryEntry.filter({ user_email: user.email }, "-date", 10),
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["myAppointments", user?.email],
    queryFn: () => base44.entities.Appointment.filter({ client_email: user.email }),
    enabled: !!user,
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["myInteractions", user?.email],
    queryFn: () => base44.entities.CustomerInteraction.filter({ customer_email: user.email }, "-created_date", 20),
    enabled: !!user,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["myRecommendations", user?.email],
    queryFn: () => base44.entities.AIRecommendation.filter({ user_email: user.email }, "-created_date", 10),
    enabled: !!user,
  });

  // Analyze user data
  const lastMood = diaryEntries[0]?.mood || "neutral";
  const avgPain = diaryEntries.slice(0, 5).reduce((sum, e) => sum + (e.pain_level || 0), 0) / Math.min(5, diaryEntries.length);
  const avgEnergy = diaryEntries.slice(0, 5).reduce((sum, e) => sum + (e.energy_level || 0), 0) / Math.min(5, diaryEntries.length);
  
  const preferredCategories = interactions
    .filter(i => i.interaction_type === "appointment")
    .map(i => i.interaction_subtype)
    .slice(0, 3);

  if (isLoading) {
    return <div className="p-6">טוען...</div>;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F5F1E8', paddingBottom: '5rem'}}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#7C9885] to-[#B8A393] text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={28}/>
          <h1 className="text-2xl font-bold">העוזר האישי שלך</h1>
        </div>
        <p className="text-white/90">המלצות מותאמות אישית בהתבסס על הפעילות שלך</p>
      </div>

      <div className="p-4 space-y-6">
        {/* User Status Summary */}
        <Card className="border-[#E5DDD3]">
          <CardContent className="p-5">
            <h3 className="font-bold text-[#7C9885] mb-4">המצב שלך היום</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-1">{getMoodEmoji(lastMood)}</div>
                <p className="text-xs text-gray-500">מצב רוח</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7C9885] mb-1">{avgEnergy.toFixed(1)}/10</div>
                <p className="text-xs text-gray-500">רמת אנרגיה ממוצעת</p>
              </div>
            </div>
            {avgPain > 3 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-900">💡 זיהינו רמת כאב גבוהה. מומלץ להתייעץ עם מטפל</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <div>
          <h2 className="text-lg font-bold text-[#7C9885] mb-3">🎯 המלצות מותאמות אישית</h2>
          <div className="space-y-3">
            <RecommendationCard
              icon={<Activity className="text-blue-600"/>}
              title="תרגילים מומלצים"
              description={avgPain > 5 ? "תרגילי הקלה לכאב" : "תרגילי חיזוק כלליים"}
              action="צפה בתרגילים"
              link="Exercises"
              reason={`על סמך רמת כאב: ${avgPain.toFixed(1)}/10`}
              bg="bg-blue-50"
            />
            
            <RecommendationCard
              icon={<Music className="text-purple-600"/>}
              title="מוזיקה מומלצת"
              description={lastMood === "stressed" ? "מוזיקה מרגיעה" : avgEnergy < 5 ? "מוזיקה מעוררת" : "מוזיקה להרגעה"}
              action="האזן עכשיו"
              link="Music"
              reason={`מתאים למצב הרוח: ${getMoodLabel(lastMood)}`}
              bg="bg-purple-50"
            />

            <RecommendationCard
              icon={<Utensils className="text-green-600"/>}
              title="מתכונים מומלצים"
              description={avgEnergy < 5 ? "מתכונים לאנרגיה" : "מתכונים בריאים"}
              action="לרשימת המתכונים"
              link="Recipes"
              reason={`מותאם לרמת האנרגיה שלך`}
              bg="bg-green-50"
            />

            {preferredCategories.length > 0 && (
              <RecommendationCard
                icon={<User className="text-teal-600"/>}
                title="טיפולים מומלצים"
                description={`המשך עם ${preferredCategories[0]}`}
                action="מצא מטפל"
                link="TherapistSearch"
                reason="על סמך היסטוריית הטיפולים שלך"
                bg="bg-teal-50"
              />
            )}
          </div>
        </div>

        {/* Recent Activity Insights */}
        <Card className="border-[#E5DDD3]">
          <CardContent className="p-5">
            <h3 className="font-bold text-[#7C9885] mb-4">💡 תובנות</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <TrendingUp size={16} className="text-green-600 mt-0.5"/>
                <p>ביצעת {diaryEntries.length} רשומות ביומן ב-30 הימים האחרונים</p>
              </div>
              <div className="flex items-start gap-2">
                <Heart size={16} className="text-red-600 mt-0.5"/>
                <p>קבעת {appointments.length} תורים עד כה</p>
              </div>
              {avgEnergy < 5 && (
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-amber-600 mt-0.5"/>
                  <p>רמת האנרגיה שלך נמוכה לאחרונה - מומלץ לשלב פעילות גופנית קלה</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecommendationCard({ icon, title, description, action, link, reason, bg }) {
  return (
    <Link to={createPageUrl(link)}>
      <Card className="border-[#E5DDD3] hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              {icon}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#7C9885] mb-1">{title}</h4>
              <p className="text-sm text-gray-600 mb-2">{description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">{reason}</Badge>
                <Button size="sm" variant="ghost" className="text-[#7C9885]">
                  {action} ←
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getMoodEmoji(mood) {
  const emojis = {
    great: "😄",
    good: "🙂",
    okay: "😐",
    bad: "😞",
    terrible: "😢",
    stressed: "😰",
    calm: "😌",
    neutral: "😐"
  };
  return emojis[mood] || "😐";
}

function getMoodLabel(mood) {
  const labels = {
    great: "מצוין",
    good: "טוב",
    okay: "בסדר",
    bad: "רע",
    terrible: "גרוע",
    stressed: "מלחיץ",
    calm: "רגוע",
    neutral: "ניטרלי"
  };
  return labels[mood] || mood;
}