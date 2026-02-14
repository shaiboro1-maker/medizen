import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Calendar, BookOpen, Heart, User, Music as MusicIcon, ShoppingBag, Camera, ArrowRight } from "lucide-react";
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

  const toggleFavorite = async (item) => {
    if (!user) return;
    try {
      const favorites = await base44.entities.Favorite.filter({ user_email: user.email, item_id: item.id, item_type: item.type });
      if (favorites.length > 0) {
        await base44.entities.Favorite.delete(favorites[0].id);
        toast.success("הוסר מהמועדפים");
      } else {
        await base44.entities.Favorite.create({
          user_email: user.email,
          item_id: item.id,
          item_type: item.type,
          item_name: item.name
        });
        toast.success("נוסף למועדפים");
      }
    } catch (error) {
      toast.error("שגיאה בשמירת מועדף");
    }
  };

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
        <div className="flex items-center justify-end mb-4">
          <div className="relative ml-auto">
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
          <div className="flex items-center gap-3 mr-auto">
            <div className="text-right">
              <h1 className="text-xl font-bold">שלום{user ? `, ${user.full_name?.split(' ')[0]}` : ''}</h1>
              <p className="text-[#A8947D] text-base">איך אפשר לעזור לך היום?</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A8947D] to-[#B89968] flex items-center justify-center shadow-md">
              <span className="text-2xl">🧘‍♀️</span>
            </div>
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
          <Link to={createPageUrl("AIHealthAdvisor")}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-32 border-2 border-purple-300"
            >
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" 
                alt="יועץ AI"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/90 to-transparent flex flex-col items-end justify-end p-4">
                <p className="text-white text-lg font-bold text-right">יועץ AI בריאותי</p>
                <p className="text-white/70 text-[10px] text-right">* הייעוץ אינו תחליף לייעוץ רפואי</p>
              </div>
            </motion.div>
          </Link>

          <Link to={createPageUrl("TherapistSearch")}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-32"
            >
              <img 
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" 
                alt="מצא מטפל"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-end p-4">
                <p className="text-white text-lg font-bold text-right">מצא מטפל</p>
              </div>
            </motion.div>
          </Link>

          <Link to={createPageUrl("Music")}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-32"
            >
              <img 
                src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop" 
                alt="מוזיקה"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-end p-4">
                <p className="text-white text-lg font-bold text-right">מוזיקה</p>
              </div>
            </motion.div>
          </Link>

          <Link to={createPageUrl("Inspirations")}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-32"
            >
              <img 
                src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop" 
                alt="משפטי השראה"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-end p-4">
                <p className="text-white text-lg font-bold text-right">משפטי השראה</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 mt-6">
        <h2 className="text-xl font-bold mb-4 text-[#7C9885] text-right">תוכן לגוף ולנפש</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Exercises")}>
              <img 
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop" 
                alt="תרגילים"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">תרגילים</h3>
                  <p className="text-white/80 text-sm">מקצועיים</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "exercises", type: "category", name: "תרגילים" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Recipes")}>
              <img 
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" 
                alt="מתכונים"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">מתכונים</h3>
                  <p className="text-white/80 text-sm">בריאים</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "recipes", type: "category", name: "מתכונים" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Music?category=body_mind")}>
              <img 
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop" 
                alt="גוף ונפש"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">גוף ונפש</h3>
                  <p className="text-white/80 text-sm">ריפוי והרמוניה</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "body_mind", type: "music_category", name: "גוף ונפש" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Music?category=sleep")}>
              <img 
                src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop" 
                alt="שינה רגועה"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">שינה רגועה</h3>
                  <p className="text-white/80 text-sm">תדרי שינה</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "sleep", type: "music_category", name: "שינה רגועה" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Music?category=breathing")}>
              <img 
                src="https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=400&h=300&fit=crop" 
                alt="תרגילי נשימה"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">תרגילי נשימה</h3>
                  <p className="text-white/80 text-sm">טכניקות הרגעה</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "breathing", type: "music_category", name: "תרגילי נשימה" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Music?category=life_stories")}>
              <img 
                src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop" 
                alt="סיפורים לחיים"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">סיפורים לחיים</h3>
                  <p className="text-white/80 text-sm">השראה</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "life_stories", type: "music_category", name: "סיפורים לחיים" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Music?category=jokes")}>
              <img 
                src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop" 
                alt="בדיחות"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">בדיחות מצחיקות</h3>
                  <p className="text-white/80 text-sm">העלאת מורל</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "jokes", type: "music_category", name: "בדיחות מצחיקות" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>

          <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-40">
            <Link to={createPageUrl("Diary")}>
              <img 
                src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop" 
                alt="יומן אישי"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <div className="text-right">
                  <h3 className="text-white text-lg font-bold">יומן אישי</h3>
                  <p className="text-white/80 text-sm">מעקב יומי</p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => toggleFavorite({ id: "diary", type: "category", name: "יומן אישי" })}
              className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all"
            >
              <Heart size={16} className="text-red-500"/>
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-16"></div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#F5F1E8]/95 backdrop-blur-lg border-t border-[#A8947D]/20 px-2 z-50 shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-14">
          <NavItem icon={<Search size={20}/>} label="חיפוש" to="TherapistSearch" color="#F5F1E8"/>
          <NavItem icon={<Calendar size={20}/>} label="חדשות" to="HealthNews" color="#F5F1E8"/>
          <NavItem icon={<Heart size={20}/>} label="מועדפים" to="MyFavorites" color="#F5F1E8"/>
          <NavItem icon={<ShoppingBag size={20}/>} label="חנות" to="Shop" color="#F5F1E8"/>
          <NavItem icon={<User size={20}/>} label="אישי" to="MyAccount" color="#F5F1E8"/>
        </div>
      </nav>
    </div>
  );
}



function NavItem({ icon, label, to, color }) {
  return (
    <Link to={createPageUrl(to)} className="flex flex-col items-center gap-0.5 text-[#7C9885] hover:text-[#A8947D] transition-colors py-1">
      {icon}
      <span className="text-[9px] font-medium">{label}</span>
    </Link>
  );
}