import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";
import moment from "moment";

const STATUS_MAP = {
  pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "מאושר", color: "bg-green-100 text-green-800" },
  completed: { label: "הושלם", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "בוטל", color: "bg-red-100 text-red-800" },
};

export default function TherapistAppointments() {
  const [therapist, setTherapist] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["therapistAppts", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }, "-date"),
    enabled: !!therapist,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistAppts"] }),
  });

  const filtered = statusFilter === "all" ? appointments : appointments.filter(a => a.status === statusFilter);

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול תורים</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="pending">ממתין</SelectItem>
            <SelectItem value="confirmed">מאושר</SelectItem>
            <SelectItem value="completed">הושלם</SelectItem>
            <SelectItem value="cancelled">בוטל</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">אין תורים</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{apt.client_name || apt.client_email}</h3>
                  <p className="text-sm text-gray-500">{apt.service_name}</p>
                  <p className="text-sm text-gray-400 mt-1">{moment(apt.date).format("DD/MM/YYYY")} · {apt.time} · {apt.duration_minutes} דק'</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_MAP[apt.status]?.color}>{STATUS_MAP[apt.status]?.label}</Badge>
                  <span className="font-bold text-teal-700">₪{apt.price}</span>
                </div>
              </div>
              {apt.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" onClick={() => updateMutation.mutate({ id: apt.id, data: { status: "confirmed" } })} className="bg-green-600 hover:bg-green-700">
                    <Check size={14} className="ml-1"/> אשר
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: apt.id, data: { status: "cancelled" } })} className="text-red-600">
                    <X size={14} className="ml-1"/> בטל
                  </Button>
                </div>
              )}
              {apt.status === "confirmed" && (
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" onClick={() => updateMutation.mutate({ id: apt.id, data: { status: "completed" } })} className="bg-blue-600 hover:bg-blue-700">
                    <Check size={14} className="ml-1"/> סמן כהושלם
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}