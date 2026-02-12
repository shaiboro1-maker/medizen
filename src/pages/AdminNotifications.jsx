import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send } from "lucide-react";

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    type: "content",
    link_url: "",
    image_url: ""
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list()
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (notifData) => {
      const promises = users.map(user => 
        base44.entities.Notification.create({
          ...notifData,
          user_email: user.email
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      setNotification({
        title: "",
        message: "",
        type: "content",
        link_url: "",
        image_url: ""
      });
      queryClient.invalidateQueries(["notifications"]);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNotification({...notification, image_url: file_url});
    }
  };

  const handleSend = () => {
    if (notification.title && notification.message) {
      sendNotificationMutation.mutate(notification);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Bell size={32} className="text-teal-600"/>
          שליחת התראות
        </h1>
        <p className="text-gray-500">שלח התראות לכל המשתמשים באפליקציה</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>התראה חדשה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">סוג התראה</label>
            <Select value={notification.type} onValueChange={(v) => setNotification({...notification, type: v})}>
              <SelectTrigger>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webinar">וובינר</SelectItem>
                <SelectItem value="content">תוכן חדש</SelectItem>
                <SelectItem value="exercise">תרגילים</SelectItem>
                <SelectItem value="promotion">מבצע</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">כותרת</label>
            <Input
              value={notification.title}
              onChange={(e) => setNotification({...notification, title: e.target.value})}
              placeholder="כותרת ההתראה"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">הודעה</label>
            <Textarea
              value={notification.message}
              onChange={(e) => setNotification({...notification, message: e.target.value})}
              placeholder="תוכן ההודעה"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">קישור (אופציונלי)</label>
            <Input
              value={notification.link_url}
              onChange={(e) => setNotification({...notification, link_url: e.target.value})}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">תמונה (אופציונלי)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {notification.image_url && (
              <img src={notification.image_url} alt="Preview" className="w-full h-32 object-cover rounded mt-2"/>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>תצוגה מקדימה:</strong>
            </p>
            <div className="mt-2 bg-white rounded-lg p-3 shadow-sm">
              <p className="font-semibold">{notification.title || "כותרת ההתראה"}</p>
              <p className="text-sm text-gray-600 mt-1">{notification.message || "תוכן ההודעה"}</p>
            </div>
          </div>

          <Button
            onClick={handleSend}
            disabled={sendNotificationMutation.isPending || !notification.title || !notification.message}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            <Send size={18} className="ml-2"/>
            {sendNotificationMutation.isPending ? "שולח..." : `שלח ל-${users.length} משתמשים`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}