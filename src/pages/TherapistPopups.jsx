import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Send, Eye, Edit, Trash, Calendar, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

export default function TherapistPopups() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    target_type: "all_clients",
    action_type: "general",
    action_link: "",
    scheduled_date: ""
  });

  const queryClient = useQueryClient();

  const { data: therapist } = useQuery({
    queryKey: ["current-therapist"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      return therapists[0];
    },
  });

  const { data: popups = [], isLoading } = useQuery({
    queryKey: ["popups", therapist?.id],
    queryFn: () => base44.entities.PopupNotification.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PopupNotification.create({
      ...data,
      therapist_id: therapist.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      setShowCreateDialog(false);
      setForm({
        title: "",
        message: "",
        target_type: "all_clients",
        action_type: "general",
        action_link: "",
        scheduled_date: ""
      });
      toast.success("הפופ-אפ נשמר בהצלחה!");
    },
  });

  const sendMutation = useMutation({
    mutationFn: (id) => base44.entities.PopupNotification.update(id, { status: "sent" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      toast.success("הפופ-אפ נשלח ללקוחות!");
    },
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    scheduled: "bg-blue-100 text-blue-800",
    sent: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">פופ-אפים והתראות</h1>
          <p className="text-gray-500">שלח הודעות ועדכונים למטופלים שלך</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="ml-2"/> פופ-אפ חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">סה"כ פופ-אפים</p>
          <p className="text-2xl font-bold">{popups.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">נשלחו</p>
          <p className="text-2xl font-bold text-green-600">{popups.filter(p => p.status === "sent").length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">מתוזמנים</p>
          <p className="text-2xl font-bold text-blue-600">{popups.filter(p => p.status === "scheduled").length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-sm text-gray-500 mb-1">סה"כ קליקים</p>
          <p className="text-2xl font-bold">{popups.reduce((sum, p) => sum + (p.clicked_count || 0), 0)}</p>
        </div>
      </div>

      {/* Popups List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">טוען...</div>
        ) : popups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Target size={48} className="mx-auto text-gray-300 mb-3"/>
            <p className="text-gray-500 mb-2">עדיין אין פופ-אפים</p>
            <Button onClick={() => setShowCreateDialog(true)} variant="outline">
              צור פופ-אפ ראשון
            </Button>
          </div>
        ) : (
          popups.map((popup) => (
            <div key={popup.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{popup.title}</h3>
                    <Badge className={statusColors[popup.status]}>
                      {popup.status === "draft" && "טיוטה"}
                      {popup.status === "scheduled" && "מתוזמן"}
                      {popup.status === "sent" && "נשלח"}
                      {popup.status === "cancelled" && "בוטל"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{popup.message}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users size={14}/>
                      <span>
                        {popup.target_type === "all_clients" && "כל הלקוחות"}
                        {popup.target_type === "active_clients" && "לקוחות פעילים"}
                        {popup.target_type === "new_clients" && "לקוחות חדשים"}
                        {popup.target_type === "specific_clients" && "לקוחות ספציפיים"}
                      </span>
                    </div>
                    {popup.sent_count > 0 && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Send size={14}/>
                        <span>נשלח ל-{popup.sent_count} לקוחות</span>
                      </div>
                    )}
                    {popup.clicked_count > 0 && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Eye size={14}/>
                        <span>{popup.clicked_count} קליקים</span>
                      </div>
                    )}
                    {popup.scheduled_date && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar size={14}/>
                        <span>{new Date(popup.scheduled_date).toLocaleString('he-IL')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {popup.status === "draft" && (
                    <Button size="sm" onClick={() => sendMutation.mutate(popup.id)} className="bg-green-600 hover:bg-green-700">
                      <Send size={14} className="ml-1"/> שלח
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Edit size={14}/>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash size={14}/>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>פופ-אפ חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>כותרת *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="כותרת הפופ-אפ"
              />
            </div>
            <div className="space-y-2">
              <Label>הודעה *</Label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({...form, message: e.target.value})}
                placeholder="תוכן ההודעה למטופלים"
                className="h-24"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>קהל יעד</Label>
                <Select value={form.target_type} onValueChange={(v) => setForm({...form, target_type: v})}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_clients">כל הלקוחות</SelectItem>
                    <SelectItem value="active_clients">לקוחות פעילים</SelectItem>
                    <SelectItem value="new_clients">לקוחות חדשים</SelectItem>
                    <SelectItem value="specific_clients">לקוחות ספציפיים</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>סוג פעולה</Label>
                <Select value={form.action_type} onValueChange={(v) => setForm({...form, action_type: v})}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">כללי</SelectItem>
                    <SelectItem value="book_appointment">קביעת תור</SelectItem>
                    <SelectItem value="view_service">צפייה בשירות</SelectItem>
                    <SelectItem value="special_offer">מבצע מיוחד</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>קישור לפעולה (אופציונלי)</Label>
              <Input
                value={form.action_link}
                onChange={(e) => setForm({...form, action_link: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createMutation.mutate({...form, status: "draft"})} disabled={!form.title || !form.message}>
                שמור כטיוטה
              </Button>
              <Button onClick={() => createMutation.mutate({...form, status: "sent"})} disabled={!form.title || !form.message} className="bg-green-600 hover:bg-green-700">
                <Send size={14} className="ml-1"/> שלח עכשיו
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}