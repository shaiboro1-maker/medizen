import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, Users, DollarSign, TrendingUp, Clock, MessageCircle, 
  FileText, ShoppingBag, Video, Sparkles, CreditCard, Target,
  Globe, Bell, TrendingDown, ArrowRight, Settings, BarChart3, UserCheck, Eye, EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Recommendations from "../components/Recommendations";
import AppDownload from "../components/AppDownload";
import moment from "moment";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function TherapistDashboard() {
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [user, setUser] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [widgets, setWidgets] = useState({
    stats: true,
    charts: true,
    quickActions: true,
    aiTools: true,
    todayAppointments: true,
    retention: true
  });

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      const therapists = await base44.entities.Therapist.filter({ user_email: currentUser.email });
      if (therapists[0]) {
        setTherapist(therapists[0]);
        // Load saved preferences
        const saved = localStorage.getItem(`dashboard_${currentUser.email}`);
        if (saved) setWidgets(JSON.parse(saved));
      }
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["therapistAppointments", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }, "-date"),
    enabled: !!therapist,
  });

  const { data: crmContacts = [] } = useQuery({
    queryKey: ["crm-contacts", therapist?.id],
    queryFn: () => base44.entities.CRMContact.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices-stats", therapist?.id],
    queryFn: () => base44.entities.Invoice.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const savePreferences = (newWidgets) => {
    setWidgets(newWidgets);
    if (user) localStorage.setItem(`dashboard_${user.email}`, JSON.stringify(newWidgets));
  };

  // Statistics
  const todayAppointments = appointments.filter(a => a.date === moment().format("YYYY-MM-DD") && a.status !== "cancelled");
  const monthRevenue = appointments
    .filter(a => moment(a.date).isSame(moment(), "month") && a.status !== "cancelled")
    .reduce((sum, a) => sum + (a.price || 0), 0);
  const lastMonthRevenue = appointments
    .filter(a => moment(a.date).isSame(moment().subtract(1, 'month'), "month") && a.status !== "cancelled")
    .reduce((sum, a) => sum + (a.price || 0), 0);
  const revenueGrowth = lastMonthRevenue > 0 ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;
  
  const uniqueClients = [...new Set(appointments.map(a => a.client_email))].length;
  const newClientsThisMonth = [...new Set(
    appointments.filter(a => moment(a.date).isSame(moment(), "month")).map(a => a.client_email)
  )].filter(email => {
    const firstAppointment = appointments.filter(ap => ap.client_email === email).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    return moment(firstAppointment.date).isSame(moment(), "month");
  }).length;
  
  const pendingPayments = invoices.filter(i => i.status === "sent").reduce((sum, i) => sum + i.total, 0);

  // Retention Rate (clients with 2+ appointments)
  const clientsWithRepeat = [...new Set(appointments.map(a => a.client_email))].filter(email => 
    appointments.filter(a => a.client_email === email).length >= 2
  ).length;
  const retentionRate = uniqueClients > 0 ? ((clientsWithRepeat / uniqueClients) * 100).toFixed(1) : 0;

  // Chart Data - Revenue by month
  const last6Months = Array.from({length: 6}, (_, i) => moment().subtract(5 - i, 'months').format('YYYY-MM'));
  const revenueData = last6Months.map(month => ({
    month: moment(month).format('MMM'),
    revenue: appointments
      .filter(a => moment(a.date).format('YYYY-MM') === month && a.status !== "cancelled")
      .reduce((sum, a) => sum + (a.price || 0), 0)
  }));

  // Appointments by status
  const statusData = [
    { name: 'מאושר', value: appointments.filter(a => a.status === 'confirmed').length },
    { name: 'ממתין', value: appointments.filter(a => a.status === 'pending').length },
    { name: 'הושלם', value: appointments.filter(a => a.status === 'completed').length },
    { name: 'בוטל', value: appointments.filter(a => a.status === 'cancelled').length },
  ].filter(d => d.value > 0);

  // New clients trend
  const newClientsData = last6Months.map(month => {
    const monthClients = [...new Set(
      appointments.filter(a => moment(a.date).format('YYYY-MM') === month).map(a => a.client_email)
    )].filter(email => {
      const firstAppointment = appointments.filter(ap => ap.client_email === email).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      return moment(firstAppointment.date).format('YYYY-MM') === month;
    }).length;
    return {
      month: moment(month).format('MMM'),
      clients: monthClients
    };
  });

  const quickActions = [
    { icon: <Calendar size={20}/>, label: "תורים", to: "TherapistAppointments", color: "teal", count: todayAppointments.length },
    { icon: <Users size={20}/>, label: "CRM לקוחות", to: "TherapistCRM", color: "blue", count: crmContacts.length },
    { icon: <MessageCircle size={20}/>, label: "פופ-אפים", to: "TherapistPopups", color: "purple" },
    { icon: <Sparkles size={20}/>, label: "AI כתיבה", to: "TherapistAIWriter", color: "pink" },
    { icon: <CreditCard size={20}/>, label: "תשלומים", to: "TherapistPayments", color: "green" },
    { icon: <FileText size={20}/>, label: "חשבוניות", to: "TherapistInvoices", color: "amber", count: invoices.length },
    { icon: <ShoppingBag size={20}/>, label: "חנות", to: "TherapistProducts", color: "orange" },
    { icon: <Globe size={20}/>, label: "מיני-סייט", to: "TherapistMiniSite", color: "indigo" },
  ];

  return (
    <div className="p-4 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-[#7C9885]">שלום, {therapist?.full_name || "..."}</h1>
          <p className="text-[#A8947D]">הנה סיכום הפעילות שלך</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCustomize(true)}>
            <Settings size={16} className="ml-1"/> התאם
          </Button>
          <Link to={createPageUrl("TherapistMiniSiteSettings")}>
            <Button variant="outline">ערוך פרופיל</Button>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      {widgets.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={<Calendar className="text-teal-600"/>} 
            label="תורים היום" 
            value={todayAppointments.length} 
            bg="bg-teal-50"
          />
          <StatCard 
            icon={<DollarSign className="text-green-600"/>} 
            label="הכנסות החודש" 
            value={`₪${monthRevenue.toLocaleString()}`} 
            bg="bg-green-50"
            trend={revenueGrowth}
          />
          <StatCard 
            icon={<Users className="text-blue-600"/>} 
            label="לקוחות חדשים" 
            value={newClientsThisMonth} 
            bg="bg-blue-50"
          />
          <StatCard 
            icon={<UserCheck className="text-purple-600"/>} 
            label="שימור לקוחות" 
            value={`${retentionRate}%`} 
            bg="bg-purple-50"
          />
        </div>
      )}

      {/* Charts Section */}
      {widgets.charts && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 text-[#7C9885] flex items-center gap-2">
            <BarChart3 size={20}/> סטטיסטיקות מתקדמות
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">הכנסות ל-6 חודשים אחרונים</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="month"/>
                    <YAxis/>
                    <Tooltip formatter={(value) => `₪${value}`}/>
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2}/>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">התפלגות תורים לפי סטטוס</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* New Clients Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">לקוחות חדשים</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={newClientsData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="month"/>
                    <YAxis/>
                    <Tooltip/>
                    <Bar dataKey="clients" fill="#3b82f6"/>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Retention Stats */}
            {widgets.retention && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">שימור לקוחות</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">סה"כ לקוחות</span>
                    <Badge>{uniqueClients}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">לקוחות חוזרים</span>
                    <Badge className="bg-green-100 text-green-800">{clientsWithRepeat}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">אחוז שימור</span>
                    <Badge className="bg-purple-100 text-purple-800">{retentionRate}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: `${retentionRate}%`}}/>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {widgets.quickActions && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 text-[#7C9885]">פעולות מהירות</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.to} to={createPageUrl(action.to)}>
                <div className={`bg-white rounded-xl border border-[#E5DDD3] hover:shadow-lg transition-all p-4 cursor-pointer relative`}>
                  <div className={`w-10 h-10 bg-${action.color}-50 rounded-lg flex items-center justify-center mb-3`}>
                    <div className={`text-${action.color}-600`}>{action.icon}</div>
                  </div>
                  <p className="font-semibold text-sm">{action.label}</p>
                  {action.count !== undefined && (
                    <div className={`absolute top-3 left-3 w-6 h-6 bg-${action.color}-500 text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                      {action.count}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AI & Automation */}
      {widgets.aiTools && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 text-[#7C9885]">כלים חכמים</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to={createPageUrl("TherapistAIWriter")}>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Sparkles size={24} className="text-white"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI - כתיבת מאמרים</h3>
                    <p className="text-sm text-gray-600">צור תוכן מקצועי בקליק</p>
                  </div>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  התחל לכתוב <ArrowRight size={14} className="mr-2"/>
                </Button>
              </div>
            </Link>

            <Link to={createPageUrl("TherapistPopups")}>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Bell size={24} className="text-white"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">פופ-אפים ללקוחות</h3>
                    <p className="text-sm text-gray-600">שלח התראות והודעות</p>
                  </div>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  נהל פופ-אפים <ArrowRight size={14} className="mr-2"/>
                </Button>
              </div>
            </Link>
          </div>
        </div>
      )}

      {user && <Recommendations userType="therapist" userId={user.email}/>}

      {/* Business Card Section */}
      <div className="my-6">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 mb-2">💼 כרטיס ביקור דיגיטלי</h3>
              <p className="text-sm text-gray-600 mb-3">
                שלח ללקוחות קישור או QR code למיני-סייט שלך
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  onClick={() => {
                    if (therapist?.unique_slug) {
                      const url = `${window.location.origin}${createPageUrl(`MiniSite?slug=${therapist.unique_slug}`)}`;
                      navigator.clipboard.writeText(url);
                      alert("הקישור הועתק ללוח! 📋");
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  📋 העתק קישור
                </Button>
                <Button
                  onClick={() => {
                    if (therapist?.unique_slug) {
                      const url = `${window.location.origin}${createPageUrl(`MiniSite?slug=${therapist.unique_slug}`)}`;
                      const whatsappText = encodeURIComponent(`היי! 👋\n\nהנה כרטיס הביקור הדיגיטלי שלי:\n${url}`);
                      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  📱 שתף בווטסאפ
                </Button>
                <Button
                  onClick={() => {
                    if (therapist?.unique_slug) {
                      const url = `${window.location.origin}${createPageUrl(`MiniSite?slug=${therapist.unique_slug}`)}`;
                      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`, '_blank');
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  🔲 הורד QR Code
                </Button>
              </div>
            </div>
          </div>
          <AppDownload variant="compact"/>
        </div>
      </div>

      {widgets.todayAppointments && (
        <>
          <h2 className="text-lg font-bold mb-4 text-[#7C9885]">תורים היום</h2>
          {todayAppointments.length === 0 ? (
            <p className="text-[#A8947D] bg-white rounded-2xl border border-[#E5DDD3] p-8 text-center">אין תורים היום</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map(apt => (
                <div key={apt.id} className="bg-white rounded-2xl border border-[#E5DDD3] p-5 flex justify-between items-center hover:shadow-md transition-all">
                  <div>
                    <h3 className="font-bold">{apt.client_name}</h3>
                    <p className="text-sm text-[#A8947D]">{apt.service_name}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-teal-700">{apt.time}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {apt.duration_minutes} דקות</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Customize Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>התאם את הדשבורד</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {Object.keys(widgets).map(key => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">
                  {key === 'stats' && 'סטטיסטיקות ראשיות'}
                  {key === 'charts' && 'גרפים מתקדמים'}
                  {key === 'quickActions' && 'פעולות מהירות'}
                  {key === 'aiTools' && 'כלים חכמים'}
                  {key === 'todayAppointments' && 'תורים היום'}
                  {key === 'retention' && 'שימור לקוחות'}
                </span>
                <Button
                  size="sm"
                  variant={widgets[key] ? "default" : "outline"}
                  onClick={() => savePreferences({...widgets, [key]: !widgets[key]})}
                >
                  {widgets[key] ? <Eye size={14}/> : <EyeOff size={14}/>}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, bg, trend }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{label}</p>
          {trend && (
            <Badge className={parseFloat(trend) >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}