import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function TherapistIntegrations() {
  const [therapist, setTherapist] = useState(null);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  if (!therapist) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">טוען...</p>
      </div>
    );
  }

  const isGoogleCalendarConnected = therapist.google_calendar_connected || false;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">אינטגרציות</h1>

      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600"/>
        <AlertDescription className="text-amber-800">
          <strong>שימו לב:</strong> אינטגרציות דורשות הפעלת Backend Functions באפליקציה. 
          היכנסו להגדרות האפליקציה בדשבורד והפעילו Backend Functions כדי להשתמש באינטגרציות.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Google Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={24} className="text-blue-600"/>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Google Calendar</h3>
                <p className="text-sm text-gray-600 mb-3">
                  סנכרן תורים אוטומטית ליומן Google שלך. כל תור חדש יתווסף אוטומטית ליומן.
                </p>
                {isGoogleCalendarConnected ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    ✓ מחובר
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    לא מחובר
                  </Badge>
                )}
              </div>
            </div>
            <Button disabled className="bg-blue-600 hover:bg-blue-700">
              {isGoogleCalendarConnected ? "מחובר" : "חבר חשבון"}
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              💡 לאחר חיבור, תורים חדשים יופיעו אוטומטית ב-Google Calendar שלך עם כל הפרטים הרלוונטיים
            </p>
          </div>
        </div>

        {/* More integrations placeholder */}
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-3">אינטגרציות נוספות בקרוב</p>
          <p className="text-sm text-gray-400">
            אנחנו עובדים על הוספת אינטגרציות נוספות כמו Zoom, WhatsApp Business, ועוד
          </p>
        </div>
      </div>
    </div>
  );
}