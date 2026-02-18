import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, X, Plus, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

export default function TherapistScheduleManager() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [blockForm, setBlockForm] = useState({ start_time: "", end_time: "", reason: "" });
  const [appointmentForm, setAppointmentForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    service_id: "",
    time: "",
    notes: ""
  });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["dailyAppointments", selectedDate, therapist?.id],
    queryFn: () => base44.entities.Appointment.filter({ 
      therapist_id: therapist.id,
      date: selectedDate 
    }),
    enabled: !!therapist,
  });

  const { data: blockedTimes = [] } = useQuery({
    queryKey: ["blockedTimes", selectedDate, therapist?.id],
    queryFn: () => base44.entities.BlockedTime.filter({ 
      therapist_id: therapist.id,
      date: selectedDate 
    }),
    enabled: !!therapist,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
  });

  const blockTimeMutation = useMutation({
    mutationFn: (data) => base44.entities.BlockedTime.create({
      ...data,
      therapist_id: therapist.id,
      date: selectedDate
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedTimes"] });
      setShowBlockDialog(false);
      setBlockForm({ start_time: "", end_time: "", reason: "" });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedTime.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blockedTimes"] }),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => {
      const service = services.find(s => s.id === data.service_id);
      return base44.entities.Appointment.create({
        therapist_id: therapist.id,
        therapist_name: therapist.full_name,
        client_name: data.client_name,
        client_email: data.client_email,
        service_id: data.service_id,
        service_name: service?.name || "",
        date: selectedDate,
        time: data.time,
        duration_minutes: service?.duration_minutes || 60,
        price: service?.price || 0,
        status: "confirmed",
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyAppointments"] });
      setShowAppointmentDialog(false);
      setAppointmentForm({
        client_name: "",
        client_email: "",
        client_phone: "",
        service_id: "",
        time: "",
        notes: ""
      });
    },
  });

  const handleBlockTime = () => {
    blockTimeMutation.mutate(blockForm);
  };

  const getTimeSlotStatus = (hour) => {
    const appointment = appointments.find(a => a.time === hour);
    const blocked = blockedTimes.find(b => {
      const blockStart = parseInt(b.start_time.split(':')[0]);
      const blockEnd = parseInt(b.end_time.split(':')[0]);
      const currentHour = parseInt(hour.split(':')[0]);
      return currentHour >= blockStart && currentHour < blockEnd;
    });

    if (appointment) return { type: 'appointment', data: appointment };
    if (blocked) return { type: 'blocked', data: blocked };
    return { type: 'free', data: null };
  };

  return (
    <div className="p-4 md:p-8 bg-[#F5F1E8] min-h-screen">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
          <ArrowRight size={20}/>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#7C9885]">קביעת תור מהירה</h1>
          <p className="text-sm text-gray-600">צפה ביומן ותאם תור חדש</p>
        </div>
        <Button onClick={() => setShowAppointmentDialog(true)} className="bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]">
          <UserPlus size={16} className="ml-2"/> תור חדש
        </Button>
        <Button onClick={() => setShowBlockDialog(true)} variant="outline">
          <Plus size={16} className="ml-2"/> חסום שעות
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20}/>
            בחר תאריך
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </CardContent>
      </Card>

      <div className="grid gap-2">
        {HOURS.map(hour => {
          const status = getTimeSlotStatus(hour);
          
          return (
            <div 
              key={hour}
              className={`p-4 rounded-lg flex items-center justify-between ${
                status.type === 'appointment' ? 'bg-blue-100 border-2 border-blue-300' :
                status.type === 'blocked' ? 'bg-red-100 border-2 border-red-300' :
                'bg-white border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock size={20} className={
                  status.type === 'appointment' ? 'text-blue-600' :
                  status.type === 'blocked' ? 'text-red-600' :
                  'text-gray-400'
                }/>
                <div>
                  <div className="font-bold">{hour}</div>
                  {status.type === 'appointment' && (
                    <div className="text-sm text-blue-700">
                      תור: {status.data.client_name} - {status.data.service_name}
                    </div>
                  )}
                  {status.type === 'blocked' && (
                    <div className="text-sm text-red-700">
                      חסום: {status.data.reason || 'ללא סיבה'}
                    </div>
                  )}
                  {status.type === 'free' && (
                    <div className="text-sm text-gray-500">פנוי</div>
                  )}
                </div>
              </div>
              
              {status.type === 'blocked' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => deleteBlockMutation.mutate(status.data.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={16}/>
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>קביעת תור חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>שם הלקוח</Label>
              <Input 
                value={appointmentForm.client_name}
                onChange={(e) => setAppointmentForm({...appointmentForm, client_name: e.target.value})}
                placeholder="שם מלא"
              />
            </div>
            
            <div className="space-y-2">
              <Label>אימייל הלקוח</Label>
              <Input 
                type="email"
                value={appointmentForm.client_email}
                onChange={(e) => setAppointmentForm({...appointmentForm, client_email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input 
                value={appointmentForm.client_phone}
                onChange={(e) => setAppointmentForm({...appointmentForm, client_phone: e.target.value})}
                placeholder="050-1234567"
              />
            </div>
            
            <div className="space-y-2">
              <Label>סוג שירות</Label>
              <Select 
                value={appointmentForm.service_id} 
                onValueChange={(v) => setAppointmentForm({...appointmentForm, service_id: v})}
              >
                <SelectTrigger><SelectValue placeholder="בחר שירות"/></SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - ₪{s.price} ({s.duration_minutes} דק')
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>שעה</Label>
              <Select 
                value={appointmentForm.time} 
                onValueChange={(v) => setAppointmentForm({...appointmentForm, time: v})}
              >
                <SelectTrigger><SelectValue placeholder="בחר שעה"/></SelectTrigger>
                <SelectContent>
                  {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>הערות (אופציונלי)</Label>
              <Textarea 
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                placeholder="הערות נוספות"
                rows={2}
              />
            </div>
            
            <Button 
              onClick={() => createAppointmentMutation.mutate(appointmentForm)}
              disabled={!appointmentForm.client_name || !appointmentForm.client_email || !appointmentForm.service_id || !appointmentForm.time || createAppointmentMutation.isPending}
              className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]"
            >
              {createAppointmentMutation.isPending ? "מזמין..." : "אשר תור"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>חסימת שעות</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>שעת התחלה</Label>
              <select 
                value={blockForm.start_time}
                onChange={(e) => setBlockForm({...blockForm, start_time: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">בחר שעה</option>
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>שעת סיום</Label>
              <select 
                value={blockForm.end_time}
                onChange={(e) => setBlockForm({...blockForm, end_time: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">בחר שעה</option>
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>סיבה (אופציונלי)</Label>
              <Textarea 
                value={blockForm.reason}
                onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                placeholder="למשל: פגישה אישית, הפסקה"
              />
            </div>
            
            <Button 
              onClick={handleBlockTime}
              disabled={!blockForm.start_time || !blockForm.end_time}
              className="w-full bg-[#7C9885] hover:bg-[#6A8573]"
            >
              חסום שעות
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}