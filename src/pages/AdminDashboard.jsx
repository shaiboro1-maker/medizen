import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, DollarSign, ShoppingBag, Video, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const { data: therapists = [] } = useQuery({
    queryKey: ["allTherapists"],
    queryFn: () => base44.entities.Therapist.list(),
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => base44.entities.Appointment.list("-date", 100),
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => base44.entities.Order.list("-created_date", 100),
  });
  const { data: webinars = [] } = useQuery({
    queryKey: ["allWebinars"],
    queryFn: () => base44.entities.Webinar.list(),
  });

  const approvedTherapists = therapists.filter(t => t.status === "approved").length;
  const pendingTherapists = therapists.filter(t => t.status === "pending").length;
  const totalRevenue = appointments.filter(a => a.status !== "cancelled").reduce((s, a) => s + (a.price || 0), 0);
  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-2">דשבורד מנהל</h1>
      <p className="text-gray-500 mb-8">סקירה כללית של המערכת</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Users className="text-teal-600"/>} label="מטפלים פעילים" value={approvedTherapists} bg="bg-teal-50"/>
        <StatCard icon={<Users className="text-amber-600"/>} label="ממתינים לאישור" value={pendingTherapists} bg="bg-amber-50"/>
        <StatCard icon={<Calendar className="text-blue-600"/>} label="סה״כ תורים" value={appointments.length} bg="bg-blue-50"/>
        <StatCard icon={<DollarSign className="text-green-600"/>} label="הכנסות תורים" value={`₪${totalRevenue}`} bg="bg-green-50"/>
        <StatCard icon={<ShoppingBag className="text-purple-600"/>} label="מכירות חנות" value={`₪${totalSales}`} bg="bg-purple-50"/>
        <StatCard icon={<Video className="text-pink-600"/>} label="וובינרים" value={webinars.length} bg="bg-pink-50"/>
      </div>

      <h2 className="text-lg font-bold mb-4">תורים אחרונים</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right p-3 font-medium text-gray-500">לקוח</th>
                <th className="text-right p-3 font-medium text-gray-500">מטפל</th>
                <th className="text-right p-3 font-medium text-gray-500">שירות</th>
                <th className="text-right p-3 font-medium text-gray-500">תאריך</th>
                <th className="text-right p-3 font-medium text-gray-500">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 10).map(a => (
                <tr key={a.id} className="border-t">
                  <td className="p-3">{a.client_name}</td>
                  <td className="p-3">{a.therapist_name}</td>
                  <td className="p-3">{a.service_name}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-gray-100">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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