import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Calendar, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TherapistReminders() {
  const [therapist, setTherapist] = useState(null);
  const [settings, setSettings] = useState({
    enabled: true,
    hours_before: 24,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) {
        setTherapist(therapists[0]);
        if (therapists[0].appointment_reminders) {
          setSettings({ ...settings, ...therapists[0].appointment_reminders });
        }
      }
    };
    init();
  }, []);

  const updateMutation = useMutation({
    mutationFn: () => base44.entities.Therapist.update(therapist.id, {
      appointment_reminders: settings
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist"] });
      alert("הגדרות התזכורות נשמרו בהצלחה!");
    },
  });

  if (!therapist) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">טוען...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell size={24} className="text-teal-600"/>
        ניהול תזכורות לתורים
      </h1>

      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600"/>
        <AlertDescription className="text-amber-800">
          <strong>שימו לב:</strong> תכונה זו דורשת הפעלת Backend Functions באפליקציה. 
          כרגע ההגדרות נשמרות אך התזכורות לא נשלחות אוטומטית. 
          לאחר הפעלת Backend Functions, התזכורות יישלחו באופן אוטומטי למטופלים.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enabled" className="text-lg font-semibold cursor-pointer">
                הפעל תזכורות אוטומטיות
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                שלח תזכורות למטופלים באופן אוטומטי לפני התור
              </p>
            </div>
            <Switch 
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(v) => setSettings({...settings, enabled: v})}
              className="data-[state=checked]:bg-teal-600"
            />
          </div>
        </div>

        {/* Timing Settings */}
        {settings.enabled && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-teal-600"/>
              זמן שליחת התזכורת
            </h3>
            <div className="space-y-2">
              <Label>כמה שעות לפני התור לשלוח תזכורת?</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.hours_before}
                  onChange={(e) => setSettings({...settings, hours_before: Number(e.target.value)})}
                  className="w-24"
                />
                <span className="text-gray-600">שעות</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                💡 מומלץ: 24 שעות (יום לפני) או 2-3 שעות לפני התור
              </p>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
              <p className="text-sm font-medium text-teal-900 mb-2">📱 תצוגה מקדימה של ההודעה:</p>
              <div className="bg-white p-3 rounded-lg text-sm text-gray-700">
                שלום [שם המטופל],<br/>
                זוהי תזכורת לתור שלך אצל {therapist.full_name}<br/>
                📅 תאריך: [תאריך התור]<br/>
                ⏰ שעה: [שעת התור]<br/>
                📍 מיקום: {therapist.address || therapist.city}<br/>
                <br/>
                נתראה בקרוב! 🌿
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
            size="lg"
          >
            <Save size={18}/>
            {updateMutation.isPending ? "שומר..." : "שמור הגדרות"}
          </Button>
        </div>
      </div>
    </div>
  );
}