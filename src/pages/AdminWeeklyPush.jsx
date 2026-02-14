import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Plus, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export default function AdminWeeklyPush() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", scheduled_date: "" });
  const queryClient = useQueryClient();

  const { data: pushes = [], isLoading } = useQuery({
    queryKey: ["weekly-pushes"],
    queryFn: () => base44.entities.WeeklyPushNotification.list("-scheduled_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WeeklyPushNotification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-pushes"] });
      setShowCreate(false);
      setForm({ title: "", message: "", scheduled_date: "" });
      toast.success("הפוש נוצר בהצלחה!");
    },
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    scheduled: "bg-blue-100 text-blue-800",
    sent: "bg-green-100 text-green-800"
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">פוש שבועי</h1>
          <p className="text-gray-500">שלח עדכונים שבועיים למשתמשים</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="ml-2"/> פוש חדש
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">סה"כ נשלחו</p>
          <p className="text-2xl font-bold">{pushes.filter(p => p.status === "sent").length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">מתוזמנים</p>
          <p className="text-2xl font-bold text-blue-600">{pushes.filter(p => p.status === "scheduled").length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">סה"כ קליקים</p>
          <p className="text-2xl font-bold">{pushes.reduce((sum, p) => sum + (p.click_count || 0), 0)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">טוען...</div>
        ) : pushes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-3"/>
            <p className="text-gray-500">עדיין אין פושים שבועיים</p>
          </div>
        ) : (
          pushes.map((push) => (
            <div key={push.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{push.title}</h3>
                    <Badge className={statusColors[push.status]}>
                      {push.status === "draft" && "טיוטה"}
                      {push.status === "scheduled" && "מתוזמן"}
                      {push.status === "sent" && "נשלח"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{push.message}</p>
                  {push.scheduled_date && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar size={14}/>
                      <span>{new Date(push.scheduled_date).toLocaleDateString('he-IL')}</span>
                    </div>
                  )}
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Send size={14} className="ml-1"/> שלח
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פוש שבועי חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>כותרת *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="כותרת הפוש"
              />
            </div>
            <div className="space-y-2">
              <Label>הודעה *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                placeholder="תוכן ההודעה..."
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>תאריך שליחה</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_date}
                onChange={(e) => setForm({...form, scheduled_date: e.target.value})}
              />
            </div>
            <Button 
              onClick={() => createMutation.mutate({...form, status: "scheduled"})}
              disabled={!form.title || !form.message || createMutation.isPending}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              צור פוש
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}