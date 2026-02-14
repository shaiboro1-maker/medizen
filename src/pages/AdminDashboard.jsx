import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, DollarSign, ShoppingBag, Video, TrendingUp, Bell, Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function AdminDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

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

  const { data: exercises = [] } = useQuery({
    queryKey: ["pendingExercises"],
    queryFn: () => base44.entities.Exercise.filter({ is_approved: false }),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["pendingRecipes"],
    queryFn: () => base44.entities.Recipe.filter({ is_approved: false }),
  });

  const { data: userContent = [] } = useQuery({
    queryKey: ["pendingUserContent"],
    queryFn: () => base44.entities.UserContent.filter({ is_approved: false }),
  });

  const { data: bulletinPosts = [] } = useQuery({
    queryKey: ["pendingBulletin"],
    queryFn: () => base44.entities.BulletinPost.filter({ status: "pending" }),
  });

  const approvedTherapists = therapists.filter(t => t.status === "approved").length;
  const pendingTherapists = therapists.filter(t => t.status === "pending").length;
  const totalRevenue = appointments.filter(a => a.status !== "cancelled").reduce((s, a) => s + (a.price || 0), 0);
  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);

  const pendingApprovals = pendingTherapists + exercises.length + recipes.length + userContent.length + bulletinPosts.length;

  // Real-time subscription to new therapist registrations
  useEffect(() => {
    const unsubscribe = base44.entities.Therapist.subscribe((event) => {
      if (event.type === 'create' && event.data.status === 'pending') {
        setNotifications(prev => [{
          id: Date.now(),
          type: 'therapist',
          message: `מטפל חדש נרשם: ${event.data.full_name}`,
          timestamp: new Date(),
          data: event.data
        }, ...prev]);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-4 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      {/* Header with PWA Install and Notifications */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7C9885]">🎯 דשבורד מנהל</h1>
          <p className="text-[#A8947D]">ניהול מלא של המערכת</p>
        </div>
        <div className="flex gap-2">
          {deferredPrompt && (
            <Button onClick={handleInstallPWA} size="sm" className="bg-[#B8A393] hover:bg-[#C5B5A4]">
              <Download size={16} className="ml-2"/> התקן אפליקציה
            </Button>
          )}
          <div className="relative">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell size={16}/>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
            {showNotifications && notifications.length > 0 && (
              <div className="absolute left-0 top-12 w-80 bg-white rounded-xl shadow-lg border p-4 z-50">
                <h3 className="font-bold mb-3">התראות חדשות</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2 bg-yellow-50 rounded-lg text-sm">
                      <p className="font-medium">{n.message}</p>
                      <p className="text-xs text-gray-500">{n.timestamp.toLocaleTimeString('he-IL')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pendingApprovals > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={24}/>
            <div>
              <h3 className="font-bold text-amber-900">דורש אישור</h3>
              <p className="text-sm text-amber-700">{pendingApprovals} פריטים ממתינים לאישור שלך</p>
            </div>
          </div>
          <Link to={createPageUrl("AdminApprovals")}>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              עבור לאישורים
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          icon={<Users className="text-teal-600"/>} 
          label="מטפלים פעילים" 
          value={approvedTherapists} 
          bg="bg-teal-50"
        />
        <StatCard 
          icon={<Clock className="text-amber-600"/>} 
          label="ממתינים לאישור" 
          value={pendingTherapists} 
          bg="bg-amber-50"
          link="AdminApprovals"
        />
        <StatCard 
          icon={<Calendar className="text-blue-600"/>} 
          label="סה״כ תורים" 
          value={appointments.length} 
          bg="bg-blue-50"
        />
        <StatCard 
          icon={<DollarSign className="text-green-600"/>} 
          label="הכנסות תורים" 
          value={`₪${totalRevenue.toLocaleString()}`} 
          bg="bg-green-50"
        />
        <StatCard 
          icon={<ShoppingBag className="text-purple-600"/>} 
          label="מכירות חנות" 
          value={`₪${totalSales.toLocaleString()}`} 
          bg="bg-purple-50"
        />
        <StatCard 
          icon={<Video className="text-pink-600"/>} 
          label="וובינרים" 
          value={webinars.length} 
          bg="bg-pink-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <QuickActionCard
          title="ניהול מטפלים"
          description="אישור והשעיית מטפלים"
          link="AdminTherapists"
          icon={<Users size={20}/>}
          color="bg-teal-50 text-teal-600"
        />
        <QuickActionCard
          title="תכנים לאישור"
          description="תרגילים, מתכונים ותכנים"
          link="AdminApprovals"
          icon={<CheckCircle size={20}/>}
          color="bg-amber-50 text-amber-600"
          badge={exercises.length + recipes.length + userContent.length}
        />
        <QuickActionCard
          title="ניהול חנות"
          description="מוצרים והזמנות"
          link="AdminProducts"
          icon={<ShoppingBag size={20}/>}
          color="bg-purple-50 text-purple-600"
        />
        <QuickActionCard
          title="פופ-אפים והתראות"
          description="ניהול הודעות למשתמשים"
          link="AdminNotifications"
          icon={<Bell size={20}/>}
          color="bg-blue-50 text-blue-600"
        />
        <QuickActionCard
          title="CRM ולקוחות"
          description="ניהול קשרי לקוחות"
          link="AdminCRM"
          icon={<Users size={20}/>}
          color="bg-green-50 text-green-600"
        />
        <QuickActionCard
          title="סליקה וחשבוניות"
          description="ניהול תשלומים"
          link="AdminPayments"
          icon={<DollarSign size={20}/>}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Recent Appointments */}
      <h2 className="text-lg font-bold mb-4 text-[#7C9885]">תורים אחרונים</h2>
      <div className="bg-white rounded-2xl border border-[#E5DDD3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F1E8]">
              <tr>
                <th className="text-right p-3 font-medium text-[#7C9885]">לקוח</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">מטפל</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">שירות</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">תאריך</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 10).map(a => (
                <tr key={a.id} className="border-t border-[#E5DDD3]">
                  <td className="p-3">{a.client_name}</td>
                  <td className="p-3">{a.therapist_name}</td>
                  <td className="p-3">{a.service_name}</td>
                  <td className="p-3">{new Date(a.date).toLocaleDateString('he-IL')}</td>
                  <td className="p-3">
                    <Badge className={
                      a.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {a.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg, link }) {
  const content = (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );

  return link ? <Link to={createPageUrl(link)}>{content}</Link> : content;
}

function QuickActionCard({ title, description, link, icon, color, badge }) {
  return (
    <Link to={createPageUrl(link)}>
      <div className="bg-white rounded-xl border border-[#E5DDD3] p-4 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          {badge > 0 && (
            <Badge className="bg-red-500 text-white">{badge}</Badge>
          )}
        </div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}