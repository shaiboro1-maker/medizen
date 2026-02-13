import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, Users, DollarSign, TrendingUp, Clock, MessageCircle, 
  FileText, ShoppingBag, Video, Sparkles, CreditCard, Target,
  Globe, Bell, TrendingDown, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  const todayAppointments = appointments.filter(a => a.date === moment().format("YYYY-MM-DD") && a.status !== "cancelled");
  const monthRevenue = appointments
    .filter(a => moment(a.date).isSame(moment(), "month") && a.status !== "cancelled")
    .reduce((sum, a) => sum + (a.price || 0), 0);
  const uniqueClients = [...new Set(appointments.map(a => a.client_email))].length;
  const pendingPayments = invoices.filter(i => i.status === "sent").reduce((sum, i) => sum + i.total, 0);

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
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">שלום, {therapist?.full_name || "..."}</h1>
          <p className="text-gray-500">הנה סיכום הפעילות שלך</p>
        </div>
        <Link to={createPageUrl("TherapistProfile")}>
          <Button variant="outline">ערוך פרופיל</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Calendar className="text-teal-600"/>} label="תורים היום" value={todayAppointments.length} bg="bg-teal-50"/>
        <StatCard icon={<DollarSign className="text-green-600"/>} label="הכנסות החודש" value={`₪${monthRevenue.toLocaleString()}`} bg="bg-green-50"/>
        <StatCard icon={<Users className="text-blue-600"/>} label="לקוחות CRM" value={crmContacts.length} bg="bg-blue-50"/>
        <StatCard icon={<TrendingDown className="text-amber-600"/>} label="ממתין לתשלום" value={`₪${pendingPayments.toLocaleString()}`} bg="bg-amber-50"/>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">פעולות מהירות</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.to} to={createPageUrl(action.to)}>
              <div className={`bg-white rounded-xl border hover:shadow-lg transition-all p-4 cursor-pointer relative`}>
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

      {/* AI & Automation */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">כלים חכמים</h2>
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

      {user && <Recommendations userType="therapist" userId={user.email}/>}

      <div className="my-6">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">💼 כרטיס ביקור דיגיטלי</h3>
              <p className="text-sm text-gray-600 mb-3">
                הורד את האפליקציה שלך ותקבל מיני-סייט מקצועי ישירות בטלפון
              </p>
              <ul className="text-xs text-gray-600 space-y-1 mb-4">
                <li>✓ ניהול תורים בקליק</li>
                <li>✓ צ'אט עם לקוחות</li>
                <li>✓ מיני-סייט מעוצב</li>
                <li>✓ סטטיסטיקות בזמן אמת</li>
              </ul>
            </div>
          </div>
          <AppDownload variant="compact"/>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">תורים היום</h2>
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