import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, TrendingUp, Users, 
  ArrowRight, Mail, Phone, Clock, Flame
} from "lucide-react";
import { format } from "date-fns";

export default function TherapistLeadBot() {
  const [therapist, setTherapist] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: me.email });
      if (therapists.length > 0) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: conversations = [] } = useQuery({
    queryKey: ["lead-conversations", therapist?.id],
    queryFn: async () => {
      return await base44.entities.LeadBotConversation.filter({
        therapist_id: therapist.id
      }, "-created_date");
    },
    enabled: !!therapist,
  });

  const activeLeads = conversations.filter(c => c.status === "active");
  const convertedLeads = conversations.filter(c => c.status === "converted");
  const avgLeadScore = conversations.length > 0 
    ? Math.round(conversations.reduce((sum, c) => sum + (c.lead_score || 0), 0) / conversations.length)
    : 0;

  if (!therapist) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">טוען...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white px-6 py-8">
        <button onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight size={24}/>
        </button>
        <h1 className="text-2xl font-bold mb-2">בוט חימום לידים</h1>
        <p className="text-teal-100">ניהול שיחות אוטומטיות עם לקוחות פוטנציאליים</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* סטטיסטיקות */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Users size={24} className="mx-auto mb-2 text-teal-600"/>
              <p className="text-sm text-gray-600">לידים פעילים</p>
              <p className="text-2xl font-bold text-gray-900">{activeLeads.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <TrendingUp size={24} className="mx-auto mb-2 text-green-600"/>
              <p className="text-sm text-gray-600">המרות</p>
              <p className="text-2xl font-bold text-gray-900">{convertedLeads.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <Flame size={24} className="mx-auto mb-2 text-orange-600"/>
              <p className="text-sm text-gray-600">ציון ממוצע</p>
              <p className="text-2xl font-bold text-gray-900">{avgLeadScore}</p>
            </CardContent>
          </Card>
        </div>

        {/* רשימת לידים */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare size={20}/>
              שיחות עם לידים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">פעילים</TabsTrigger>
                <TabsTrigger value="converted">המרות</TabsTrigger>
                <TabsTrigger value="all">הכל</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="space-y-3 mt-4">
                {activeLeads.map((conv) => (
                  <LeadCard key={conv.id} conversation={conv}/>
                ))}
                {activeLeads.length === 0 && (
                  <p className="text-center text-gray-500 py-8">אין לידים פעילים</p>
                )}
              </TabsContent>

              <TabsContent value="converted" className="space-y-3 mt-4">
                {convertedLeads.map((conv) => (
                  <LeadCard key={conv.id} conversation={conv}/>
                ))}
                {convertedLeads.length === 0 && (
                  <p className="text-center text-gray-500 py-8">אין המרות עדיין</p>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-3 mt-4">
                {conversations.map((conv) => (
                  <LeadCard key={conv.id} conversation={conv}/>
                ))}
                {conversations.length === 0 && (
                  <p className="text-center text-gray-500 py-8">אין שיחות</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* הגדרות בוט */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              onClick={() => navigate('/therapist-minisite-manager')}
              className="w-full bg-teal-600"
            >
              <MessageSquare size={18} className="ml-2"/>
              הגדרות בוט
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LeadCard({ conversation }) {
  const lastMessage = conversation.messages?.[conversation.messages.length - 1];
  
  const getScoreColor = (score) => {
    if (score >= 70) return "text-red-600 bg-red-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-gray-600 bg-gray-50";
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-blue-100 text-blue-800",
      converted: "bg-green-100 text-green-800",
      cold: "bg-gray-100 text-gray-800"
    };
    const labels = {
      active: "פעיל",
      converted: "הומר",
      cold: "קר"
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{conversation.lead_name || "ליד אנונימי"}</h3>
          <div className="flex items-center gap-3 mt-1">
            {conversation.lead_email && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Mail size={12}/>
                {conversation.lead_email}
              </span>
            )}
            {conversation.lead_phone && (
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <Phone size={12}/>
                {conversation.lead_phone}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(conversation.status)}
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(conversation.lead_score)}`}>
            <Flame size={12} className="inline ml-1"/>
            {conversation.lead_score || 0}
          </div>
        </div>
      </div>
      {lastMessage && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">{lastMessage.message}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Clock size={10}/>
            {format(new Date(lastMessage.timestamp), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      )}
      {conversation.notes && (
        <p className="text-xs text-gray-600 mt-2 italic">📝 {conversation.notes}</p>
      )}
    </div>
  );
}