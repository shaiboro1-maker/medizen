import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, AlertCircle, RefreshCw, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function TherapistIntegrations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const updateTherapistMutation = useMutation({
    mutationFn: (data) => base44.entities.Therapist.update(therapist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist"] });
      alert("ההגדרות נשמרו בהצלחה!");
    },
  });

  const handleGoogleCalendarConnect = async () => {
    try {
      setSyncing(true);
      // Backend functions are not enabled, so we'll simulate the connection
      // In production, this would use OAuth flow
      alert("חיבור Google Calendar דורש Backend Functions. נא לפנות לתמיכה להפעלת התכונה.");
      setSyncing(false);
    } catch (error) {
      alert("שגיאה בחיבור ל-Google Calendar");
      setSyncing(false);
    }
  };

  const handleToggleGoogleCalendar = async (enabled) => {
    await updateTherapistMutation.mutateAsync({
      google_calendar_connected: enabled
    });
  };

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#7C9885]">אינטגרציות</h1>
          <p className="text-[#A8947D]">חבר את המערכת לכלים חיצוניים</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Google Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar className="text-blue-600" size={24}/>
                </div>
                <div>
                  <CardTitle>Google Calendar</CardTitle>
                  <p className="text-sm text-gray-500">סנכרן תורים ללוח השנה שלך</p>
                </div>
              </div>
              {therapist?.google_calendar_connected ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle size={14} className="ml-1"/> מחובר
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle size={14} className="ml-1"/> לא מחובר
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">יכולות:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ סנכרון אוטומטי של תורים חדשים</li>
                <li>✓ עדכון תורים קיימים</li>
                <li>✓ מחיקת תורים שבוטלו</li>
                <li>✓ תזכורות אוטומטיות</li>
              </ul>
            </div>

            {!therapist?.google_calendar_connected ? (
              <Button 
                onClick={handleGoogleCalendarConnect}
                disabled={syncing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {syncing ? (
                  <>
                    <RefreshCw size={16} className="ml-2 animate-spin"/> מחבר...
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} className="ml-2"/> חבר ל-Google Calendar
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Label>סנכרון אוטומטי</Label>
                  <Switch 
                    checked={therapist.google_calendar_connected} 
                    onCheckedChange={handleToggleGoogleCalendar}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    if (confirm("האם אתה בטוח שברצונך לנתק את Google Calendar?")) {
                      handleToggleGoogleCalendar(false);
                    }
                  }}
                >
                  נתק חיבור
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon Integrations */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <LinkIcon className="text-purple-600" size={24}/>
              </div>
              <div>
                <CardTitle>אינטגרציות נוספות</CardTitle>
                <p className="text-sm text-gray-500">בקרוב...</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• WhatsApp Business - שליחת הודעות אוטומטיות</p>
              <p>• Zoom - שיחות וידאו אוטומטיות</p>
              <p>• Stripe - קבלת תשלומים אונליין</p>
              <p>• Mailchimp - ניוזלטר ודיוור</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}