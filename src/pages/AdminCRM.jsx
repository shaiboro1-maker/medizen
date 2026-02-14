import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, Mail, Phone, TrendingUp, Filter, Download, UserPlus, ArrowRight, Send, Tag, Calendar, DollarSign, MessageCircle, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function AdminCRM() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterSegment, setFilterSegment] = useState("all");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [emailData, setEmailData] = useState({ to: "", subject: "", body: "" });
  const [noteData, setNoteData] = useState({ customer_email: "", notes: "" });
  const [tagData, setTagData] = useState({ customer_email: "", tag: "" });

  const { data: users = [] } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => base44.entities.Appointment.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => base44.entities.Order.list(),
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["allInteractions"],
    queryFn: () => base44.entities.CustomerInteraction.list("-created_date", 1000),
  });

  const { data: crmContacts = [] } = useQuery({
    queryKey: ["crmContacts"],
    queryFn: () => base44.entities.CRMContact.list(),
  });

  const sendEmailMutation = useMutation({
    mutationFn: (data) => base44.integrations.Core.SendEmail(data),
    onSuccess: () => {
      alert("המייל נשלח בהצלחה!");
      setShowEmailDialog(false);
      setEmailData({ to: "", subject: "", body: "" });
    },
  });

  const createInteractionMutation = useMutation({
    mutationFn: (data) => base44.entities.CustomerInteraction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allInteractions"] });
    },
  });

  const updateCRMContactMutation = useMutation({
    mutationFn: ({ email, data }) => {
      const existing = crmContacts.find(c => c.client_email === email);
      return existing 
        ? base44.entities.CRMContact.update(existing.id, data)
        : base44.entities.CRMContact.create({ client_email: email, ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmContacts"] });
      setShowTagDialog(false);
      setShowNoteDialog(false);
    },
  });

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserStats = (userEmail) => {
    const userAppointments = appointments.filter(a => a.client_email === userEmail);
    const userOrders = orders.filter(o => o.client_email === userEmail);
    const userInteractions = interactions.filter(i => i.customer_email === userEmail);
    const crmData = crmContacts.find(c => c.client_email === userEmail);
    const totalSpent = userAppointments.reduce((s, a) => s + (a.price || 0), 0) + 
                       userOrders.reduce((s, o) => s + (o.total || 0), 0);
    
    const lastActivity = userInteractions.length > 0 
      ? new Date(userInteractions[0].created_date)
      : null;
    
    const daysSinceActivity = lastActivity 
      ? Math.floor((new Date() - lastActivity) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      appointments: userAppointments.length,
      orders: userOrders.length,
      totalSpent,
      interactions: userInteractions,
      lastActivity,
      daysSinceActivity,
      tags: crmData?.tags || [],
      status: crmData?.status || "lead",
      notes: crmData?.notes || "",
      segment: getCustomerSegment(userAppointments.length, userOrders.length, totalSpent, daysSinceActivity)
    };
  };

  const getCustomerSegment = (appointments, orders, spent, daysSinceActivity) => {
    if (spent > 5000 || appointments > 10) return "vip";
    if (daysSinceActivity > 90) return "inactive";
    if (appointments > 0 || orders > 0) return "active";
    return "new";
  };

  const segmentedUsers = filteredUsers.filter(u => {
    if (filterSegment === "all") return true;
    const stats = getUserStats(u.email);
    return stats.segment === filterSegment;
  });

  const exportToCSV = () => {
    const csvData = segmentedUsers.map(user => {
      const stats = getUserStats(user.email);
      return {
        name: user.full_name,
        email: user.email,
        appointments: stats.appointments,
        orders: stats.orders,
        totalSpent: stats.totalSpent,
        segment: stats.segment,
        status: stats.status,
        tags: stats.tags.join(';'),
        lastActivity: stats.lastActivity?.toLocaleDateString('he-IL') || 'אין'
      };
    });
    
    const csv = [
      ['שם', 'אימייל', 'תורים', 'הזמנות', 'סה"כ הוצאה', 'פילוח', 'סטטוס', 'תגיות', 'פעילות אחרונה'],
      ...csvData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crm_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleSendEmail = (customer) => {
    setEmailData({ to: customer.email, subject: "", body: "" });
    setShowEmailDialog(true);
  };

  const handleAddTag = (customer) => {
    setTagData({ customer_email: customer.email, tag: "" });
    setShowTagDialog(true);
  };

  const handleAddNote = (customer) => {
    const stats = getUserStats(customer.email);
    setNoteData({ customer_email: customer.email, notes: stats.notes });
    setShowNoteDialog(true);
  };

  const vipCount = users.filter(u => getUserStats(u.email).segment === "vip").length;
  const activeCount = users.filter(u => getUserStats(u.email).segment === "active").length;
  const inactiveCount = users.filter(u => getUserStats(u.email).segment === "inactive").length;
  const newCount = users.filter(u => getUserStats(u.email).segment === "new").length;

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="mb-6 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowRight size={20}/>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#7C9885]">👥 CRM מקצועי</h1>
            <p className="text-[#A8947D]">ניהול לקוחות מתקדם</p>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download size={16} className="ml-2"/> ייצא לאקסל
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setFilterSegment("all")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} className="text-teal-600"/>
              <span className="text-sm text-gray-500">סה"כ לקוחות</span>
            </div>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setFilterSegment("active")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-green-600"/>
              <span className="text-sm text-gray-500">פעילים</span>
            </div>
            <p className="text-2xl font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setFilterSegment("vip")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus size={20} className="text-purple-600"/>
              <span className="text-sm text-gray-500">VIP</span>
            </div>
            <p className="text-2xl font-bold">{vipCount}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setFilterSegment("new")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} className="text-blue-600"/>
              <span className="text-sm text-gray-500">חדשים</span>
            </div>
            <p className="text-2xl font-bold">{newCount}</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setFilterSegment("inactive")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={20} className="text-amber-600"/>
              <span className="text-sm text-gray-500">לא פעילים</span>
            </div>
            <p className="text-2xl font-bold">{inactiveCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-3 text-gray-400" size={20}/>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לקוח לפי שם או אימייל..."
            className="pr-10"
          />
        </div>
        <Button 
          variant={filterSegment === "all" ? "default" : "outline"} 
          onClick={() => setFilterSegment("all")}
          size="sm"
        >
          הכל
        </Button>
        <Button 
          variant={filterSegment === "vip" ? "default" : "outline"} 
          onClick={() => setFilterSegment("vip")}
          size="sm"
        >
          VIP
        </Button>
        <Button 
          variant={filterSegment === "active" ? "default" : "outline"} 
          onClick={() => setFilterSegment("active")}
          size="sm"
        >
          פעילים
        </Button>
        <Button 
          variant={filterSegment === "new" ? "default" : "outline"} 
          onClick={() => setFilterSegment("new")}
          size="sm"
        >
          חדשים
        </Button>
        <Button 
          variant={filterSegment === "inactive" ? "default" : "outline"} 
          onClick={() => setFilterSegment("inactive")}
          size="sm"
        >
          לא פעילים
        </Button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F1E8]">
            <tr>
              <th className="text-right p-3 font-medium text-[#7C9885]">לקוח</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">אימייל</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סטטוס</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">תגיות</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">תורים</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">הזמנות</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סה"כ הוצאה</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {segmentedUsers.map(user => {
              const stats = getUserStats(user.email);
              return (
                <tr key={user.id} className="border-t border-[#E5DDD3] hover:bg-gray-50">
                  <td className="p-3 font-medium">{user.full_name}</td>
                  <td className="p-3 text-gray-600">{user.email}</td>
                  <td className="p-3">
                    <Badge className={
                      stats.status === 'vip' ? 'bg-purple-100 text-purple-800' :
                      stats.status === 'active' ? 'bg-green-100 text-green-800' :
                      stats.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {stats.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {stats.tags.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      {stats.tags.length > 2 && <Badge variant="outline" className="text-xs">+{stats.tags.length - 2}</Badge>}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{stats.appointments}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{stats.orders}</Badge>
                  </td>
                  <td className="p-3 font-bold text-green-600">
                    ₪{stats.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleSendEmail(user)} title="שלח מייל">
                        <Mail size={14}/>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAddTag(user)} title="הוסף תגית">
                        <Tag size={14}/>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleAddNote(user)} title="הוסף הערה">
                        <MessageCircle size={14}/>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedCustomer({ user, stats })}
                      >
                        צפה
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי לקוח - {selectedCustomer?.user.full_name}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.stats.appointments}</p>
                    <p className="text-xs text-gray-500">תורים</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedCustomer.stats.orders}</p>
                    <p className="text-xs text-gray-500">הזמנות</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">₪{selectedCustomer.stats.totalSpent}</p>
                    <p className="text-xs text-gray-500">סה"כ</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tags and Status */}
              <div className="flex gap-2 flex-wrap">
                {selectedCustomer.stats.tags.map((tag, i) => (
                  <Badge key={i}>{tag}</Badge>
                ))}
                <Badge className="bg-purple-100 text-purple-800">{selectedCustomer.stats.status}</Badge>
              </div>

              {/* Notes */}
              {selectedCustomer.stats.notes && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-bold mb-2">הערות</h4>
                  <p className="text-sm">{selectedCustomer.stats.notes}</p>
                </div>
              )}

              {/* Interactions History */}
              <div>
                <h3 className="font-bold text-[#7C9885] mb-3">היסטוריית אינטראקציות</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedCustomer.stats.interactions.map((interaction, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{interaction.interaction_type}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(interaction.created_date).toLocaleString('he-IL')}
                        </p>
                      </div>
                      {interaction.value && (
                        <Badge>₪{interaction.value}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>שלח מייל ללקוח</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>אל</Label>
              <Input value={emailData.to} readOnly/>
            </div>
            <div>
              <Label>נושא</Label>
              <Input value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})}/>
            </div>
            <div>
              <Label>תוכן</Label>
              <Textarea rows={5} value={emailData.body} onChange={(e) => setEmailData({...emailData, body: e.target.value})}/>
            </div>
            <Button onClick={() => sendEmailMutation.mutate(emailData)} className="w-full bg-[#B8A393] hover:bg-[#C5B5A4]">
              <Send size={16} className="ml-2"/> שלח
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>הוסף תגית</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>תגית</Label>
              <Input value={tagData.tag} onChange={(e) => setTagData({...tagData, tag: e.target.value})} placeholder="לקוח VIP, מתעניין, וכו'"/>
            </div>
            <Button 
              onClick={() => {
                const existing = crmContacts.find(c => c.client_email === tagData.customer_email);
                const currentTags = existing?.tags || [];
                updateCRMContactMutation.mutate({
                  email: tagData.customer_email,
                  data: { tags: [...currentTags, tagData.tag] }
                });
              }} 
              className="w-full bg-[#B8A393] hover:bg-[#C5B5A4]"
            >
              <Tag size={16} className="ml-2"/> הוסף
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>הערות ללקוח</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>הערות</Label>
              <Textarea rows={5} value={noteData.notes} onChange={(e) => setNoteData({...noteData, notes: e.target.value})}/>
            </div>
            <Button 
              onClick={() => {
                updateCRMContactMutation.mutate({
                  email: noteData.customer_email,
                  data: { notes: noteData.notes }
                });
              }} 
              className="w-full bg-[#B8A393] hover:bg-[#C5B5A4]"
            >
              שמור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}