import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TherapistClients() {
  const [therapist, setTherapist] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["therapistAllAppts", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }, "-date"),
    enabled: !!therapist,
  });

  const clients = useMemo(() => {
    const map = {};
    appointments.forEach(apt => {
      if (!map[apt.client_email]) {
        map[apt.client_email] = { email: apt.client_email, name: apt.client_name, appointments: 0, lastVisit: apt.date, totalSpent: 0 };
      }
      map[apt.client_email].appointments++;
      map[apt.client_email].totalSpent += apt.price || 0;
      if (apt.date > map[apt.client_email].lastVisit) map[apt.client_email].lastVisit = apt.date;
    });
    return Object.values(map).filter(c => !query || c.name?.includes(query) || c.email?.includes(query));
  }, [appointments, query]);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">הלקוחות שלי</h1>
      
      <div className="relative mb-6">
        <Search size={18} className="absolute right-3 top-3 text-gray-400"/>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חפש לקוח..." className="pr-10"/>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-400">אין לקוחות עדיין</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(c => (
            <div key={c.email} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                  {c.name?.[0] || "?"}
                </div>
                <div>
                  <h3 className="font-bold">{c.name || c.email}</h3>
                  <p className="text-sm text-gray-500">{c.email}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{c.appointments} ביקורים</p>
                <p className="text-xs text-gray-400">₪{c.totalSpent.toFixed(0)} סה"כ</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}