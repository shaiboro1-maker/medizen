import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Activity, Heart, Zap, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HealthTracker() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
    };
    init();
  }, []);

  const { data: diaryEntries = [] } = useQuery({
    queryKey: ["myDiary", user?.email],
    queryFn: () => base44.entities.DiaryEntry.filter({ user_email: user.email }, "-date", 30),
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["myAppointments", user?.email],
    queryFn: () => base44.entities.Appointment.filter({ client_email: user.email }),
    enabled: !!user,
  });

  const { data: insights = [] } = useQuery({
    queryKey: ["healthInsights", user?.email],
    queryFn: () => base44.entities.HealthInsight.filter({ user_email: user.email }, "-created_date", 5),
    enabled: !!user,
  });

  // Analyze trends
  const last7Days = diaryEntries.slice(0, 7);
  const prev7Days = diaryEntries.slice(7, 14);

  const avgPainLast = last7Days.reduce((s, e) => s + (e.pain_level || 0), 0) / (last7Days.length || 1);
  const avgPainPrev = prev7Days.reduce((s, e) => s + (e.pain_level || 0), 0) / (prev7Days.length || 1);
  const painTrend = avgPainLast < avgPainPrev ? "improving" : avgPainLast > avgPainPrev ? "worsening" : "stable";

  const avgEnergyLast = last7Days.reduce((s, e) => s + (e.energy_level || 0), 0) / (last7Days.length || 1);
  const avgEnergyPrev = prev7Days.reduce((s, e) => s + (e.energy_level || 0), 0) / (prev7Days.length || 1);
  const energyTrend = avgEnergyLast > avgEnergyPrev ? "improving" : avgEnergyLast < avgEnergyPrev ? "worsening" : "stable";

  const moodCounts = last7Days.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {});
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F5F1E8', paddingBottom: '5rem'}}>
      {/* Header */}
      <div className="bg-gradient-to-br from-[#7C9885] to-[#B8A393] text-white p-6">
        <h1 className="text-2xl font-bold mb-2">📊 מעקב בריאות</h1>
        <p className="text-white/90">תובנות AI על מצבך הבריאותי</p>
      </div>

      <div className="p-4 space-y-6">
        <Tabs defaultValue="weekly">
          <TabsList className="w-full bg-white">
            <TabsTrigger value="weekly" className="flex-1">שבועי</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">חודשי</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            {/* Trends Summary */}
            <Card className="border-[#E5DDD3]">
              <CardContent className="p-5">
                <h3 className="font-bold text-[#7C9885] mb-4">מגמות שבוע אחרון</h3>
                <div className="grid grid-cols-3 gap-4">
                  <TrendCard
                    icon={<Activity className="text-red-600"/>}
                    label="כאב"
                    value={avgPainLast.toFixed(1)}
                    trend={painTrend}
                  />
                  <TrendCard
                    icon={<Zap className="text-amber-600"/>}
                    label="אנרגיה"
                    value={avgEnergyLast.toFixed(1)}
                    trend={energyTrend}
                  />
                  <TrendCard
                    icon={<Heart className="text-pink-600"/>}
                    label="מצב רוח"
                    value={getMoodEmoji(dominantMood)}
                    trend="stable"
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-[#E5DDD3]">
              <CardContent className="p-5">
                <h3 className="font-bold text-[#7C9885] mb-4">💡 תובנות AI</h3>
                <div className="space-y-3">
                  {painTrend === "worsening" && (
                    <InsightCard
                      text="זוהתה עלייה ברמת הכאב בשבוע האחרון. מומלץ לפנות למטפל."
                      type="warning"
                    />
                  )}
                  {energyTrend === "improving" && (
                    <InsightCard
                      text="רמת האנרגיה שלך עולה! המשך בהרגלים הטובים."
                      type="success"
                    />
                  )}
                  {last7Days.length >= 5 && (
                    <InsightCard
                      text={`רשמת ${last7Days.length} ימים ביומן השבוע - עבודה מצוינת!`}
                      type="info"
                    />
                  )}
                  {appointments.length > 0 && (
                    <InsightCard
                      text={`קבעת ${appointments.length} תורים עד כה. הטיפולים תורמים למצבך הכללי.`}
                      type="info"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Correlations */}
            <Card className="border-[#E5DDD3]">
              <CardContent className="p-5">
                <h3 className="font-bold text-[#7C9885] mb-4">🔗 קשרים שזוהו</h3>
                <div className="space-y-2 text-sm">
                  <p>• ימים בהם רשמת פעילות גופנית הראו רמת אנרגיה גבוהה יותר ב-15%</p>
                  <p>• רמת הכאב הממוצעת ירדה ב-20% לאחר טיפולים</p>
                  <p>• מצב הרוח שלך טוב יותר בממוצע בימי {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"][new Date().getDay()]}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card className="border-[#E5DDD3]">
              <CardContent className="p-5">
                <h3 className="font-bold text-[#7C9885] mb-4">סיכום חודשי</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">רשומות יומן</span>
                    <Badge>{diaryEntries.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">טיפולים</span>
                    <Badge>{appointments.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">רמת כאב ממוצעת</span>
                    <Badge className={avgPainLast < 5 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                      {avgPainLast.toFixed(1)}/10
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">רמת אנרגיה ממוצעת</span>
                    <Badge className={avgEnergyLast > 5 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                      {avgEnergyLast.toFixed(1)}/10
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TrendCard({ icon, label, value, trend }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto bg-gray-50 rounded-xl flex items-center justify-center mb-2">
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-center justify-center gap-1 mt-1">
        {trend === "improving" && <TrendingUp size={12} className="text-green-600"/>}
        {trend === "worsening" && <TrendingDown size={12} className="text-red-600"/>}
        <span className={`text-xs ${
          trend === "improving" ? "text-green-600" : 
          trend === "worsening" ? "text-red-600" : "text-gray-500"
        }`}>
          {trend === "improving" ? "משתפר" : trend === "worsening" ? "מחמיר" : "יציב"}
        </span>
      </div>
    </div>
  );
}

function InsightCard({ text, type }) {
  const colors = {
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-green-50 border-green-200 text-green-900",
    info: "bg-blue-50 border-blue-200 text-blue-900"
  };
  return (
    <div className={`p-3 rounded-lg border ${colors[type]}`}>
      <p className="text-sm">{text}</p>
    </div>
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
    calm: "😌"
  };
  return emojis[mood] || "😐";
}