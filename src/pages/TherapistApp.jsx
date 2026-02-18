import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, Users, MessageCircle, TrendingUp, 
  Settings, Globe, BookOpen, ShoppingBag, Video,
  BarChart3, Clock, DollarSign, Star, MessageSquare,
  FileText, CreditCard, UserPlus, Download, ArrowRight
} from "lucide-react";
import AppDownload from "../components/AppDownload";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function TherapistApp() {
  const [user, setUser] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await base44.auth.isAuthenticated();
        if (!auth) {
          navigate(createPageUrl("Landing"));
          return;
        }
        const me = await base44.auth.me();
        setUser(me);
        
        const therapists = await base44.entities.Therapist.filter({ user_email: me.email });
        if (therapists.length === 0) {
          navigate(createPageUrl("TherapistRegister"));
          return;
        }
        setTherapist(therapists[0]);
      } catch (error) {
        console.error(error);
        navigate(createPageUrl("Landing"));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const { data: todayAppointments = [] } = useQuery({
    queryKey: ["today-appointments", therapist?.id],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return await base44.entities.Appointment.filter({
        therapist_id: therapist.id,
        date: today,
        status: "confirmed"
      }, "start_time");
    },
    enabled: !!therapist,
  });

  const { data: stats } = useQuery({
    queryKey: ["therapist-stats", therapist?.id],
    queryFn: async () => {
      const [appointments, clients, revenue] = await Promise.all([
        base44.entities.Appointment.filter({ therapist_id: therapist.id }),
        base44.entities.Appointment.filter({ therapist_id: therapist.id }),
        base44.entities.Appointment.filter({ therapist_id: therapist.id, status: "completed" })
      ]);
      
      const uniqueClients = new Set(appointments.map(a => a.client_email)).size;
      const totalRevenue = revenue.reduce((sum, a) => sum + (a.price || 0), 0);
      
      return {
        todayAppointments: todayAppointments.length,
        totalClients: uniqueClients,
        monthlyRevenue: totalRevenue,
        rating: therapist.rating || 0
      };
    },
    enabled: !!therapist,
  });

  if (loading || !therapist) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">טוען...</p>
      </div>
    </div>;
  }

  const quickActions = [
    { icon: <Users size={24}/>, label: "לקוחות", to: "TherapistClients", color: "from-[#7C9885] to-[#9CB4A4]" },
    { icon: <Calendar size={24}/>, label: "קביעת תורים", to: "TherapistCalendar", color: "from-[#A8947D] to-[#B89968]" },
    { icon: <Globe size={24}/>, label: "מיני-סייט", to: "TherapistMiniSiteSettings", color: "from-[#9CB4A4] to-[#A8947D]" },
    { icon: <FileText size={24}/>, label: "חשבוניות", to: "TherapistInvoices", color: "from-[#B89968] to-[#C9A876]" },
    { icon: <CreditCard size={24}/>, label: "סליקה", to: "TherapistPayments", color: "from-[#9CB4A4] to-[#A8947D]" },
    { icon: <BarChart3 size={24}/>, label: "דשבורד", to: "TherapistDashboard", color: "from-[#7C9885] to-[#9CB4A4]" },
  ];

  const features = [
    { icon: <Calendar size={20}/>, label: "יומן תורים", to: "TherapistAppointments" },
    { icon: <MessageCircle size={20}/>, label: "צ'אט", to: "TherapistChat" },
    { icon: <CreditCard size={20}/>, label: "תשלומים", to: "TherapistPayments" },
    { icon: <ShoppingBag size={20}/>, label: "החנות שלי", to: "TherapistProducts" },
    { icon: <Video size={20}/>, label: "קורסים", to: "TherapistCourses" },
    { icon: <BookOpen size={20}/>, label: "תוכן", to: "TherapistContent" },
  ];

  return (
    <div className="min-h-screen pb-20" style={{backgroundColor: '#F5F1E8'}}>
      {/* Header */}
      <div 
        className="text-white px-4 pt-8 pb-6 rounded-b-3xl shadow-lg"
        style={{
          backgroundColor: therapist.card_background_style ? undefined : '#7C9885',
          backgroundImage: therapist.card_background_style?.includes('gradient') ? therapist.card_background_style.replace('bg-', 'linear-') : undefined
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {therapist.logo_url ? (
              <img src={therapist.logo_url} alt="Logo" className="h-12 w-auto"/>
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
                {therapist.profile_image ? (
                  <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                    {therapist.full_name?.[0]}
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{therapist.full_name}</h1>
              <p className="text-white/80 text-xs truncate">{therapist.specializations?.[0] || "מטפל מקצועי"}</p>
            </div>
          </div>
          <Link to={createPageUrl("TherapistMiniSiteSettings")} className="text-white">
            <Settings size={20}/>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <StatCard icon={<Calendar size={16}/>} value={stats?.todayAppointments || 0} label="היום"/>
          <StatCard icon={<Users size={16}/>} value={stats?.totalClients || 0} label="לקוחות"/>
          <StatCard icon={<DollarSign size={16}/>} value={`₪${stats?.monthlyRevenue || 0}`} label="הכנסות"/>
          <StatCard icon={<Star size={16}/>} value={stats?.rating?.toFixed(1) || "0.0"} label="דירוג"/>
        </div>
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-base font-bold mb-3 text-gray-800">תורים להיום</h2>
          <div className="space-y-2">
            {todayAppointments.slice(0, 3).map((apt) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-200/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-900">{apt.service_name}</h3>
                    <p className="text-xs text-gray-600">{apt.client_name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} className="text-gray-400"/>
                      <span className="text-xs text-gray-500">{apt.start_time}</span>
                    </div>
                  </div>
                  <Badge className="bg-[#7C9885] text-xs">מאושר</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold mb-3 text-gray-800 text-right">פעולות מהירות</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={createPageUrl(action.to)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br ${action.color} rounded-2xl p-3 text-white shadow-md hover:shadow-lg transition-all text-right`}
              >
                <div className="mb-2 flex justify-end">{action.icon}</div>
                <p className="text-xs font-medium text-right">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold mb-3 text-gray-800">כלים נוספים</h2>
        <div className="grid grid-cols-2 gap-2">
          {features.map((feature, i) => (
            <Link key={i} to={createPageUrl(feature.to)}>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-200/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    {feature.icon}
                  </div>
                  <span className="font-medium text-gray-900 text-xs">{feature.label}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Download App Card */}
      <div className="px-4 mt-6">
        <AppDownload variant="compact"/>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 z-50 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-14">
          <NavItem icon={<BarChart3 size={20}/>} label="דשבורד" to="TherapistApp" active/>
          <NavItem icon={<Calendar size={20}/>} label="תורים" to="TherapistAppointments"/>
          <NavItem icon={<Users size={20}/>} label="לקוחות" to="TherapistClients"/>
          <NavItem icon={<Globe size={20}/>} label="סייט" to="TherapistMiniSiteSettings"/>
          <NavItem icon={<Settings size={20}/>} label="הגדרות" to="TherapistDashboard"/>
        </div>
      </nav>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="font-bold text-base">{value}</div>
      <div className="text-[9px] text-teal-100">{label}</div>
    </div>
  );
}

function NavItem({ icon, label, to }) {
  return (
    <Link to={createPageUrl(to)} className="flex flex-col items-center gap-0.5 text-[#7C9885] hover:text-[#A8947D] transition-colors py-1">
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </Link>
  );
}