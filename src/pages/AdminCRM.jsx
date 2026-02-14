import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Mail, Phone, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminCRM() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => base44.entities.Appointment.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => base44.entities.Order.list(),
  });

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserStats = (userEmail) => {
    const userAppointments = appointments.filter(a => a.client_email === userEmail);
    const userOrders = orders.filter(o => o.client_email === userEmail);
    const totalSpent = userAppointments.reduce((s, a) => s + (a.price || 0), 0) + 
                       userOrders.reduce((s, o) => s + (o.total || 0), 0);
    return {
      appointments: userAppointments.length,
      orders: userOrders.length,
      totalSpent
    };
  };

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#7C9885]">👥 CRM - ניהול לקוחות</h1>
        <p className="text-[#A8947D]">מעקב ותובנות על לקוחות</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-teal-600"/>
              <span className="text-sm text-gray-500">סה"כ לקוחות</span>
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-green-600"/>
              <span className="text-sm text-gray-500">לקוחות פעילים</span>
            </div>
            <p className="text-2xl font-bold">
              {users.filter(u => {
                const stats = getUserStats(u.email);
                return stats.appointments > 0 || stats.orders > 0;
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={20} className="text-blue-600"/>
              <span className="text-sm text-gray-500">תורים</span>
            </div>
            <p className="text-2xl font-bold">{appointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={20} className="text-purple-600"/>
              <span className="text-sm text-gray-500">הזמנות</span>
            </div>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-3 text-gray-400" size={20}/>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="חפש לקוח לפי שם או אימייל..."
          className="pr-10"
        />
      </div>

      {/* Clients List */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F1E8]">
            <tr>
              <th className="text-right p-3 font-medium text-[#7C9885]">לקוח</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">אימייל</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">תורים</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">הזמנות</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סה"כ הוצאה</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const stats = getUserStats(user.email);
              return (
                <tr key={user.id} className="border-t border-[#E5DDD3] hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.full_name}</td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3">
                    <Badge variant="outline">{stats.appointments}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{stats.orders}</Badge>
                  </td>
                  <td className="p-3 font-bold text-green-600">
                    ₪{stats.totalSpent.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}