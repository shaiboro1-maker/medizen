import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Recommendations from "../components/Recommendations";
import AppDownload from "../components/AppDownload";
import moment from "moment";

export default function TherapistDashboard() {
  const [therapist, setTherapist] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const therapists = await base44.entities.Therapist.filter({ user_email: currentUser.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["therapistAppointments", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }, "-date"),
    enabled: !!therapist,
  });

  const todayAppointments = appointments.filter(a => a.date === moment().format("YYYY-MM-DD") && a.status !== "cancelled");
  const monthRevenue = appointments
    .filter(a => moment(a.date).isSame(moment(), "month") && a.status !== "cancelled")
    .reduce((sum, a) => sum + (a.price || 0), 0);
  const uniqueClients = [...new Set(appointments.map(a => a.client_email))].length;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-2">שלום, {therapist?.full_name || "..."}</h1>
      <p className="text-gray-500 mb-8">הנה סיכום הפעילות שלך</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Calendar className="text-teal-600"/>} label="תורים היום" value={todayAppointments.length} bg="bg-teal-50"/>
        <StatCard icon={<DollarSign className="text-green-600"/>} label="הכנסות החודש" value={`₪${monthRevenue}`} bg="bg-green-50"/>
        <StatCard icon={<Users className="text-blue-600"/>} label="לקוחות" value={uniqueClients} bg="bg-blue-50"/>
        <StatCard icon={<TrendingUp className="text-purple-600"/>} label="סה״כ תורים" value={appointments.filter(a => a.status !== "cancelled").length} bg="bg-purple-50"/>
      </div>

      {user && <Recommendations userType="therapist" userId={user.email}/>}

      <div className="my-6">
        <AppDownload variant="compact"/>
      </div>

      <h2 className="text-lg font-bold mb-4">תורים קרובים</h2>
      {todayAppointments.length === 0 ? (
        <p className="text-gray-400 bg-white rounded-2xl border p-8 text-center">אין תורים היום</p>
      ) : (
        <div className="space-y-3">
          {todayAppointments.map(apt => (
            <div key={apt.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{apt.client_name}</h3>
                <p className="text-sm text-gray-500">{apt.service_name}</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-teal-700">{apt.time}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {apt.duration_minutes} דקות</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );
}