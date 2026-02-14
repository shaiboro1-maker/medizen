import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, Share2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HealthNews() {
  const navigate = useNavigate();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["health-news", new Date().toDateString()],
    queryFn: async () => {
      const today = new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `תן לי 10 חדשות בריאות עדכניות ומעניינות מישראל והעולם מהיום ${today}.
        
        החזר רשימה בפורמט JSON:
        [
          {
            "title": "כותרת החדשה",
            "summary": "תקציר קצר של 2-3 שורות",
            "category": "תזונה/כושר/מחקר/טיפולים/מניעה",
            "source": "מקור החדשה",
            "date": "${today}"
          }
        ]`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            news: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  category: { type: "string" },
                  source: { type: "string" },
                  date: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      return response.news || [];
    },
  });

  const categoryColors = {
    "תזונה": "bg-green-100 text-green-800",
    "כושר": "bg-blue-100 text-blue-800",
    "מחקר": "bg-purple-100 text-purple-800",
    "טיפולים": "bg-teal-100 text-teal-800",
    "מניעה": "bg-amber-100 text-amber-800"
  };

  const handleShare = (item) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={24}/>
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-teal-600"/>
            <h1 className="text-xl font-bold">חדשות בריאות</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">טוען חדשות...</div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-gray-400">אין חדשות זמינות</div>
        ) : (
          news.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-2">
                <Badge className={categoryColors[item.category] || "bg-gray-100 text-gray-800"}>
                  {item.category}
                </Badge>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.summary}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{item.source}</span>
                <Button size="sm" variant="ghost" onClick={() => handleShare(item)}>
                  <Share2 size={14} className="ml-1"/> שתף
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}