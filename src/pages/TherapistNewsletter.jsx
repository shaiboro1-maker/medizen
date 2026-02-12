import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Eye, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

export default function TherapistNewsletter() {
  const [therapist, setTherapist] = useState(null);
  const [newsletter, setNewsletter] = useState({
    subject: "",
    content: "",
    recipients_filter: "all_clients",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: newsletters = [] } = useQuery({
    queryKey: ["newsletters", therapist?.id],
    queryFn: () => base44.entities.Newsletter.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["therapistAppointments", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const saveDraftMutation = useMutation({
    mutationFn: () => base44.entities.Newsletter.create({
      ...newsletter,
      therapist_id: therapist.id,
      status: "draft",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletters"] });
      alert("הניוזלטר נשמר כטיוטה");
    },
  });

  const uniqueClients = [...new Set(appointments.map(a => a.client_email))];
  const estimatedRecipients = newsletter.recipients_filter === "all_clients" ? uniqueClients.length : 0;

  if (!therapist) {
    return <div className="p-8 text-center"><p className="text-gray-500">טוען...</p></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Mail size={24} className="text-teal-600"/>
        שליחת ניוזלטר
      </h1>

      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600"/>
        <AlertDescription className="text-amber-800">
          <strong>שימו לב:</strong> שליחת ניוזלטר דורשת הפעלת Backend Functions. 
          כרגע ניתן לשמור טיוטות בלבד. לאחר הפעלת Backend Functions, הניוזלטר יישלח למטופלים.
        </AlertDescription>
      </Alert>

      {/* Create Newsletter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-bold mb-4">כתיבת ניוזלטר חדש</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>נושא</Label>
            <Input
              value={newsletter.subject}
              onChange={(e) => setNewsletter({ ...newsletter, subject: e.target.value })}
              placeholder="חדשות מרגשות מהקליניקה שלי"
            />
          </div>

          <div className="space-y-2">
            <Label>תוכן ההודעה</Label>
            <Textarea
              value={newsletter.content}
              onChange={(e) => setNewsletter({ ...newsletter, content: e.target.value })}
              placeholder="כתוב כאן את תוכן הניוזלטר..."
              className="h-64"
            />
          </div>

          <div className="space-y-2">
            <Label>שלח אל</Label>
            <Select
              value={newsletter.recipients_filter}
              onValueChange={(v) => setNewsletter({ ...newsletter, recipients_filter: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all_clients">כל המטופלים ({uniqueClients.length})</SelectItem>
                <SelectItem value="active_clients">מטופלים פעילים</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              הניוזלטר יישלח לכ-{estimatedRecipients} מטופלים
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => saveDraftMutation.mutate()}
              disabled={!newsletter.subject || !newsletter.content || saveDraftMutation.isPending}
              variant="outline"
            >
              <Eye size={16} className="ml-2"/> שמור כטיוטה
            </Button>
            <Button
              disabled
              className="bg-teal-600"
            >
              <Send size={16} className="ml-2"/> שלח עכשיו (דורש Backend Functions)
            </Button>
          </div>
        </div>
      </div>

      {/* Sent Newsletters */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg">היסטוריית ניוזלטרים ({newsletters.length})</h2>
        {newsletters.length === 0 ? (
          <p className="text-gray-400 text-center py-8">אין ניוזלטרים עדיין</p>
        ) : (
          <div className="space-y-3">
            {newsletters.map((nl) => (
              <div key={nl.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{nl.subject}</h3>
                      <Badge variant={nl.status === "sent" ? "default" : "outline"} className={nl.status === "sent" ? "bg-green-100 text-green-700" : ""}>
                        {nl.status === "sent" ? "נשלח" : "טיוטה"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{nl.content}</p>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>נמענים: {nl.sent_count || 0}</span>
                      {nl.sent_at && <span>נשלח ב: {moment(nl.sent_at).format("DD/MM/YYYY HH:mm")}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}