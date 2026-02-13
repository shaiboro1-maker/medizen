import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, Users, MessageCircle, TrendingUp, 
  Settings, Globe, BookOpen, ShoppingBag, Video,
  BarChart3, Clock, DollarSign, Star, MessageSquare
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
    { icon: <MessageCircle size={24}/>, label: "צ'אט", to: "TherapistChat", color: "from-green-500 to-emerald-500" },
    { icon: <Globe size={24}/>, label: "מיני-סייט", to: "TherapistMiniSiteManager", color: "from-orange-500 to-red-500" },
  ];

  const features = [
    { icon: <DollarSign size={20}/>, label: "פיננסים", to: "TherapistFinance" },
    { icon: <MessageSquare size={20}/>, label: "בוט לידים", to: "TherapistLeadBot" },
    { icon: <ShoppingBag size={20}/>, label: "חנות", to: "TherapistProducts" },
    { icon: <Video size={20}/>, label: "קורסים", to: "TherapistCourses" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-emerald-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white px-4 pt-8 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden border-2 border-white/30">
              {therapist.profile_image ? (
                <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold">
                  {therapist.full_name?.[0]}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold">{therapist.full_name}</h1>
              <p className="text-teal-100 text-xs">{therapist.specializations?.[0]}</p>
            </div>
          </div>
          <Link to={createPageUrl("TherapistDashboard")} className="text-white">
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
                  <Badge className="bg-teal-600 text-xs">מאושר</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-bold mb-3 text-gray-800">פעולות מהירות</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <Link key={i} to={createPageUrl(action.to)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-gradient-to-br ${action.color} rounded-xl p-4 text-white shadow-md hover:shadow-lg transition-all`}
              >
                <div className="mb-2">{action.icon}</div>
                <p className="text-sm font-medium">{action.label}</p>
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

      {/* Mini-Site Preview */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100/50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-1">המיני-סייט שלך</h3>
              <p className="text-xs text-gray-600">כרטיס ביקור דיגיטלי</p>
            </div>
            <Globe size={20} className="text-teal-600"/>
          </div>
          <Link to={createPageUrl("TherapistMiniSiteManager")}>
            <button className="w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-700 transition-colors">
              נהל את המיני-סייט
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 px-2 z-50 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-14">
          <NavItem icon={<BarChart3 size={20}/>} label="דשבורד" to="TherapistDashboard"/>
          <NavItem icon={<Calendar size={20}/>} label="תורים" to="TherapistAppointments"/>
          <NavItem icon={<Users size={20}/>} label="לקוחות" to="TherapistClients"/>
          <NavItem icon={<Globe size={20}/>} label="סייט" to="TherapistMiniSiteManager"/>
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
    <Link to={createPageUrl(to)} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-teal-600 transition-colors py-1">
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </Link>
  );
}