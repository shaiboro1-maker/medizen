import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Calendar, DollarSign, ShoppingBag, Video, TrendingUp, Bell, Download, CheckCircle, Clock, AlertCircle, Plus, Trash2, ArrowRight, Music as MusicIcon, FileText, Podcast as PodcastIcon, Mail, Edit2, XCircle, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import moment from "moment";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [contentType, setContentType] = useState("exercise");
  const [uploading, setUploading] = useState(false);
  const [contentFilter, setContentFilter] = useState("");
  const [editingContent, setEditingContent] = useState(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('admin_dashboard_widgets');
    return saved ? JSON.parse(saved) : {
      stats: true,
      charts: true,
      appointments: true,
      content: true,
      quickActions: true
    };
  });
  const appUrl = window.location.origin;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    video_url: "",
    thumbnail_url: "",
    audio_url: "",
    image_url: "",
    content: "",
    ingredients: "",
    instructions: "",
    difficulty: "easy",
    duration_minutes: 0,
    prep_time_minutes: 0
  });

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
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          alert('האפליקציה הותקנה בהצלחה!');
        }
      } catch (error) {
        // Manual install instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
          alert('להתקנה: לחץ על כפתור השיתוף ובחר "הוסף למסך הבית"');
        } else if (isAndroid) {
          alert('להתקנה: פתח את התפריט של הדפדפן ובחר "הוסף למסך הבית" או "התקן אפליקציה"');
        } else {
          alert('להתקנה: השתמש באפשרות "התקן" בתפריט הדפדפן');
        }
      }
    } else {
      // No prompt available - show manual instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('להתקנה: לחץ על כפתור השיתוף 📤 ובחר "הוסף למסך הבית"');
      } else if (isAndroid) {
        alert('להתקנה: פתח את תפריט הדפדפן ⋮ ובחר "הוסף למסך הבית"');
      } else {
        alert('להתקנה: פתח את תפריט הדפדפן ובחר "התקן אפליקציה"');
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
    queryKey: ["adminExercises"],
    queryFn: () => base44.entities.Exercise.list("-created_date"),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["adminRecipes"],
    queryFn: () => base44.entities.Recipe.list("-created_date"),
  });

  const { data: music = [] } = useQuery({
    queryKey: ["adminMusic"],
    queryFn: () => base44.entities.Music.list("-created_date"),
  });

  const { data: bulletinPosts = [] } = useQuery({
    queryKey: ["adminBulletin"],
    queryFn: () => base44.entities.BulletinPost.list("-created_date"),
  });

  const { data: podcasts = [] } = useQuery({
    queryKey: ["adminPodcasts"],
    queryFn: () => base44.entities.Podcast.list("-created_date"),
  });

  const { data: userContent = [] } = useQuery({
    queryKey: ["pendingUserContent"],
    queryFn: () => base44.entities.UserContent.filter({ status: "pending" }),
  });

  const { data: inspirations = [] } = useQuery({
    queryKey: ["adminInspirations"],
    queryFn: () => base44.entities.Inspiration.list("-created_date"),
  });

  const approvedTherapists = therapists.filter(t => t.status === "approved").length;
  const pendingTherapists = therapists.filter(t => t.status === "pending").length;
  const totalRevenue = appointments.filter(a => a.status !== "cancelled").reduce((s, a) => s + (a.price || 0), 0);
  const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);

  const pendingExercises = exercises.filter(e => !e.is_approved).length;
  const pendingRecipes = recipes.filter(r => !r.is_approved).length;
  const pendingBulletin = bulletinPosts.filter(b => b.status === "pending").length;
  const pendingApprovals = pendingTherapists + pendingExercises + pendingRecipes + userContent.length + pendingBulletin;

  // Advanced Stats
  const last6MonthsRevenue = Array.from({length: 6}, (_, i) => {
    const month = moment().subtract(5 - i, 'months');
    const monthAppointments = appointments.filter(a => 
      moment(a.date).format('YYYY-MM') === month.format('YYYY-MM') && a.status !== 'cancelled'
    );
    return {
      month: month.format('MMM'),
      revenue: monthAppointments.reduce((sum, a) => sum + (a.price || 0), 0)
    };
  });

  const appointmentsByStatus = [
    { name: 'מאושר', value: appointments.filter(a => a.status === 'confirmed').length, color: '#10b981' },
    { name: 'ממתין', value: appointments.filter(a => a.status === 'pending').length, color: '#f59e0b' },
    { name: 'בוטל', value: appointments.filter(a => a.status === 'cancelled').length, color: '#ef4444' },
    { name: 'הושלם', value: appointments.filter(a => a.status === 'completed').length, color: '#3b82f6' }
  ];

  const newClientsLast6Months = Array.from({length: 6}, (_, i) => {
    const month = moment().subtract(5 - i, 'months');
    const newClients = appointments.filter(a => 
      moment(a.created_date).format('YYYY-MM') === month.format('YYYY-MM')
    ).length;
    return {
      month: month.format('MMM'),
      clients: newClients
    };
  });

  const saveWidgets = (newWidgets) => {
    setWidgets(newWidgets);
    localStorage.setItem('admin_dashboard_widgets', JSON.stringify(newWidgets));
  };

  const deleteExMutation = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminExercises"] }),
  });

  const deleteRecMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminRecipes"] }),
  });

  const deleteMusicMutation = useMutation({
    mutationFn: (id) => base44.entities.Music.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminMusic"] }),
  });

  const deleteBulletinMutation = useMutation({
    mutationFn: (id) => base44.entities.BulletinPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminBulletin"] }),
  });

  const deleteWebinarMutation = useMutation({
    mutationFn: (id) => base44.entities.Webinar.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allWebinars"] }),
  });

  const deletePodcastMutation = useMutation({
    mutationFn: (id) => base44.entities.Podcast.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminPodcasts"] }),
  });

  const deleteInspirationMutation = useMutation({
    mutationFn: (id) => base44.entities.Inspiration.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminInspirations"] }),
  });

  const deleteUserContentMutation = useMutation({
    mutationFn: (id) => base44.entities.UserContent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pendingUserContent"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (contentType === "exercise") return base44.entities.Exercise.create(data);
      if (contentType === "recipe") return base44.entities.Recipe.create(data);
      if (contentType === "music") return base44.entities.Music.create(data);
      if (contentType === "bulletin") return base44.entities.BulletinPost.create(data);
      if (contentType === "webinar") return base44.entities.Webinar.create(data);
      if (contentType === "podcast") return base44.entities.Podcast.create(data);
      if (contentType === "inspiration") return base44.entities.Inspiration.create(data);
      if (contentType === "joke") return base44.entities.UserContent.create({...data, content_type: "joke", status: "approved"});
      if (contentType === "story") return base44.entities.UserContent.create({...data, content_type: "story", status: "approved"});
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowUploadDialog(false);
      resetForm();
    },
  });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      alert("שגיאה בהעלאת קובץ");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      video_url: "",
      thumbnail_url: "",
      audio_url: "",
      image_url: "",
      content: "",
      ingredients: "",
      instructions: "",
      difficulty: "easy",
      duration_minutes: 0,
      prep_time_minutes: 0
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, is_approved: true, status: "published" };
    createMutation.mutate(data);
  };

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
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(createPageUrl("Landing"))}>
            <ArrowRight size={20}/>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#7C9885]">🎯 דשבורד מנהל</h1>
            <p className="text-[#A8947D]">ניהול מלא של המערכת</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCustomize(true)} variant="outline" size="sm">
            <Settings size={16} className="ml-2"/> התאם אישית
          </Button>
          <Button onClick={() => setShowUploadDialog(true)} className="bg-[#B8A393] hover:bg-[#C5B5A4]">
            <Plus size={16} className="ml-2"/> העלה תוכן
          </Button>
          <Button onClick={() => setShowInstallHelp(true)} size="sm" className="bg-[#B8A393] hover:bg-[#C5B5A4]">
            <Download size={16} className="ml-2"/> הורד לטלפון
          </Button>
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
      {widgets.stats && (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          icon={<Users className="text-teal-600"/>} 
          label="מטפלים פעילים" 
          value={approvedTherapists} 
          bg="bg-teal-50"
          link="AdminTherapists"
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
          onClick={() => navigate(createPageUrl("AdminAppointments"))}
        />
        <StatCard 
          icon={<DollarSign className="text-green-600"/>} 
          label="הכנסות תורים" 
          value={`₪${totalRevenue.toLocaleString()}`} 
          bg="bg-green-50"
          onClick={() => navigate(createPageUrl("AdminPayments"))}
        />
        <StatCard 
          icon={<ShoppingBag className="text-purple-600"/>} 
          label="מכירות חנות" 
          value={`₪${totalSales.toLocaleString()}`} 
          bg="bg-purple-50"
          onClick={() => navigate(createPageUrl("AdminOrders"))}
        />
        <StatCard 
          icon={<Video className="text-pink-600"/>} 
          label="וובינרים" 
          value={webinars.length} 
          bg="bg-pink-50"
          onClick={() => navigate(createPageUrl("AdminWebinars"))}
        />
      </div>
      )}

      {/* Advanced Charts */}
      {widgets.charts && (
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>הכנסות חודשיות</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last6MonthsRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>התפלגות תורים לפי סטטוס</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={appointmentsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {appointmentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>לקוחות חדשים</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={newClientsLast6Months}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clients" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>קיצורי דרך מהירים</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminTherapists"))} className="justify-start">
              <Users size={16} className="ml-2"/> מטפלים
            </Button>
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminOrders"))} className="justify-start">
              <ShoppingBag size={16} className="ml-2"/> הזמנות
            </Button>
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminCRM"))} className="justify-start">
              <Users size={16} className="ml-2"/> CRM
            </Button>
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminContent"))} className="justify-start">
              <FileText size={16} className="ml-2"/> תוכן
            </Button>
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminCampaigns"))} className="justify-start">
              <TrendingUp size={16} className="ml-2"/> קמפיינים
            </Button>
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminPromotions"))} className="justify-start">
              <DollarSign size={16} className="ml-2"/> מבצעים
            </Button>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Content Management Section */}
      {widgets.content && (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-[#7C9885]">ניהול תוכן</h2>
        <Tabs defaultValue="exercises" className="space-y-4">
          <TabsList className="bg-white rounded-xl p-1 border border-[#E5DDD3] flex-wrap">
            <TabsTrigger value="exercises">תרגילים ({exercises.length})</TabsTrigger>
            <TabsTrigger value="recipes">מתכונים ({recipes.length})</TabsTrigger>
            <TabsTrigger value="inspirations">השראות ({inspirations.length})</TabsTrigger>
            <TabsTrigger value="userContent">תוכן משתמשים ({userContent.length})</TabsTrigger>
            <TabsTrigger value="music">מוזיקה ({music.length})</TabsTrigger>
            <TabsTrigger value="bulletin">לוח מודעות ({bulletinPosts.length})</TabsTrigger>
            <TabsTrigger value="webinars">וובינרים ({webinars.length})</TabsTrigger>
            <TabsTrigger value="podcasts">פודקאסטים ({podcasts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises">
            <div className="mb-3">
              <Input
                placeholder="חפש תרגיל..."
                value={contentFilter}
                onChange={(e) => setContentFilter(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {exercises.filter(ex => 
                !contentFilter || 
                ex.title?.toLowerCase().includes(contentFilter.toLowerCase()) ||
                ex.category?.toLowerCase().includes(contentFilter.toLowerCase())
              ).slice(0, 10).map(ex => (
                <ContentCard
                  key={ex.id}
                  title={ex.title}
                  subtitle={`${ex.category} · ${ex.therapist_name || "מערכת"}`}
                  image={ex.thumbnail_url}
                  isApproved={ex.is_approved}
                  onDelete={() => deleteExMutation.mutate(ex.id)}
                  onEdit={() => {
                    setEditingContent({ ...ex, type: 'exercise' });
                    setFormData(ex);
                    setShowUploadDialog(true);
                  }}
                  onToggleStatus={() => {
                    base44.entities.Exercise.update(ex.id, { is_approved: !ex.is_approved }).then(() => {
                      queryClient.invalidateQueries({ queryKey: ["adminExercises"] });
                    });
                  }}
                />
              ))}
              <Link to={createPageUrl("AdminContent")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="recipes">
            <div className="mb-3">
              <Input
                placeholder="חפש מתכון..."
                value={contentFilter}
                onChange={(e) => setContentFilter(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {recipes.filter(r => 
                !contentFilter || 
                r.title?.toLowerCase().includes(contentFilter.toLowerCase()) ||
                r.category?.toLowerCase().includes(contentFilter.toLowerCase())
              ).slice(0, 10).map(r => (
                <ContentCard
                  key={r.id}
                  title={r.title}
                  subtitle={`${r.category} · ${r.therapist_name || "מערכת"}`}
                  image={r.image_url}
                  isApproved={r.is_approved}
                  onDelete={() => deleteRecMutation.mutate(r.id)}
                  onEdit={() => {
                    setEditingContent({ ...r, type: 'recipe' });
                    setFormData(r);
                    setShowUploadDialog(true);
                  }}
                  onToggleStatus={() => {
                    base44.entities.Recipe.update(r.id, { is_approved: !r.is_approved }).then(() => {
                      queryClient.invalidateQueries({ queryKey: ["adminRecipes"] });
                    });
                  }}
                />
              ))}
              <Link to={createPageUrl("AdminContent")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="space-y-3">
              {music.slice(0, 5).map(m => (
                <ContentCard
                  key={m.id}
                  title={m.title}
                  subtitle={`${m.category} · ${m.duration_minutes || 0} דק'`}
                  image={m.image_url}
                  onDelete={() => deleteMusicMutation.mutate(m.id)}
                />
              ))}
              <Link to={createPageUrl("AdminContent")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="bulletin">
            <div className="space-y-3">
              {bulletinPosts.slice(0, 5).map(b => (
                <ContentCard
                  key={b.id}
                  title={b.title}
                  subtitle={`${b.category} · ${b.therapist_name || "אנונימי"}`}
                  image={b.image_urls?.[0]}
                  onDelete={() => deleteBulletinMutation.mutate(b.id)}
                />
              ))}
              <Link to={createPageUrl("AdminBulletin")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="webinars">
            <div className="space-y-3">
              {webinars.slice(0, 5).map(w => (
                <ContentCard
                  key={w.id}
                  title={w.title}
                  subtitle={`${new Date(w.date).toLocaleDateString('he-IL')} · ${w.therapist_name || "מערכת"}`}
                  image={w.image_url}
                  onDelete={() => deleteWebinarMutation.mutate(w.id)}
                />
              ))}
              <Link to={createPageUrl("AdminWebinars")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="podcasts">
            <div className="space-y-3">
              {podcasts.slice(0, 5).map(p => (
                <ContentCard
                  key={p.id}
                  title={p.title}
                  subtitle={`${p.category} · ${p.duration_minutes || 0} דק'`}
                  image={p.thumbnail_url}
                  onDelete={() => deletePodcastMutation.mutate(p.id)}
                />
              ))}
              <Link to={createPageUrl("AdminContent")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="inspirations">
            <div className="space-y-3">
              {inspirations.slice(0, 10).map(i => (
                <ContentCard
                  key={i.id}
                  title={i.text?.substring(0, 60) + "..."}
                  subtitle={`${i.category} · ${i.author || "אנונימי"}`}
                  image={i.image_url}
                  isApproved={i.is_approved}
                  onDelete={() => deleteInspirationMutation.mutate(i.id)}
                  onEdit={() => {
                    setEditingContent({ ...i, type: 'inspiration' });
                    setFormData({ ...i, title: i.text?.substring(0, 50) });
                    setShowUploadDialog(true);
                  }}
                  onToggleStatus={() => {
                    base44.entities.Inspiration.update(i.id, { is_approved: !i.is_approved }).then(() => {
                      queryClient.invalidateQueries({ queryKey: ["adminInspirations"] });
                    });
                  }}
                />
              ))}
              <Link to={createPageUrl("AdminInspirations")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="userContent">
            <div className="space-y-3">
              {userContent.slice(0, 10).map(c => (
                <ContentCard
                  key={c.id}
                  title={c.title}
                  subtitle={`${c.content_type} · ${c.user_email}`}
                  image={c.image_url}
                  isApproved={c.status === "approved"}
                  onDelete={() => deleteUserContentMutation.mutate(c.id)}
                  onEdit={() => {
                    setEditingContent({ ...c, type: 'userContent' });
                    setFormData(c);
                    setShowUploadDialog(true);
                  }}
                  onToggleStatus={() => {
                    const newStatus = c.status === "approved" ? "rejected" : "approved";
                    base44.entities.UserContent.update(c.id, { status: newStatus }).then(() => {
                      queryClient.invalidateQueries({ queryKey: ["pendingUserContent"] });
                    });
                  }}
                />
              ))}
              <Link to={createPageUrl("AdminUserContent")}>
                <Button variant="outline" className="w-full">ראה הכל</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      )}

      {/* Quick Actions */}
      {widgets.quickActions && (
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <QuickActionCard
          title="ניהול מטפלים"
          description="אישור והשעיית מטפלים"
          link="AdminTherapists"
          icon={<Users size={20}/>}
          color="bg-teal-50 text-teal-600"
        />
        <QuickActionCard
          title="ניהול חנות"
          description="מוצרים והזמנות"
          link="AdminProducts"
          icon={<ShoppingBag size={20}/>}
          color="bg-purple-50 text-purple-600"
        />
        <QuickActionCard
          title="CRM ולקוחות"
          description="ניהול קשרי לקוחות"
          link="AdminCRM"
          icon={<Users size={20}/>}
          color="bg-green-50 text-green-600"
        />
      </div>
      )}

      {/* Recent Appointments */}
      {widgets.appointments && (
      <>
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
      </>
      )}

      {/* Customize Dashboard Dialog */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>התאמה אישית של הדשבורד</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>סטטיסטיקות כלליות</Label>
              <Switch checked={widgets.stats} onCheckedChange={(v) => saveWidgets({...widgets, stats: v})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>גרפים וניתוחים</Label>
              <Switch checked={widgets.charts} onCheckedChange={(v) => saveWidgets({...widgets, charts: v})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>ניהול תוכן</Label>
              <Switch checked={widgets.content} onCheckedChange={(v) => saveWidgets({...widgets, content: v})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>קיצורי דרך</Label>
              <Switch checked={widgets.quickActions} onCheckedChange={(v) => saveWidgets({...widgets, quickActions: v})} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>תורים אחרונים</Label>
              <Switch checked={widgets.appointments} onCheckedChange={(v) => saveWidgets({...widgets, appointments: v})} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Install Help Dialog */}
      <Dialog open={showInstallHelp} onOpenChange={setShowInstallHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>הורד את האפליקציה לטלפון</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium mb-3">סרוק את הקוד:</p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
            
            <div>
              <Label>קישור לאפליקציה</Label>
              <div className="flex gap-2 mt-2">
                <Input value={window.location.origin} readOnly className="text-sm"/>
                <Button onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert('הקישור הועתק!');
                }}>
                  העתק
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-bold mb-2">הוראות התקנה:</h4>
              <ol className="text-sm space-y-2 list-decimal list-inside">
                <li>פתח את הקישור בטלפון (Safari/Chrome)</li>
                <li><strong>אנדרואיד:</strong> תפריט ⋮ → "הוסף למסך הבית"</li>
                <li><strong>אייפון:</strong> כפתור שיתוף 📤 → "הוסף למסך הבית"</li>
              </ol>
            </div>

            <Button 
              onClick={async () => {
                try {
                  const email = (await base44.auth.me()).email;
                  await base44.integrations.Core.SendEmail({
                    to: email,
                    subject: "קישור להורדת האפליקציה",
                    body: `שלום,\n\nהנה הקישור להורדת האפליקציה שלך:\n${window.location.origin}\n\nפתח את הקישור בטלפון ועקוב אחרי ההוראות להתקנה.\n\nבברכה,\nצוות האפליקציה`
                  });
                  alert('הקישור נשלח למייל שלך!');
                } catch (error) {
                  alert('שגיאה בשליחת המייל');
                }
              }}
              className="w-full bg-[#B8A393] hover:bg-[#C5B5A4]"
            >
              <Mail size={16} className="ml-2"/> שלח קישור למייל
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Content Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>העלה תוכן חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>סוג תוכן</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercise">תרגיל</SelectItem>
                  <SelectItem value="recipe">מתכון</SelectItem>
                  <SelectItem value="inspiration">משפט השראה</SelectItem>
                  <SelectItem value="joke">בדיחה</SelectItem>
                  <SelectItem value="story">סיפור</SelectItem>
                  <SelectItem value="music">מוזיקה</SelectItem>
                  <SelectItem value="bulletin">לוח מודעות</SelectItem>
                  <SelectItem value="webinar">וובינר</SelectItem>
                  <SelectItem value="podcast">פודקאסט</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {contentType === "inspiration" ? (
              <>
                <div>
                  <Label>טקסט משפט ההשראה</Label>
                  <Textarea
                    value={formData.content || formData.text}
                    onChange={(e) => setFormData({...formData, content: e.target.value, text: e.target.value})}
                    required
                    rows={3}
                  />
                </div>
                <div>
                  <Label>מחבר (אופציונלי)</Label>
                  <Input
                    value={formData.author || ""}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>כותרת</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>תיאור</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </>
            )}

            {(contentType === "bulletin" || contentType === "joke" || contentType === "story") && (
              <div>
                <Label>תוכן</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={5}
                  required
                />
              </div>
            )}

            {contentType === "inspiration" ? (
              <div>
                <Label>קטגוריה</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר קטגוריה"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motivation">מוטיבציה</SelectItem>
                    <SelectItem value="health">בריאות</SelectItem>
                    <SelectItem value="happiness">אושר</SelectItem>
                    <SelectItem value="success">הצלחה</SelectItem>
                    <SelectItem value="peace">שלווה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : contentType !== "joke" && contentType !== "story" && (
              <div>
                <Label>קטגוריה</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>
            )}

            {(contentType === "exercise" || contentType === "webinar" || contentType === "podcast") && (
              <div>
                <Label>העלאת וידאו</Label>
                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, "video_url")} className="block w-full text-sm"/>
                {formData.video_url && <p className="text-xs text-green-600 mt-1">✓ הועלה</p>}
              </div>
            )}

            <div>
              <Label>העלאת תמונה</Label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileUpload(e, contentType === "exercise" ? "thumbnail_url" : "image_url")} 
                className="block w-full text-sm"
              />
              {(formData.thumbnail_url || formData.image_url) && <p className="text-xs text-green-600 mt-1">✓ הועלה</p>}
            </div>

            {contentType === "music" && (
              <div>
                <Label>העלאת קובץ אודיו</Label>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, "audio_url")} className="block w-full text-sm"/>
                {formData.audio_url && <p className="text-xs text-green-600 mt-1">✓ הועלה</p>}
              </div>
            )}

            {contentType === "recipe" && (
              <>
                <div>
                  <Label>מרכיבים</Label>
                  <Textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  />
                </div>
                <div>
                  <Label>הוראות הכנה</Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
                ביטול
              </Button>
              <Button type="submit" className="bg-[#B8A393] hover:bg-[#C5B5A4]" disabled={uploading}>
                {uploading ? "מעלה..." : "צור תוכן"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, bg, link, onClick }) {
  const content = (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-5">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </CardContent>
    </Card>
  );

  if (link) return <Link to={createPageUrl(link)}>{content}</Link>;
  if (onClick) return <div onClick={onClick}>{content}</div>;
  return content;
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

function ContentCard({ title, subtitle, image, isApproved, onDelete, onEdit, onToggleStatus }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5DDD3] p-4 flex items-start gap-4">
      {image && (
        <img src={image} alt="" className="w-16 h-16 rounded-lg object-cover"/>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-[#7C9885]">{title}</h3>
          <Badge className={isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
            {isApproved ? "פורסם" : "ממתין"}
          </Badge>
        </div>
        <p className="text-sm text-[#A8947D]">{subtitle}</p>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit} title="ערוך">
          <Edit2 size={16}/>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleStatus}
          title={isApproved ? "הסר פרסום" : "פרסם"}
          className={isApproved ? "text-amber-500" : "text-green-500"}
        >
          {isApproved ? <XCircle size={16}/> : <CheckCircle size={16}/>}
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500" title="מחק">
          <Trash2 size={16}/>
        </Button>
      </div>
    </div>
  );
}