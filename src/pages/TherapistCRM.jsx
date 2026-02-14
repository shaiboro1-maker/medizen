import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Tag, User, Phone, Mail, Calendar, DollarSign, Eye, Edit, Plus, Download, Send, Target, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";

export default function TherapistCRM() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showCampaign, setShowCampaign] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: "",
    target_type: "last_appointment",
    days_threshold: 30,
    message: "",
    delivery_method: "popup"
  });
  const [newTag, setNewTag] = useState("");

  const { data: therapist } = useQuery({
    queryKey: ["current-therapist"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      return therapists[0];
    },
  });

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["crm-contacts", therapist?.id],
    queryFn: () => base44.entities.CRMContact.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["therapist-appointments", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CRMContact.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-contacts"] });
      setShowTagDialog(false);
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.PopupNotification.create({
      therapist_id: therapist.id,
      title: data.name,
      message: data.message,
      target_type: "specific_clients",
      target_emails: data.target_emails,
      action_type: "general",
      scheduled_date: new Date().toISOString(),
      status: "scheduled"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setShowCampaign(false);
      alert("הקמפיין נוצר בהצלחה!");
    },
  });

  const filteredContacts = contacts.filter(c => {
    const matchSearch = !searchQuery || 
      c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getTargetedContacts = () => {
    if (campaignData.target_type === "last_appointment") {
      const threshold = moment().subtract(campaignData.days_threshold, 'days');
      return contacts.filter(c => 
        c.last_appointment_date && moment(c.last_appointment_date).isBefore(threshold)
      );
    }
    if (campaignData.target_type === "no_appointments") {
      return contacts.filter(c => !c.last_appointment_date || c.total_appointments === 0);
    }
    if (campaignData.target_type === "vip") {
      return contacts.filter(c => c.status === "vip");
    }
    return contacts;
  };

  const handleCreateCampaign = () => {
    const targetContacts = getTargetedContacts();
    createCampaignMutation.mutate({
      ...campaignData,
      target_emails: targetContacts.map(c => c.client_email)
    });
  };

  const handleAddTag = (contact) => {
    if (!newTag) return;
    const currentTags = contact.tags || [];
    updateContactMutation.mutate({
      id: contact.id,
      data: { tags: [...currentTags, newTag] }
    });
    setNewTag("");
  };

  const statusColors = {
    lead: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    vip: "bg-amber-100 text-amber-800"
  };

  return (
    <div className="p-6" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#7C9885]">CRM - ניהול לקוחות מתקדם</h1>
          <p className="text-[#A8947D]">נהל את קשרי הלקוחות שלך במקום אחד</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCampaign(true)} className="bg-purple-600 hover:bg-purple-700">
            <Target size={16} className="ml-2"/> קמפיין חדש
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus size={16} className="ml-2"/> לקוח חדש
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#E5DDD3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User size={20} className="text-blue-600"/>
            </div>
            <div>
              <p className="text-sm text-gray-500">סה"כ לקוחות</p>
              <p className="text-2xl font-bold">{contacts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5DDD3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <User size={20} className="text-green-600"/>
            </div>
            <div>
              <p className="text-sm text-gray-500">לקוחות פעילים</p>
              <p className="text-2xl font-bold">{contacts.filter(c => c.status === "active").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5DDD3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <User size={20} className="text-amber-600"/>
            </div>
            <div>
              <p className="text-sm text-gray-500">לקוחות VIP</p>
              <p className="text-2xl font-bold">{contacts.filter(c => c.status === "vip").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#E5DDD3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-purple-600"/>
            </div>
            <div>
              <p className="text-sm text-gray-500">סה"כ הכנסות</p>
              <p className="text-2xl font-bold">₪{contacts.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש לפי שם, מייל או טלפון..."
                className="pr-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="סטטוס"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">הכל</SelectItem>
              <SelectItem value="lead">ליד</SelectItem>
              <SelectItem value="active">פעיל</SelectItem>
              <SelectItem value="inactive">לא פעיל</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={16} className="ml-2"/> ייצא לאקסל
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-[#E5DDD3]">
        <table className="w-full text-right">
          <thead className="border-b bg-[#F5F1E8]">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">שם</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">אימייל</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">טלפון</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">סטטוס</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">תגיות</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">תורים</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">הכנסות</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">תור אחרון</th>
              <th className="px-4 py-3 text-sm font-semibold text-[#7C9885]">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">טוען...</td></tr>
            ) : filteredContacts.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">אין לקוחות</td></tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">
                        {contact.client_name?.[0] || "?"}
                      </div>
                      <span className="font-medium">{contact.client_name || "לא ידוע"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{contact.client_email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{contact.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[contact.status]}>
                      {contact.status === "lead" && "ליד"}
                      {contact.status === "active" && "פעיל"}
                      {contact.status === "inactive" && "לא פעיל"}
                      {contact.status === "vip" && "VIP"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags?.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      {contact.tags?.length > 2 && <Badge variant="outline" className="text-xs">+{contact.tags.length - 2}</Badge>}
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedContact(contact); setShowTagDialog(true); }}>
                        <Tag size={12}/>
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{contact.total_appointments || 0}</td>
                  <td className="px-4 py-3 text-sm font-medium">₪{(contact.total_revenue || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contact.last_appointment_date ? moment(contact.last_appointment_date).fromNow() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedContact(contact)}>
                        <Eye size={14}/>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit size={14}/>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contact Details Dialog */}
      {selectedContact && !showTagDialog && (
        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>פרטי לקוח</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-2xl font-bold text-teal-700">
                  {selectedContact.client_name?.[0] || "?"}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedContact.client_name}</h3>
                  <Badge className={statusColors[selectedContact.status]}>
                    {selectedContact.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <Mail size={14}/> אימייל
                  </Label>
                  <p className="font-medium">{selectedContact.client_email}</p>
                </div>
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <Phone size={14}/> טלפון
                  </Label>
                  <p className="font-medium">{selectedContact.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <Calendar size={14}/> סה"כ תורים
                  </Label>
                  <p className="font-medium">{selectedContact.total_appointments || 0}</p>
                </div>
                <div>
                  <Label className="text-gray-500 flex items-center gap-2">
                    <DollarSign size={14}/> סה"כ הכנסות
                  </Label>
                  <p className="font-medium">₪{(selectedContact.total_revenue || 0).toLocaleString()}</p>
                </div>
              </div>
              {selectedContact.tags?.length > 0 && (
                <div>
                  <Label>תגיות</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selectedContact.tags.map((tag, i) => (
                      <Badge key={i}>{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedContact.notes && (
                <div>
                  <Label>הערות</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedContact.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ניהול תגיות - {selectedContact?.client_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>תגיות קיימות</Label>
              <div className="flex gap-2 flex-wrap mt-2">
                {selectedContact?.tags?.map((tag, i) => (
                  <Badge key={i} className="cursor-pointer" onClick={() => {
                    const newTags = selectedContact.tags.filter((_, idx) => idx !== i);
                    updateContactMutation.mutate({ id: selectedContact.id, data: { tags: newTags } });
                  }}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>הוסף תגית חדשה</Label>
              <div className="flex gap-2 mt-2">
                <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="למשל: לקוח מיוחד, חדש, וכו'"/>
                <Button onClick={() => handleAddTag(selectedContact)}>
                  <Plus size={16}/>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Dialog */}
      <Dialog open={showCampaign} onOpenChange={setShowCampaign}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>צור קמפיין ממוקד</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>שם הקמפיין</Label>
              <Input value={campaignData.name} onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}/>
            </div>
            <div>
              <Label>קהל יעד</Label>
              <Select value={campaignData.target_type} onValueChange={(v) => setCampaignData({...campaignData, target_type: v})}>
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_appointment">לקוחות שלא הגיעו מזמן</SelectItem>
                  <SelectItem value="no_appointments">לקוחות ללא תורים</SelectItem>
                  <SelectItem value="vip">לקוחות VIP</SelectItem>
                  <SelectItem value="all">כל הלקוחות</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {campaignData.target_type === "last_appointment" && (
              <div>
                <Label>כמה ימים מאז התור האחרון?</Label>
                <Input type="number" value={campaignData.days_threshold} onChange={(e) => setCampaignData({...campaignData, days_threshold: parseInt(e.target.value)})}/>
              </div>
            )}
            <div>
              <Label>תוכן ההודעה</Label>
              <Textarea rows={4} value={campaignData.message} onChange={(e) => setCampaignData({...campaignData, message: e.target.value})}/>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium">קהל יעד: {getTargetedContacts().length} לקוחות</p>
            </div>
            <Button onClick={handleCreateCampaign} className="w-full bg-purple-600 hover:bg-purple-700">
              <Send size={16} className="ml-2"/> צור קמפיין ושלח
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}