import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS_OF_WEEK = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00

export default function TherapistCalendar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // week or month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    service_id: "",
    notes: ""
  });
  const [blockForm, setBlockForm] = useState({ reason: "" });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const weekDates = getWeekDates();
  const startDate = weekDates[0].toISOString().split('T')[0];
  const endDate = weekDates[6].toISOString().split('T')[0];

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", therapist?.id, startDate, endDate],
    queryFn: async () => {
      if (!therapist) return [];
      const allAppointments = await base44.entities.Appointment.filter({ therapist_id: therapist.id });
      return allAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= weekDates[0] && aptDate <= weekDates[6];
      });
    },
    enabled: !!therapist,
  });

  const { data: blockedTimes = [] } = useQuery({
    queryKey: ["blockedTimes", therapist?.id, startDate, endDate],
    queryFn: async () => {
      if (!therapist) return [];
      const allBlocked = await base44.entities.BlockedTime.filter({ therapist_id: therapist.id });
      return allBlocked.filter(block => {
        const blockDate = new Date(block.date);
        return blockDate >= weekDates[0] && blockDate <= weekDates[6];
      });
    },
    enabled: !!therapist,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
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
        date: selectedSlot.date,
        time: `${String(selectedSlot.hour).padStart(2, '0')}:00`,
        duration_minutes: service?.duration_minutes || 60,
        price: service?.price || 0,
        status: "confirmed",
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowAppointmentDialog(false);
      setAppointmentForm({ client_name: "", client_email: "", client_phone: "", service_id: "", notes: "" });
    },
  });

  const blockTimeMutation = useMutation({
    mutationFn: (data) => base44.entities.BlockedTime.create({
      therapist_id: therapist.id,
      date: selectedSlot.date,
      start_time: `${String(selectedSlot.hour).padStart(2, '0')}:00`,
      end_time: `${String(selectedSlot.hour + 1).padStart(2, '0')}:00`,
      reason: data.reason
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedTimes"] });
      setShowBlockDialog(false);
      setBlockForm({ reason: "" });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedTime.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blockedTimes"] }),
  });

  const handleSlotClick = (date, hour) => {
    const dateStr = date.toISOString().split('T')[0];
    const existing = appointments.find(apt => apt.date === dateStr && apt.time === `${String(hour).padStart(2, '0')}:00`);
    const blocked = blockedTimes.find(b => {
      const blockStart = parseInt(b.start_time.split(':')[0]);
      return b.date === dateStr && blockStart === hour;
    });

    if (existing || blocked) return;

    setSelectedSlot({ date: dateStr, hour });
    setShowAppointmentDialog(true);
  };

  const getSlotContent = (date, hour) => {
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    
    const apt = appointments.find(a => a.date === dateStr && a.time === timeStr);
    if (apt) {
      return {
        type: 'appointment',
        data: apt,
        className: 'bg-blue-100 border-2 border-blue-400 cursor-pointer hover:bg-blue-200'
      };
    }

    const blocked = blockedTimes.find(b => {
      const blockStart = parseInt(b.start_time.split(':')[0]);
      return b.date === dateStr && blockStart === hour;
    });
    if (blocked) {
      return {
        type: 'blocked',
        data: blocked,
        className: 'bg-red-100 border-2 border-red-300 cursor-pointer'
      };
    }

    return {
      type: 'free',
      data: null,
      className: 'bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer'
    };
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#F5F1E8'}}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7C9885] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F5F1E8'}}>
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
            <ArrowRight size={20}/>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#7C9885]">יומן תורים</h1>
          </div>
          <Button onClick={goToToday} variant="outline" size="sm">
            היום
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
            <ChevronRight size={20}/>
          </Button>
          <div className="text-center">
            <p className="font-bold">
              {weekDates[0].toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })} - {weekDates[6].toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronLeft size={20}/>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          {/* Days Header */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="text-center font-bold text-sm text-gray-600 p-2">שעה</div>
            {weekDates.map((date, i) => (
              <div key={i} className="text-center p-2 bg-white rounded-lg shadow-sm">
                <div className="font-bold text-sm text-[#7C9885]">{DAYS_OF_WEEK[i]}</div>
                <div className="text-xs text-gray-600">{date.getDate()}/{date.getMonth() + 1}</div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-center font-medium text-sm text-gray-600 p-2 bg-white rounded-lg">
                {String(hour).padStart(2, '0')}:00
              </div>
              {weekDates.map((date, dayIndex) => {
                const slot = getSlotContent(date, hour);
                return (
                  <div
                    key={dayIndex}
                    onClick={() => handleSlotClick(date, hour)}
                    className={`p-2 rounded-lg transition-all min-h-[60px] ${slot.className}`}
                  >
                    {slot.type === 'appointment' && (
                      <div className="text-right">
                        <p className="text-xs font-bold text-blue-700 truncate">{slot.data.client_name}</p>
                        <p className="text-[10px] text-blue-600 truncate">{slot.data.service_name}</p>
                      </div>
                    )}
                    {slot.type === 'blocked' && (
                      <div className="relative text-right">
                        <p className="text-xs font-bold text-red-700">חסום</p>
                        <p className="text-[10px] text-red-600 truncate">{slot.data.reason || 'ללא סיבה'}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlockMutation.mutate(slot.data.id);
                          }}
                          className="absolute top-0 left-0 text-red-500 hover:text-red-700"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 left-6 flex gap-3">
        <Button
          onClick={() => {
            setSelectedSlot({ date: new Date().toISOString().split('T')[0], hour: 9 });
            setShowBlockDialog(true);
          }}
          className="rounded-full shadow-lg"
          variant="outline"
          size="icon"
        >
          <X size={20}/>
        </Button>
        <Button
          onClick={() => {
            setSelectedSlot({ date: new Date().toISOString().split('T')[0], hour: 9 });
            setShowAppointmentDialog(true);
          }}
          className="bg-gradient-to-l from-[#7C9885] to-[#9CB4A4] rounded-full shadow-lg"
          size="icon"
        >
          <Plus size={20}/>
        </Button>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>תור חדש</DialogTitle>
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
              <Label>אימייל</Label>
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
              <Label>שירות</Label>
              <Select 
                value={appointmentForm.service_id} 
                onValueChange={(v) => setAppointmentForm({...appointmentForm, service_id: v})}
              >
                <SelectTrigger><SelectValue placeholder="בחר שירות"/></SelectTrigger>
                <SelectContent>
                  {services.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - ₪{s.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>הערות</Label>
              <Textarea 
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({...appointmentForm, notes: e.target.value})}
                rows={2}
              />
            </div>
            <Button 
              onClick={() => createAppointmentMutation.mutate(appointmentForm)}
              disabled={!appointmentForm.client_name || !appointmentForm.client_email || !appointmentForm.service_id}
              className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]"
            >
              אשר תור
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Time Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>חסימת שעה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>סיבה (אופציונלי)</Label>
              <Textarea 
                value={blockForm.reason}
                onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                placeholder="למשל: פגישה אישית, הפסקה"
                rows={3}
              />
            </div>
            <Button 
              onClick={() => blockTimeMutation.mutate(blockForm)}
              className="w-full bg-[#7C9885]"
            >
              חסום שעה
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}