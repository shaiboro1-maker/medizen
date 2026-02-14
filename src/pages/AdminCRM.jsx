import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Mail, Phone, TrendingUp, Filter, Download, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminCRM() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterSegment, setFilterSegment] = useState("all");

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

  const { data: interactions = [] } = useQuery({
    queryKey: ["allInteractions"],
    queryFn: () => base44.entities.CustomerInteraction.list("-created_date", 500),
  });

  const { data: segments = [] } = useQuery({
    queryKey: ["customerSegments"],
    queryFn: () => base44.entities.CustomerSegment.list(),
  });

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserStats = (userEmail) => {
    const userAppointments = appointments.filter(a => a.client_email === userEmail);
    const userOrders = orders.filter(o => o.client_email === userEmail);
    const userInteractions = interactions.filter(i => i.customer_email === userEmail);
    const totalSpent = userAppointments.reduce((s, a) => s + (a.price || 0), 0) + 
                       userOrders.reduce((s, o) => s + (o.total || 0), 0);
    
    const lastActivity = userInteractions.length > 0 
      ? new Date(userInteractions[0].created_date)
      : null;
    
    const daysSinceActivity = lastActivity 
      ? Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      appointments: userAppointments.length,
      orders: userOrders.length,
      totalSpent,
      interactions: userInteractions,
      lastActivity,
      daysSinceActivity,
      segment: getCustomerSegment(userAppointments.length, userOrders.length, totalSpent, daysSinceActivity)
    };
  };

  const getCustomerSegment = (appointments, orders, spent, daysSinceActivity) => {
    if (spent > 5000 || appointments > 10) return "vip";
    if (daysSinceActivity > 90) return "inactive";
    if (appointments > 0 || orders > 0) return "active";
    return "new";
  };

  const segmentedUsers = filteredUsers.filter(u => {
    if (filterSegment === "all") return true;
    const stats = getUserStats(u.email);
    return stats.segment === filterSegment;
  });

  const exportToCSV = () => {
    const csvData = segmentedUsers.map(user => {
      const stats = getUserStats(user.email);
      return {
        name: user.full_name,
        email: user.email,
        appointments: stats.appointments,
        orders: stats.orders,
        totalSpent: stats.totalSpent,
        segment: stats.segment,
        lastActivity: stats.lastActivity?.toLocaleDateString('he-IL') || 'אין'
      };
    });
    
    const csv = [
      ['שם', 'אימייל', 'תורים', 'הזמנות', 'סה"כ הוצאה', 'פילוח', 'פעילות אחרונה'],
      ...csvData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'crm_export.csv';
    link.click();
  };

  const vipCount = users.filter(u => getUserStats(u.email).segment === "vip").length;
  const activeCount = users.filter(u => getUserStats(u.email).segment === "active").length;
  const inactiveCount = users.filter(u => getUserStats(u.email).segment === "inactive").length;

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#7C9885]">👥 CRM - ניהול לקוחות</h1>
          <p className="text-[#A8947D]">מעקב ותובנות על לקוחות</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download size={16} className="ml-2"/> ייצא לאקסל
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
              <span className="text-sm text-gray-500">פעילים</span>
            </div>
            <p className="text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus size={20} className="text-purple-600"/>
              <span className="text-sm text-gray-500">VIP</span>
            </div>
            <p className="text-2xl font-bold">{vipCount}</p>
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
              <Phone size={20} className="text-amber-600"/>
              <span className="text-sm text-gray-500">לא פעילים</span>
            </div>
            <p className="text-2xl font-bold">{inactiveCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 text-gray-400" size={20}/>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לקוח לפי שם או אימייל..."
            className="pr-10"
          />
        </div>
        <Button 
          variant={filterSegment === "all" ? "default" : "outline"} 
          onClick={() => setFilterSegment("all")}
          size="sm"
        >
          הכל
        </Button>
        <Button 
          variant={filterSegment === "vip" ? "default" : "outline"} 
          onClick={() => setFilterSegment("vip")}
          size="sm"
        >
          VIP
        </Button>
        <Button 
          variant={filterSegment === "active" ? "default" : "outline"} 
          onClick={() => setFilterSegment("active")}
          size="sm"
        >
          פעילים
        </Button>
        <Button 
          variant={filterSegment === "inactive" ? "default" : "outline"} 
          onClick={() => setFilterSegment("inactive")}
          size="sm"
        >
          לא פעילים
        </Button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F1E8]">
            <tr>
              <th className="text-right p-3 font-medium text-[#7C9885]">לקוח</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">אימייל</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">פילוח</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">תורים</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">הזמנות</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סה"כ הוצאה</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">פעילות אחרונה</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {segmentedUsers.map(user => {
              const stats = getUserStats(user.email);
              return (
                <tr key={user.id} className="border-t border-[#E5DDD3] hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.full_name}</td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3">
                    <Badge className={
                      stats.segment === 'vip' ? 'bg-purple-100 text-purple-800' :
                      stats.segment === 'active' ? 'bg-green-100 text-green-800' :
                      stats.segment === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {stats.segment === 'vip' ? 'VIP' : 
                       stats.segment === 'active' ? 'פעיל' :
                       stats.segment === 'inactive' ? 'לא פעיל' : 'חדש'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{stats.appointments}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{stats.orders}</Badge>
                  </td>
                  <td className="p-3 font-bold text-green-600">
                    ₪{stats.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-3 text-xs text-gray-500">
                    {stats.lastActivity ? stats.lastActivity.toLocaleDateString('he-IL') : 'אין'}
                  </td>
                  <td className="p-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedCustomer({ user, stats })}
                    >
                      צפה
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי לקוח - {selectedCustomer?.user.full_name}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.stats.appointments}</p>
                    <p className="text-xs text-gray-500">תורים</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.stats.orders}</p>
                    <p className="text-xs text-gray-500">הזמנות</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">₪{selectedCustomer.stats.totalSpent}</p>
                    <p className="text-xs text-gray-500">סה"כ</p>
                  </CardContent>
                </Card>
              </div>

              {/* Interactions History */}
              <div>
                <h3 className="font-bold text-[#7C9885] mb-3">היסטוריית אינטראקציות</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCustomer.stats.interactions.map((interaction, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{interaction.interaction_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(interaction.created_date).toLocaleString('he-IL')}
                        </p>
                      </div>
                      {interaction.value && (
                        <Badge>₪{interaction.value}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}