import React from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";

export default function Webinars() {
  const navigate = useNavigate();
  const { data: webinars = [], isLoading } = useQuery({
    queryKey: ["webinars"],
    queryFn: () => base44.entities.Webinar.list("-date"),
  });

  const upcoming = webinars.filter(w => w.status === "upcoming");
  const completed = webinars.filter(w => w.status === "completed");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>
      <h1 className="text-3xl font-bold mb-2">וובינרים</h1>
      <p className="text-gray-500 mb-8">סדנאות והרצאות אונליין מהמומחים המובילים</p>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-gray-100 rounded-xl p-1 mb-8">
          <TabsTrigger value="upcoming">קרובים ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="completed">הקלטות ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl"/>)}</div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-20 text-gray-400">אין וובינרים קרובים</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {upcoming.map(w => (
                <WebinarCard key={w.id} webinar={w} type="upcoming"/>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completed.length === 0 ? (
            <div className="text-center py-20 text-gray-400">אין הקלטות זמינות</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {completed.map(w => (
                <WebinarCard key={w.id} webinar={w} type="recording"/>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WebinarCard({ webinar, type }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
      <div className="h-40 bg-gradient-to-bl from-purple-50 to-teal-50 flex items-center justify-center relative">
        {webinar.image_url ? (
          <img src={webinar.image_url} alt={webinar.title} className="w-full h-full object-cover"/>
        ) : (
          <Video size={40} className="text-purple-200"/>
        )}
        {webinar.is_free && (
          <Badge className="absolute top-3 left-3 bg-green-500 text-white">חינם</Badge>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2">{webinar.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{webinar.therapist_name}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Calendar size={12}/> {moment(webinar.date).format("DD/MM/YYYY HH:mm")}</span>
          {webinar.max_participants && (
            <span className="flex items-center gap-1"><Users size={12}/> {webinar.current_participants || 0}/{webinar.max_participants}</span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-teal-700">{webinar.is_free ? "חינם" : `₪${webinar.price}`}</span>
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 rounded-xl">
            {type === "upcoming" ? "הרשמה" : "צפייה"}
          </Button>
        </div>
      </div>
    </div>
  );
}