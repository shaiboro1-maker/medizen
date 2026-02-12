import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, Users, MessageCircle, TrendingUp, 
  Settings, Globe, BookOpen, ShoppingBag, Video,
  BarChart3, Clock, DollarSign, Star
} from "lucide-react";
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
    { icon: <Calendar size={24}/>, label: "תורים", to: "TherapistAppointments", color: "from-blue-500 to-cyan-500" },
    { icon: <Users size={24}/>, label: "לקוחות", to: "TherapistClients", color: "from-purple-500 to-pink-500" },
    { icon: <MessageCircle size={24}/>, label: "הודעות", to: "TherapistChat", color: "from-green-500 to-emerald-500" },
    { icon: <Globe size={24}/>, label: "מיני-סייט", to: "TherapistMiniSite", color: "from-orange-500 to-red-500" },
  ];

  const features = [
    { icon: <BookOpen size={20}/>, label: "תוכן", to: "TherapistContent" },
    { icon: <ShoppingBag size={20}/>, label: "חנות", to: "TherapistProducts" },
    { icon: <Video size={20}/>, label: "קורסים", to: "TherapistCourses" },
    { icon: <TrendingUp size={20}/>, label: "קמפיינים", to: "TherapistCampaigns" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
              {therapist.profile_image ? (
                <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                  {therapist.full_name?.[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">{therapist.full_name}</h1>
              <p className="text-teal-100 text-sm">{therapist.specializations?.[0]}</p>
            </div>
          </div>
          <Link to={createPageUrl("TherapistDashboard")} className="text-white">
            <Settings size={24}/>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <StatCard icon={<Calendar size={18}/>} value={stats?.todayAppointments || 0} label="היום"/>
          <StatCard icon={<Users size={18}/>} value={stats?.totalClients || 0} label="לקוחות"/>
          <StatCard icon={<DollarSign size={18}/>} value={`₪${stats?.monthlyRevenue || 0}`} label="הכנסות"/>
          <StatCard icon={<Star size={18}/>} value={stats?.rating?.toFixed(1) || "0.0"} label="דירוג"/>
        </div>
      </div>

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <div className="px-6 mt-6">
          <h2 className="text-lg font-bold mb-3 text-gray-900">תורים להיום</h2>
          <div className="space-y-3">
            {todayAppointments.slice(0, 3).map((apt) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{apt.service_name}</h3>
                    <p className="text-sm text-gray-600">{apt.client_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={14} className="text-gray-400"/>
                      <span className="text-xs text-gray-500">{apt.start_time}</span>
                    </div>
                  </div>
                  <Badge className="bg-teal-600">מאושר</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold mb-4 text-gray-900">פעולות מהירות</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} to={createPageUrl(action.to)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform`}
              >
                <div className="mb-3">{action.icon}</div>
                <p className="font-semibold">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold mb-4 text-gray-900">כלים נוספים</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <Link key={i} to={createPageUrl(feature.to)}>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    {feature.icon}
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{feature.label}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mini-Site Preview */}
      <div className="px-6 mt-8">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">המיני-סייט שלך</h3>
              <p className="text-sm text-gray-600">כרטיס ביקור דיגיטלי מקצועי</p>
            </div>
            <Globe size={24} className="text-teal-600"/>
          </div>
          <Link to={createPageUrl("TherapistMiniSite")}>
            <button className="w-full bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 transition-colors">
              צפה במיני-סייט
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-16">
          <NavItem icon={<BarChart3 size={22}/>} label="סטטיסטיקות" to="TherapistDashboard"/>
          <NavItem icon={<Calendar size={22}/>} label="תורים" to="TherapistAppointments"/>
          <NavItem icon={<Users size={22}/>} label="לקוחות" to="TherapistClients"/>
          <NavItem icon={<Globe size={22}/>} label="סייט" to="TherapistMiniSite"/>
          <NavItem icon={<Settings size={22}/>} label="הגדרות" to="TherapistDashboard"/>
        </div>
      </nav>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="font-bold text-lg">{value}</div>
      <div className="text-xs text-teal-100">{label}</div>
    </div>
  );
}

function NavItem({ icon, label, to }) {
  return (
    <Link to={createPageUrl(to)} className="flex flex-col items-center gap-1 text-gray-600 hover:text-teal-600 transition-colors">
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}