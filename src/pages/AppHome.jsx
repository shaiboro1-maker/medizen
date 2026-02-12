import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, BookOpen, Heart, User, Music as MusicIcon, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function AppHome() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) {
        base44.auth.me().then(setUser);
      }
    });
  }, []);

  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ["upcoming-appointments", user?.email],
    queryFn: () => base44.entities.Appointment.filter({
      client_email: user.email,
      status: "confirmed"
    }, "date"),
    enabled: !!user,
  });

  const nextAppointment = upcomingAppointments[0];

  const quickActions = [
    { icon: <Search size={28}/>, label: "מצא מטפל", to: "TherapistSearch", color: "from-teal-500 to-emerald-500" },
    { icon: <Calendar size={28}/>, label: "קבע תור", to: "TherapistSearch", color: "from-blue-500 to-cyan-500" },
    { icon: <BookOpen size={28}/>, label: "תרגילים", to: "Exercises", color: "from-purple-500 to-pink-500" },
    { icon: <MusicIcon size={28}/>, label: "מוזיקה", to: "Music", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">שלום{user ? `, ${user.full_name?.split(' ')[0]}` : ''} 👋</h1>
            <p className="text-teal-100 text-sm mt-1">איך אפשר לעזור לך היום?</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <User size={24}/>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש מטפלים, שירותים, תרגילים..."
            className="w-full pr-12 py-6 rounded-2xl border-0 bg-white shadow-lg"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery) {
                window.location.href = createPageUrl(`TherapistSearch?q=${searchQuery}`);
              }
            }}
          />
        </div>
      </div>

      {/* Next Appointment */}
      {nextAppointment && (
        <div className="px-6 -mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-5 border-r-4 border-teal-600"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">התור הבא שלך</p>
                <h3 className="font-bold text-lg mb-1">{nextAppointment.service_name}</h3>
                <p className="text-sm text-gray-600">{nextAppointment.therapist_name}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span>📅 {new Date(nextAppointment.date).toLocaleDateString('he-IL')}</span>
                  <span>⏰ {nextAppointment.start_time}</span>
                </div>
              </div>
              <Badge className="bg-teal-600">מאושר</Badge>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-bold mb-4">פעולות מהירות</h2>
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

      {/* Content Sections */}
      <div className="px-6 mt-8 space-y-4">
        <ContentCard
          icon="📚"
          title="תרגילים לכאבי גב"
          subtitle="10 תרגילים מומלצים"
          to="Exercises"
          gradient="from-blue-50 to-cyan-50"
        />
        <ContentCard
          icon="🥗"
          title="מתכונים בריאים"
          subtitle="מתכונים להורדת משקל"
          to="Recipes"
          gradient="from-green-50 to-emerald-50"
        />
        <ContentCard
          icon="📔"
          title="היומן שלי"
          subtitle="עקוב אחר ההתקדמות"
          to="Diary"
          gradient="from-purple-50 to-pink-50"
        />
        <ContentCard
          icon="🎵"
          title="מדיטציה ומוזיקה"
          subtitle="מוזיקה מרגיעה ומדיטציות"
          to="Music"
          gradient="from-orange-50 to-amber-50"
        />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-16">
          <NavItem icon={<Search size={22}/>} label="חיפוש" to="TherapistSearch"/>
          <NavItem icon={<Calendar size={22}/>} label="תורים" to="MyAppointments"/>
          <NavItem icon={<Heart size={22}/>} label="מועדפים" to="MyFavorites"/>
          <NavItem icon={<ShoppingBag size={22}/>} label="חנות" to="Shop"/>
          <NavItem icon={<User size={22}/>} label="אישי" to="MyAccount"/>
        </div>
      </nav>
    </div>
  );
}

function ContentCard({ icon, title, subtitle, to, gradient }) {
  return (
    <Link to={createPageUrl(to)}>
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow`}>
        <div className="flex items-center gap-4">
          <div className="text-3xl">{icon}</div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{subtitle}</p>
          </div>
        </div>
      </div>
    </Link>
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