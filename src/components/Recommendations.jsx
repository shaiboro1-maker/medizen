import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Recommendations({ userType = "client", userId }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: appointments = [] } = useQuery({
    queryKey: ["userAppointments", userId],
    queryFn: () => base44.entities.Appointment.filter({ client_email: userId }),
    enabled: !!userId && userType === "client",
  });

  const { data: therapist } = useQuery({
    queryKey: ["therapistForRecs", userId],
    queryFn: async () => {
      const therapists = await base44.entities.Therapist.filter({ user_email: userId });
      return therapists[0];
    },
    enabled: !!userId && userType === "therapist",
  });

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        
        let prompt = "";
        if (userType === "client") {
          const pastServices = appointments.map(a => a.service_name).join(", ");
          const therapists = [...new Set(appointments.map(a => a.therapist_name))].join(", ");
          
          prompt = `אתה מערכת המלצות חכמה לפלטפורמת בריאות. המשתמש ביקר אצל המטפלים הבאים: ${therapists || "טרם ביקר"}.
השירותים שקיבל: ${pastServices || "אין נתונים"}.

המלץ על:
1. 3 תרגילים רלוונטיים (קטגוריות: back, neck, shoulder, knee, heel, hip, wrist, general, stretching, strengthening)
2. 2 מתכונים בריאותיים (קטגוריות: anti_inflammatory, energy, sleep, weight_loss, muscle, skin, immunity, general)
3. 2 מוצרים מומלצים (קטגוריות: insoles, massage_tools, supplements, cosmetics, sports_equipment)
4. פודקאסט אחד בתחום הבריאות

החזר רק את הקטגוריות (שמות באנגלית כמו שכתוב למעלה), ללא הסברים. פורמט:
exercises: back,neck,shoulder
recipes: energy,anti_inflammatory
products: massage_tools,supplements
podcast_topic: שיקום פציעות ספורט`;
        } else if (userType === "therapist") {
          const categories = therapist?.categories?.join(", ") || "";
          const specializations = therapist?.specializations?.join(", ") || "";
          
          prompt = `אתה מערכת המלצות למטפלים. המטפל הנוכחי בקטגוריות: ${categories}.
התמחויות: ${specializations}.

המלץ על:
1. 3 מטפלים אחרים בתחומים דומים/משלימים שכדאי לשתף פעולה איתם (קטגוריות: acupuncture, physio, cosmetics, nutrition, sports, massage, body_mind, chiropractic, hair)
2. 2 נושאי תוכן שכדאי ליצור (תרגילים או מתכונים)
3. קטגוריית מוצרים שכדאי להוסיף לחנות

החזר רק את הנתונים, ללא הסברים:
therapist_categories: physio,nutrition,massage
content_topics: תרגיל חיזוק גב,מתכון אנרגיה
product_category: massage_tools`;
        }

        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: false,
        });

        setRecommendations(result);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, userType, appointments, therapist]);

  const parseRecommendations = () => {
    if (!recommendations) return null;
    
    const lines = recommendations.split("\n").filter(l => l.trim());
    const parsed = {};
    
    lines.forEach(line => {
      const [key, value] = line.split(":").map(s => s.trim());
      if (key && value) {
        parsed[key] = value.split(",").map(v => v.trim());
      }
    });
    
    return parsed;
  };

  const recs = parseRecommendations();

  if (loading) {
    return (
      <Card className="border-dashed border-2 border-teal-200">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3"/>
          <p className="text-gray-500 text-sm">מכין המלצות מותאמות אישית...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recs) return null;

  return (
    <Card className="bg-gradient-to-bl from-teal-50 to-emerald-50 border-teal-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="text-amber-500" size={20}/>
          המלצות מותאמות אישית
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {userType === "client" && (
          <>
            {recs.exercises && (
              <div>
                <p className="text-sm font-semibold mb-1">תרגילים מומלצים:</p>
                <div className="flex flex-wrap gap-2">
                  {recs.exercises.map((cat, i) => (
                    <Link key={i} to={createPageUrl(`Exercises?category=${cat}`)} className="text-xs px-3 py-1 bg-white rounded-full hover:bg-teal-100 transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {recs.recipes && (
              <div>
                <p className="text-sm font-semibold mb-1">מתכונים מומלצים:</p>
                <div className="flex flex-wrap gap-2">
                  {recs.recipes.map((cat, i) => (
                    <Link key={i} to={createPageUrl(`Recipes?category=${cat}`)} className="text-xs px-3 py-1 bg-white rounded-full hover:bg-teal-100 transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {recs.products && (
              <div>
                <p className="text-sm font-semibold mb-1">מוצרים מומלצים:</p>
                <div className="flex flex-wrap gap-2">
                  {recs.products.map((cat, i) => (
                    <Link key={i} to={createPageUrl(`Shop?category=${cat}`)} className="text-xs px-3 py-1 bg-white rounded-full hover:bg-teal-100 transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {recs.podcast_topic && (
              <div>
                <p className="text-sm font-semibold mb-1">פודקאסט מומלץ:</p>
                <Link to={createPageUrl("Podcasts")} className="text-xs px-3 py-1 bg-white rounded-full hover:bg-teal-100 transition-colors inline-block">
                  {recs.podcast_topic[0]}
                </Link>
              </div>
            )}
          </>
        )}

        {userType === "therapist" && (
          <>
            {recs.therapist_categories && (
              <div>
                <p className="text-sm font-semibold mb-1">מטפלים לשיתוף פעולה:</p>
                <div className="flex flex-wrap gap-2">
                  {recs.therapist_categories.map((cat, i) => (
                    <Link key={i} to={createPageUrl(`TherapistSearch?category=${cat}`)} className="text-xs px-3 py-1 bg-white rounded-full hover:bg-teal-100 transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {recs.content_topics && (
              <div>
                <p className="text-sm font-semibold mb-1">נושאי תוכן מומלצים:</p>
                <div className="space-y-1">
                  {recs.content_topics.map((topic, i) => (
                    <p key={i} className="text-xs px-3 py-1 bg-white rounded-lg">{topic}</p>
                  ))}
                </div>
              </div>
            )}
            {recs.product_category && (
              <div>
                <p className="text-sm font-semibold mb-1">קטגוריית מוצר מומלצת לחנות:</p>
                <span className="text-xs px-3 py-1 bg-white rounded-full inline-block">{recs.product_category[0]}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}