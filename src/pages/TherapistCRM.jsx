import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Tag, User, Phone, Mail, Calendar, DollarSign, Eye, Edit, Plus, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TherapistCRM() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);

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

  const filteredContacts = contacts.filter(c => {
    const matchSearch = !searchQuery || 
      c.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors = {
    lead: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    vip: "bg-amber-100 text-amber-800"
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM - ניהול לקוחות</h1>
          <p className="text-gray-500">נהל את קשרי הלקוחות שלך במקום אחד</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="ml-2"/> לקוח חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
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
        <div className="bg-white rounded-xl p-4 border">
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
        <div className="bg-white rounded-xl p-4 border">
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
        <div className="bg-white rounded-xl p-4 border">
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
      <div className="bg-white rounded-xl border p-4 mb-6">
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
      <div className="bg-white rounded-xl border">
        <table className="w-full text-right">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold">שם</th>
              <th className="px-4 py-3 text-sm font-semibold">אימייל</th>
              <th className="px-4 py-3 text-sm font-semibold">טלפון</th>
              <th className="px-4 py-3 text-sm font-semibold">סטטוס</th>
              <th className="px-4 py-3 text-sm font-semibold">תורים</th>
              <th className="px-4 py-3 text-sm font-semibold">הכנסות</th>
              <th className="px-4 py-3 text-sm font-semibold">תור אחרון</th>
              <th className="px-4 py-3 text-sm font-semibold">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">טוען...</td></tr>
            ) : filteredContacts.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">אין לקוחות</td></tr>
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
                  <td className="px-4 py-3 text-sm">{contact.total_appointments || 0}</td>
                  <td className="px-4 py-3 text-sm font-medium">₪{(contact.total_revenue || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {contact.last_appointment_date ? new Date(contact.last_appointment_date).toLocaleDateString('he-IL') : "-"}
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
      {selectedContact && (
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
    </div>
  );
}