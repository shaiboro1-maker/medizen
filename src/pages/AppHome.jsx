import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Calendar, BookOpen, Heart, User, Music as MusicIcon, ShoppingBag, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function AppHome() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) {
        base44.auth.me().then(setUser);
      }
    });
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_image: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      toast.success("התמונה עודכנה בהצלחה!");
    } catch (error) {
      toast.error("שגיאה בהעלאת התמונה");
    }
    setUploadingAvatar(false);
  };

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
    { icon: <Search size={24}/>, label: "מצא מטפל", to: "TherapistSearch", color: "#B8A393" },
    { icon: <Calendar size={24}/>, label: "יומן תורים", to: "MyAppointments", color: "#C5B5A4" },
    { icon: <ShoppingBag size={24}/>, label: "חנות", to: "Shop", color: "#D4C2B0" },
    { icon: <MusicIcon size={24}/>, label: "מוזיקה", to: "Music", color: "#B89968" },
  ];

  return (
    <div className="min-h-screen pb-20" style={{backgroundColor: '#F5F1E8'}}>
      {/* Header */}
      <div className="text-[#7C9885] px-4 pt-8 pb-6" style={{backgroundColor: '#F5F1E8'}}>
        <div className="flex items-center justify-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A8947D] to-[#B89968] flex items-center justify-center shadow-md">
              <span className="text-2xl">🧘‍♀️</span>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold">שלום{user ? `, ${user.full_name?.split(' ')[0]}` : ''}</h1>
              <p className="text-[#A8947D] text-base">איך אפשר לעזור לך היום?</p>
            </div>
          </div>
          <div className="relative">
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 hover:border-white/50 transition-all"
              disabled={uploadingAvatar}
            >
              {user?.profile_image ? (
                <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover"/>
              ) : (
                <User size={20}/>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={16}/>
              </div>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A8947D]" size={20}/>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש מטפלים, שירותים..."
            className="w-full pr-12 py-4 text-base rounded-xl border-0 bg-white shadow-md text-right"
            style={{backgroundColor: '#FFFFFF'}}
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
        <div className="px-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-5 border-r-4 border-[#7C9885]"
          >
            <div className="flex items-start justify-between">
              <div className="text-right">
                <p className="text-sm text-[#A8947D] mb-1">התור הבא שלך</p>
                <h3 className="font-semibold text-lg mb-1">{nextAppointment.service_name}</h3>
                <p className="text-sm text-gray-600">{nextAppointment.therapist_name}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>📅 {new Date(nextAppointment.date).toLocaleDateString('he-IL')}</span>
                  <span>⏰ {nextAppointment.start_time}</span>
                </div>
              </div>
              <Badge className="bg-[#7C9885] text-sm">מאושר</Badge>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="text-xl font-bold mb-4 text-[#7C9885] text-right">פעולות מהירות</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, i) => (
            <Link key={i} to={createPageUrl(action.to)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl p-5 text-white shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center h-28"
                style={{backgroundColor: action.color}}
              >
                <div className="mb-2">{action.icon}</div>
                <p className="text-base font-medium">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 mt-6 space-y-3">
        <ContentCard
          icon="📚"
          title="תרגילים"
          subtitle="תרגילים מומלצים"
          to="Exercises"
        />
        <ContentCard
          icon="🥗"
          title="מתכונים"
          subtitle="מתכונים בריאים"
          to="Recipes"
        />
        <ContentCard
          icon="📔"
          title="יומן אישי"
          subtitle="עקוב אחר ההתקדמות"
          to="Diary"
        />
        <ContentCard
          icon="🎵"
          title="מוזיקה"
          subtitle="מוזיקה מרגיעה"
          to="Music"
        />
      </div>
      
      <div className="h-16"></div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F5F1E8]/95 backdrop-blur-lg border-t border-[#A8947D]/20 px-2 z-50 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-14">
          <NavItem icon={<Search size={20}/>} label="חיפוש" to="TherapistSearch"/>
          <NavItem icon={<Calendar size={20}/>} label="תורים" to="MyAppointments"/>
          <NavItem icon={<Heart size={20}/>} label="מועדפים" to="MyFavorites"/>
          <NavItem icon={<ShoppingBag size={20}/>} label="חנות" to="Shop"/>
          <NavItem icon={<User size={20}/>} label="אישי" to="MyAccount"/>
        </div>
      </nav>
    </div>
  );
}

function ContentCard({ icon, title, subtitle, to }) {
  return (
    <Link to={createPageUrl(to)}>
      <div className="bg-white rounded-xl p-5 border border-[#E5DDD3] hover:shadow-md transition-all">
        <div className="flex items-center gap-4 justify-start">
          <div className="text-3xl">{icon}</div>
          <div className="text-right">
            <h3 className="font-semibold text-base text-[#7C9885]">{title}</h3>
            <p className="text-sm text-[#A8947D]">{subtitle}</p>
          </div>
        </div>
      </div>
    </Link>
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