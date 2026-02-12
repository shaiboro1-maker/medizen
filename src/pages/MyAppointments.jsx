import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PullToRefresh from "../components/PullToRefresh";
import moment from "moment";

const STATUS_MAP = {
  pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "מאושר", color: "bg-green-100 text-green-800" },
  completed: { label: "הושלם", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "בוטל", color: "bg-red-100 text-red-800" },
};

export default function MyAppointments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["myAppointments", user?.email],
    queryFn: () => base44.entities.Appointment.filter({ client_email: user.email }, "-date"),
    enabled: !!user,
  });

  const { data: therapists = [] } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => base44.entities.Therapist.list(),
    enabled: !!user,
  });

  const [showCancelDialog, setShowCancelDialog] = useState(null);

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.update(id, { status: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
      setShowCancelDialog(null);
      alert("התור בוטל בהצלחה");
    },
  });

  const canCancelAppointment = (apt) => {
    const therapist = therapists.find(t => t.id === apt.therapist_id);
    if (!therapist?.cancellation_policy?.allow_cancellation) return false;
    
    const hoursBeforeAllowed = therapist.cancellation_policy?.hours_before || 24;
    const appointmentTime = moment(`${apt.date} ${apt.time}`, "YYYY-MM-DD HH:mm");
    const hoursUntilAppointment = appointmentTime.diff(moment(), "hours");
    
    return hoursUntilAppointment >= hoursBeforeAllowed;
  };

  const upcoming = appointments.filter(a => ["pending", "confirmed"].includes(a.status) && moment(a.date).isSameOrAfter(moment(), "day"));
  const past = appointments.filter(a => a.status === "completed" || moment(a.date).isBefore(moment(), "day"));
  const cancelled = appointments.filter(a => a.status === "cancelled");

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["myAppointments"] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>
      <h1 className="text-3xl font-bold mb-8">התורים שלי</h1>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-gray-100 rounded-xl p-1 mb-6">
          <TabsTrigger value="upcoming">קרובים ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">עבר ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">בוטלו ({cancelled.length})</TabsTrigger>
        </TabsList>

        {["upcoming", "past", "cancelled"].map(tab => (
          <TabsContent key={tab} value={tab}>
            {(tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled).length === 0 ? (
              <div className="text-center py-12 text-gray-400">אין תורים</div>
            ) : (
              <div className="space-y-4">
                {(tab === "upcoming" ? upcoming : tab === "past" ? past : cancelled).map(apt => (
                  <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{apt.service_name}</h3>
                        <p className="text-sm text-gray-500">אצל {apt.therapist_name}</p>
                        <div className="flex gap-4 mt-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1"><Calendar size={14}/> {moment(apt.date).format("DD/MM/YYYY")}</span>
                          <span className="flex items-center gap-1"><Clock size={14}/> {apt.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={STATUS_MAP[apt.status]?.color}>{STATUS_MAP[apt.status]?.label}</Badge>
                        <span className="font-bold text-teal-700">₪{apt.price}</span>
                      </div>
                    </div>
                    {tab === "upcoming" && (
                      <div className="mt-4 pt-4 border-t">
                        {canCancelAppointment(apt) ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowCancelDialog(apt)} 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X size={14} className="ml-1"/> ביטול תור
                          </Button>
                        ) : (
                          <p className="text-xs text-gray-400">
                            לא ניתן לבטל תור זה עקב מדיניות הביטול של המטפל
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-lg mb-3">האם לבטל את התור?</h3>
            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">{showCancelDialog.service_name}</p>
              <p className="text-sm text-gray-600">אצל {showCancelDialog.therapist_name}</p>
              <p className="text-sm text-gray-600 mt-1">
                📅 {moment(showCancelDialog.date).format("DD/MM/YYYY")} • ⏰ {showCancelDialog.time}
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              תקבל אישור ביטול באימייל. המטפל יקבל הודעה על הביטול.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCancelDialog(null)}
                className="flex-1"
              >
                ביטול
              </Button>
              <Button 
                onClick={() => cancelMutation.mutate(showCancelDialog.id)}
                disabled={cancelMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {cancelMutation.isPending ? "מבטל..." : "אישור ביטול"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}