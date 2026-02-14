import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, MessageSquare, Settings, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function TherapistNotifications() {
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [preferences, setPreferences] = useState({
    new_appointment_email: true,
    new_appointment_sms: false,
    cancelled_appointment_email: true,
    cancelled_appointment_sms: false,
    payment_received_email: true,
    payment_received_sms: false,
    new_review_email: true,
    new_review_sms: false,
  });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) {
        setTherapist(therapists[0]);
        // Load saved preferences
        const saved = localStorage.getItem(`notif_prefs_${therapists[0].id}`);
        if (saved) setPreferences(JSON.parse(saved));
      }
    };
    init();
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["therapistNotifications", therapist?.id],
    queryFn: () => base44.entities.Notification.filter({ 
      recipient_email: therapist.user_email 
    }, "-created_date", 50),
    enabled: !!therapist,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistNotifications"] }),
  });

  const savePreferences = () => {
    if (therapist) {
      localStorage.setItem(`notif_prefs_${therapist.id}`, JSON.stringify(preferences));
      alert("העדפות נשמרו בהצלחה!");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#7C9885] mb-2">התראות והעדפות</h1>
        <p className="text-[#A8947D]">נהל את ההתראות שלך</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={20}/> העדפות התראות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium">קבל התראות על:</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">תור חדש - מייל</p>
                  <p className="text-xs text-gray-500">התראה כשמטופל קובע תור</p>
                </div>
                <Switch
                  checked={preferences.new_appointment_email}
                  onCheckedChange={(v) => setPreferences({...preferences, new_appointment_email: v})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">תור חדש - SMS</p>
                  <p className="text-xs text-gray-500">הודעת טקסט לנייד</p>
                </div>
                <Switch
                  checked={preferences.new_appointment_sms}
                  onCheckedChange={(v) => setPreferences({...preferences, new_appointment_sms: v})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">ביטול תור - מייל</p>
                  <p className="text-xs text-gray-500">התראה על ביטול תור</p>
                </div>
                <Switch
                  checked={preferences.cancelled_appointment_email}
                  onCheckedChange={(v) => setPreferences({...preferences, cancelled_appointment_email: v})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">ביטול תור - SMS</p>
                  <p className="text-xs text-gray-500">הודעת טקסט על ביטול</p>
                </div>
                <Switch
                  checked={preferences.cancelled_appointment_sms}
                  onCheckedChange={(v) => setPreferences({...preferences, cancelled_appointment_sms: v})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">תשלום התקבל - מייל</p>
                  <p className="text-xs text-gray-500">אישור קבלת תשלום</p>
                </div>
                <Switch
                  checked={preferences.payment_received_email}
                  onCheckedChange={(v) => setPreferences({...preferences, payment_received_email: v})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">ביקורת חדשה - מייל</p>
                  <p className="text-xs text-gray-500">התראה על ביקורות</p>
                </div>
                <Switch
                  checked={preferences.new_review_email}
                  onCheckedChange={(v) => setPreferences({...preferences, new_review_email: v})}
                />
              </div>
            </div>

            <Button onClick={savePreferences} className="w-full bg-[#B8A393] hover:bg-[#C5B5A4]">
              <Save size={16} className="ml-2"/> שמור העדפות
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell size={20}/> התראות אחרונות
              </span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500">{unreadCount} חדשות</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-gray-400">אין התראות</p>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      notif.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                    }`}
                    onClick={() => markReadMutation.mutate(notif.id)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{notif.title}</h4>
                      {!notif.is_read && (
                        <Badge className="bg-blue-500 text-white text-xs">חדש</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(notif.created_date).toLocaleString('he-IL')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare size={20} className="text-amber-600"/>
            </div>
            <div>
              <h3 className="font-bold mb-1">שימו לב</h3>
              <p className="text-sm text-gray-600">
                התראות SMS דורשות אישור נוסף ויכולות לכלול עלות נוספת. 
                התראות במייל זמינות לכולם ללא עלות.
                התראות יישלחו אוטומטית בזמן אמת על כל אירוע רלוונטי.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}