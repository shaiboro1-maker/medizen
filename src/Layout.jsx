import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  Home, Search, Calendar, BookOpen, User, Menu, X, 
  LogOut, Shield, Heart, ShoppingBag, Mic, Video,
  ClipboardList, ChevronDown, TrendingUp, Globe, MessageCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        const me = await base44.auth.me();
        setUser(me);
        if (me.role === "admin" || me.role === "user") {
          const therapists = await base44.entities.Therapist.filter({ user_email: me.email });
          if (therapists.length > 0) setTherapist(therapists[0]);
        }
      }
    };
    init();
  }, []);

  const isAdmin = user?.role === "admin";
  const isTherapist = !!therapist && therapist.status === "approved";
  
  const publicPages = ["Landing", "TherapistSearch", "TherapistProfile", "BookAppointment", "Exercises", "Recipes", "Shop", "Webinars", "Podcasts"];
  const isPublicPage = publicPages.includes(currentPageName);
  
  const rootPages = ["Landing", "TherapistSearch", "MyAccount", "AdminDashboard", "TherapistDashboard"];
  const isRootPage = rootPages.includes(currentPageName);

  const adminPages = [
    "AdminDashboard", "AdminTherapists", "AdminContent", 
    "AdminProducts", "AdminOrders", "AdminBulletin", "AdminWebinars"
  ];
  const isAdminPage = adminPages.includes(currentPageName);

  const therapistPages = [
    "TherapistDashboard", "TherapistAppointments", "TherapistServices",
    "TherapistAvailability", "TherapistClients", "TherapistContent", 
    "TherapistProducts", "TherapistCourses", "TherapistBulletin", "TherapistWebinars",
    "TherapistPodcasts", "TherapistProfile", "TherapistChat", "TherapistCampaigns", "TherapistMiniSite"
  ];
  const isTherapistPage = therapistPages.includes(currentPageName);

  if (isAdminPage) {
    return (
      <div dir="rtl" className="min-h-screen font-sans" style={{ backgroundColor: 'var(--app-background)' }}>
        <div className="flex">
          <aside className="hidden lg:flex flex-col w-64 bg-white border-l shadow-sm min-h-screen fixed right-0 top-0 z-40">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold text-teal-700">🌿 ניהול מערכת</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <AdminNavLink to="AdminDashboard" icon={<Home size={18}/>} label="דשבורד" current={currentPageName}/>
              <AdminNavLink to="AdminTherapists" icon={<User size={18}/>} label="מטפלים" current={currentPageName}/>
              <AdminNavLink to="AdminContent" icon={<BookOpen size={18}/>} label="תוכן" current={currentPageName}/>
              <AdminNavLink to="AdminProducts" icon={<ShoppingBag size={18}/>} label="מוצרים" current={currentPageName}/>
              <AdminNavLink to="AdminOrders" icon={<ClipboardList size={18}/>} label="הזמנות" current={currentPageName}/>
              <AdminNavLink to="AdminBulletin" icon={<ClipboardList size={18}/>} label="לוח מודעות" current={currentPageName}/>
              <AdminNavLink to="AdminWebinars" icon={<Video size={18}/>} label="וובינרים" current={currentPageName}/>
            </nav>
            <div className="p-4 border-t">
              <Link to={createPageUrl("Landing")} className="text-sm text-gray-500 hover:text-teal-600">
                ← חזרה לאתר
              </Link>
            </div>
          </aside>
          <main className="flex-1 lg:mr-64 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (isTherapistPage) {
    return (
      <div dir="rtl" className="min-h-screen font-sans" style={{ backgroundColor: 'var(--app-background)' }}>
        <div className="flex">
          <aside className="hidden lg:flex flex-col w-64 bg-white border-l shadow-sm min-h-screen fixed right-0 top-0 z-40">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold text-teal-700">🌿 פאנל מטפל</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              <AdminNavLink to="TherapistDashboard" icon={<Home size={18}/>} label="דשבורד" current={currentPageName}/>
              <AdminNavLink to="TherapistAppointments" icon={<Calendar size={18}/>} label="תורים" current={currentPageName}/>
              <AdminNavLink to="TherapistServices" icon={<ClipboardList size={18}/>} label="שירותים" current={currentPageName}/>
              <AdminNavLink to="TherapistAvailability" icon={<Calendar size={18}/>} label="זמינות" current={currentPageName}/>
              <AdminNavLink to="TherapistClients" icon={<User size={18}/>} label="לקוחות" current={currentPageName}/>
              <AdminNavLink to="TherapistContent" icon={<BookOpen size={18}/>} label="תוכן" current={currentPageName}/>
              <AdminNavLink to="TherapistProducts" icon={<ShoppingBag size={18}/>} label="חנות" current={currentPageName}/>
              <AdminNavLink to="TherapistCourses" icon={<Video size={18}/>} label="קורסים" current={currentPageName}/>
              <AdminNavLink to="TherapistBulletin" icon={<ClipboardList size={18}/>} label="לוח מודעות" current={currentPageName}/>
              <AdminNavLink to="TherapistWebinars" icon={<Video size={18}/>} label="וובינרים" current={currentPageName}/>
              <AdminNavLink to="TherapistPodcasts" icon={<Mic size={18}/>} label="פודקאסט" current={currentPageName}/>
              <AdminNavLink to="TherapistChat" icon={<Mic size={18}/>} label="צ'אט" current={currentPageName}/>
              <AdminNavLink to="TherapistCampaigns" icon={<TrendingUp size={18}/>} label="קמפיינים" current={currentPageName}/>
              <AdminNavLink to="TherapistCoupons" icon={<TrendingUp size={18}/>} label="קופונים" current={currentPageName}/>
              <AdminNavLink to="TherapistNewsletter" icon={<TrendingUp size={18}/>} label="ניוזלטר" current={currentPageName}/>
              <AdminNavLink to="TherapistMiniSite" icon={<Globe size={18}/>} label="מיני-סייט" current={currentPageName}/>
              <AdminNavLink to="TherapistMiniSiteSettings" icon={<Globe size={18}/>} label="עיצוב מיני-סייט" current={currentPageName}/>
              <AdminNavLink to="TherapistReminders" icon={<Globe size={18}/>} label="תזכורות" current={currentPageName}/>
              <AdminNavLink to="TherapistIntegrations" icon={<Globe size={18}/>} label="אינטגרציות" current={currentPageName}/>
            </nav>
            <div className="p-4 border-t">
              <Link to={createPageUrl("Landing")} className="text-sm text-gray-500 hover:text-teal-600">
                ← חזרה לאתר
              </Link>
            </div>
          </aside>
          <main className="flex-1 lg:mr-64 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    );
  }

  const [navHistory, setNavHistory] = useState({
    Landing: [],
    TherapistSearch: [],
    MyAppointments: [],
    Exercises: [],
    MyAccount: []
  });

  const handleBottomNavClick = (to) => {
    if (currentPageName === to) {
      // Reset to root when active tab is re-clicked
      navigate(createPageUrl(to), { replace: true });
      setNavHistory(prev => ({ ...prev, [to]: [] }));
    } else {
      // Preserve navigation stack
      setNavHistory(prev => ({ 
        ...prev, 
        [currentPageName]: [...(prev[currentPageName] || []), currentPageName]
      }));
      navigate(createPageUrl(to));
    }
  };

  // Public / Client layout
  return (
    <div dir="rtl" className="min-h-screen font-sans" style={{ backgroundColor: 'var(--app-background)', overscrollBehaviorY: 'none' }}>
      
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="h-14 flex items-center justify-between" style={{ paddingLeft: 'env(safe-area-inset-left, 1rem)', paddingRight: 'env(safe-area-inset-right, 1rem)' }}>
          {!isRootPage ? (
            <button onClick={() => navigate(-1)} className="p-2">
              <ArrowRight size={24} className="text-gray-700"/>
            </button>
          ) : (
            <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
            </Link>
          )}
          <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
            {isRootPage ? "" : currentPageName.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
          <div className="w-10"/> {/* Spacer for balance */}
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-teal-700 hidden sm:inline">Meridian Wellness</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="TherapistSearch" label="מצא מטפל" current={currentPageName}/>
            <NavLink to="Exercises" label="תרגילים" current={currentPageName}/>
            <NavLink to="Recipes" label="מתכונים" current={currentPageName}/>
            <NavLink to="Shop" label="חנות" current={currentPageName}/>
            <NavLink to="Webinars" label="וובינרים" current={currentPageName}/>
            <NavLink to="Podcasts" label="פודקאסטים" current={currentPageName}/>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <User size={16} className="text-teal-700"/>
                    </div>
                    <span className="hidden sm:inline text-sm">{user?.full_name}</span>
                    <ChevronDown size={14}/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("MyAccount"))}>
                    <User size={14} className="ml-2"/> האזור שלי
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("MyAppointments"))}>
                    <Calendar size={14} className="ml-2"/> התורים שלי
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("MyFavorites"))}>
                    <Heart size={14} className="ml-2"/> מועדפים
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("MyOrders"))}>
                    <ShoppingBag size={14} className="ml-2"/> הזמנות
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(createPageUrl("MyChat"))}>
                    <MessageCircle size={14} className="ml-2"/> צ'אט עם מטפלים
                  </DropdownMenuItem>
                  <DropdownMenuSeparator/>
                  {isTherapist && (
                    <DropdownMenuItem onClick={() => navigate(createPageUrl("TherapistDashboard"))}>
                      <Shield size={14} className="ml-2"/> פאנל מטפל
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate(createPageUrl("AdminDashboard"))}>
                      <Shield size={14} className="ml-2"/> ניהול מערכת
                    </DropdownMenuItem>
                  )}
                  {!isTherapist && (
                    <DropdownMenuItem onClick={() => navigate(createPageUrl("TherapistRegister"))}>
                      <User size={14} className="ml-2"/> הרשמה כמטפל
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600">
                    <LogOut size={14} className="ml-2"/> התנתקות
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => base44.auth.redirectToLogin()}
                className="text-white rounded-full px-6 font-semibold"
                style={{ backgroundColor: 'var(--app-primary)' }}
              >
                התחברות
              </Button>
            )}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-2">
            <MobileNavLink to="TherapistSearch" label="🔎 מצא מטפל" onClick={() => setMobileMenuOpen(false)}/>
            <MobileNavLink to="Exercises" label="📚 תרגילים" onClick={() => setMobileMenuOpen(false)}/>
            <MobileNavLink to="Recipes" label="🥗 מתכונים" onClick={() => setMobileMenuOpen(false)}/>
            <MobileNavLink to="Shop" label="🛍 חנות" onClick={() => setMobileMenuOpen(false)}/>
            <MobileNavLink to="Webinars" label="🎥 וובינרים" onClick={() => setMobileMenuOpen(false)}/>
            <MobileNavLink to="Podcasts" label="🎙 פודקאסטים" onClick={() => setMobileMenuOpen(false)}/>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]" style={{ paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)', overscrollBehaviorY: 'none' }}>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)', overscrollBehavior: 'none', userSelect: 'none' }}>
        <div className="flex justify-around items-center h-16">
          <BottomNavItem to="Landing" icon={<Home size={20}/>} label="בית" current={currentPageName} onClick={handleBottomNavClick}/>
          <BottomNavItem to="TherapistSearch" icon={<Search size={20}/>} label="חיפוש" current={currentPageName} onClick={handleBottomNavClick}/>
          <BottomNavItem to="MyAppointments" icon={<Calendar size={20}/>} label="תורים" current={currentPageName} onClick={handleBottomNavClick}/>
          <BottomNavItem to="Exercises" icon={<BookOpen size={20}/>} label="תוכן" current={currentPageName} onClick={handleBottomNavClick}/>
          <BottomNavItem to="MyAccount" icon={<User size={20}/>} label="אישי" current={currentPageName} onClick={handleBottomNavClick}/>
        </div>
      </nav>

      {/* Footer (desktop) */}
      <footer className="hidden md:block bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">🌿 Meridian Wellness</h3>
            <p className="text-gray-400 text-sm">הפלטפורמה המובילה בישראל לחיבור בין מטפלים ומטופלים</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">ניווט</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link to={createPageUrl("TherapistSearch")} className="block hover:text-white">מצא מטפל</Link>
              <Link to={createPageUrl("Exercises")} className="block hover:text-white">תרגילים</Link>
              <Link to={createPageUrl("Shop")} className="block hover:text-white">חנות</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">תוכן</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link to={createPageUrl("Webinars")} className="block hover:text-white">וובינרים</Link>
              <Link to={createPageUrl("Podcasts")} className="block hover:text-white">פודקאסטים</Link>
              <Link to={createPageUrl("Recipes")} className="block hover:text-white">מתכונים</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">למטפלים</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link to={createPageUrl("TherapistRegister")} className="block hover:text-white">הרשמה כמטפל</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">התקן את האפליקציה ישירות מהדפדפן</p>
        </div>
      </footer>
      
      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16"/>
    </div>
  );
}

function NavLink({ to, label, current }) {
  const isActive = current === to;
  return (
    <Link
      to={createPageUrl(to)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick }) {
  return (
    <Link
      to={createPageUrl(to)}
      onClick={onClick}
      className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
    >
      {label}
    </Link>
  );
}

function BottomNavItem({ to, icon, label, current, onClick }) {
  const isActive = current === to;
  return (
    <button
      onClick={onClick ? () => onClick(to) : undefined}
      className={`flex flex-col items-center gap-1 ${
        isActive ? "text-teal-600" : "text-gray-400"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function AdminNavLink({ to, icon, label, current }) {
  const isActive = current === to;
  return (
    <Link
      to={createPageUrl(to)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {icon} {label}
    </Link>
  );
}