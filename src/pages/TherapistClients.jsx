import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Search, User, Mail, Phone, Calendar, Clock, Edit, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function TherapistClients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ client_name: "", client_email: "", notes: "" });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments", therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  // Group clients by email
  const clients = React.useMemo(() => {
    const clientMap = {};
    appointments.forEach(apt => {
      if (!clientMap[apt.client_email]) {
        clientMap[apt.client_email] = {
          email: apt.client_email,
          name: apt.client_name,
          appointments: [],
          totalSpent: 0,
          lastVisit: null
        };
      }
      clientMap[apt.client_email].appointments.push(apt);
      if (apt.status === "completed" || apt.status === "confirmed") {
        clientMap[apt.client_email].totalSpent += apt.price || 0;
      }
      const aptDate = new Date(apt.date);
      if (!clientMap[apt.client_email].lastVisit || aptDate > new Date(clientMap[apt.client_email].lastVisit)) {
        clientMap[apt.client_email].lastVisit = apt.date;
      }
    });
    return Object.values(clientMap);
  }, [appointments]);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { data: clientAppointments = [] } = useQuery({
    queryKey: ["clientAppointments", selectedClient?.email],
    queryFn: () => base44.entities.Appointment.filter({ 
      therapist_id: therapist.id,
      client_email: selectedClient.email 
    }),
    enabled: !!selectedClient && !!therapist,
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["clientAppointments"] });
      setShowEditDialog(false);
    },
  });

  const handleEditClient = () => {
    if (selectedClient) {
      setEditForm({
        client_name: selectedClient.name,
        client_email: selectedClient.email,
        notes: clientAppointments[0]?.notes || ""
      });
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = () => {
    // Update all appointments for this client
    const aptToUpdate = clientAppointments[0];
    if (aptToUpdate) {
      updateAppointmentMutation.mutate({
        id: aptToUpdate.id,
        data: {
          client_name: editForm.client_name,
          notes: editForm.notes
        }
      });
    }
  };

  return (
    <div className="p-4 md:p-8" style={{backgroundColor: '#F5F1E8', minHeight: '100vh'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
          <ArrowRight size={20}/>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#7C9885]">ניהול לקוחות</h1>
          <p className="text-sm text-gray-600">{clients.length} לקוחות רשומים</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Clients List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש לקוח..."
                className="pr-10"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
            {filteredClients.map(client => (
              <button
                key={client.email}
                onClick={() => setSelectedClient(client)}
                className={`w-full text-right bg-white rounded-xl p-4 border-2 transition-all ${
                  selectedClient?.email === client.email
                    ? 'border-[#7C9885] shadow-md'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C9885] to-[#9CB4A4] flex items-center justify-center text-white font-bold">
                    {client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{client.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{client.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{client.appointments.length} תורים</Badge>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {filteredClients.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <p className="text-gray-400">לא נמצאו לקוחות</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Details */}
        <div className="md:col-span-2">
          {selectedClient ? (
            <div className="space-y-4">
              {/* Client Info Card */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C9885] to-[#9CB4A4] flex items-center justify-center text-white font-bold text-2xl">
                      {selectedClient.name[0]}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#7C9885]">{selectedClient.name}</h2>
                      <p className="text-gray-600">{selectedClient.email}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleEditClient}>
                    <Edit size={16} className="ml-2"/> עריכה
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#7C9885]">{selectedClient.appointments.length}</p>
                    <p className="text-xs text-gray-600">תורים</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#7C9885]">₪{selectedClient.totalSpent}</p>
                    <p className="text-xs text-gray-600">סה"כ הוצאו</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-bold text-[#7C9885]">
                      {selectedClient.lastVisit ? format(new Date(selectedClient.lastVisit), 'dd/MM/yy') : '-'}
                    </p>
                    <p className="text-xs text-gray-600">ביקור אחרון</p>
                  </div>
                </div>
              </div>

              {/* Appointment History */}
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 text-[#7C9885]">היסטוריית תורים</h3>
                <div className="space-y-3">
                  {clientAppointments
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(apt => (
                      <div key={apt.id} className="flex items-start gap-3 p-4 border-2 border-gray-100 rounded-xl">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#7C9885] to-[#9CB4A4] flex flex-col items-center justify-center text-white">
                          <span className="text-xs">{format(new Date(apt.date), 'MMM')}</span>
                          <span className="text-lg font-bold">{format(new Date(apt.date), 'dd')}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-bold">{apt.service_name}</h4>
                            <Badge className={
                              apt.status === "completed" ? "bg-green-100 text-green-700" :
                              apt.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                              apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }>
                              {apt.status === "completed" ? "הושלם" :
                               apt.status === "confirmed" ? "מאושר" :
                               apt.status === "cancelled" ? "בוטל" :
                               "ממתין"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock size={14}/>
                              {apt.time}
                            </span>
                            <span className="font-bold text-[#7C9885]">₪{apt.price}</span>
                          </div>
                          {apt.notes && (
                            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">{apt.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center">
              <User size={48} className="mx-auto mb-4 text-gray-300"/>
              <p className="text-gray-400">בחר לקוח מהרשימה</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת פרטי לקוח</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>שם</Label>
              <Input value={editForm.client_name} onChange={(e) => setEditForm({...editForm, client_name: e.target.value})}/>
            </div>
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input value={editForm.client_email} disabled className="bg-gray-100"/>
            </div>
            <div className="space-y-2">
              <Label>הערות</Label>
              <Textarea value={editForm.notes} onChange={(e) => setEditForm({...editForm, notes: e.target.value})} rows={4}/>
            </div>
            <Button onClick={handleSaveEdit} className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]">
              שמור שינויים
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}