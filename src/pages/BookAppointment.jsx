import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, Calendar, Clock, User, Mail, Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const therapistId = searchParams.get('therapist_id');

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    notes: ""
  });

  const { data: therapist } = useQuery({
    queryKey: ["therapist", therapistId],
    queryFn: async () => {
      const therapists = await base44.entities.Therapist.filter({ id: therapistId });
      return therapists[0];
    },
    enabled: !!therapistId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", therapistId],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapistId, is_active: true }),
    enabled: !!therapistId,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ["availability", therapistId],
    queryFn: () => base44.entities.Availability.filter({ therapist_id: therapistId, is_active: true }),
    enabled: !!therapistId,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", therapistId, selectedDate],
    queryFn: () => base44.entities.Appointment.filter({ 
      therapist_id: therapistId,
      date: selectedDate 
    }),
    enabled: !!therapistId && !!selectedDate,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      setStep(4);
    },
  });

  const getAvailableTimes = () => {
    if (!selectedDate || !availability.length) return [];

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);

    const times = [];
    dayAvailability.forEach(slot => {
      const [startHour] = slot.start_time.split(':').map(Number);
      const [endHour] = slot.end_time.split(':').map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${String(hour).padStart(2, '0')}:00`;
        const isBooked = appointments.some(apt => apt.time === timeSlot && apt.status !== "cancelled");
        if (!isBooked) {
          times.push(timeSlot);
        }
      }
    });

    return times.sort();
  };

  const handleSubmit = () => {
    createAppointmentMutation.mutate({
      therapist_id: therapistId,
      therapist_name: therapist?.full_name,
      client_name: form.client_name,
      client_email: form.client_email,
      service_id: selectedService.id,
      service_name: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      duration_minutes: selectedService.duration_minutes,
      price: selectedService.price,
      status: "pending",
      notes: form.notes
    });
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
      <div className="bg-gradient-to-br from-[#7C9885] to-[#9CB4A4] text-white p-4 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} size="icon" className="text-white">
            <ArrowRight size={20}/>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">קביעת תור</h1>
            <p className="text-sm text-teal-100">{therapist.full_name}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className={`h-1 flex-1 rounded-full ${step >= i ? 'bg-white' : 'bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-bold mb-4 text-[#7C9885]">בחר שירות</h2>
            <div className="space-y-3">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => { setSelectedService(service); setStep(2); }}
                  className="w-full bg-white rounded-2xl p-4 border-2 border-gray-100 hover:border-[#7C9885] transition-all text-right"
                >
                  <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C9885] font-bold text-lg">₪{service.price}</span>
                    <span className="text-sm text-gray-500">{service.duration_minutes} דקות</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-lg font-bold mb-3 text-[#7C9885]">בחר תאריך ושעה</h2>
            
            <div className="bg-white rounded-xl p-4 mb-3">
              <Label className="mb-2 block text-sm">תאריך</Label>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {selectedDate && (
              <div className="bg-white rounded-xl p-4 mb-20">
                <Label className="mb-2 block text-sm">שעה פנויה</Label>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableTimes().map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg border-2 font-medium transition-all text-sm ${
                        selectedTime === time
                          ? 'border-[#7C9885] bg-[#7C9885] text-white'
                          : 'border-gray-200 hover:border-[#7C9885]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {getAvailableTimes().length === 0 && (
                  <p className="text-center text-gray-500 py-4 text-sm">אין שעות פנויות בתאריך זה</p>
                )}
              </div>
            )}

            {selectedTime && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
                <Button 
                  onClick={() => setStep(3)}
                  className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4] py-4"
                >
                  המשך לפרטים אישיים
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Personal Details */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-xl font-bold mb-4 text-[#7C9885]">פרטים אישיים</h2>
            
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div className="space-y-2">
                <Label>שם מלא</Label>
                <Input
                  value={form.client_name}
                  onChange={(e) => setForm({...form, client_name: e.target.value})}
                  placeholder="שם מלא"
                />
              </div>

              <div className="space-y-2">
                <Label>אימייל</Label>
                <Input
                  type="email"
                  value={form.client_email}
                  onChange={(e) => setForm({...form, client_email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input
                  value={form.client_phone}
                  onChange={(e) => setForm({...form, client_phone: e.target.value})}
                  placeholder="050-1234567"
                />
              </div>

              <div className="space-y-2">
                <Label>הערות (אופציונלי)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="הערות נוספות"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!form.client_name || !form.client_email || createAppointmentMutation.isPending}
                className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4] py-6"
              >
                {createAppointmentMutation.isPending ? "מזמין..." : "אשר תור"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600"/>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#7C9885]">התור נקבע בהצלחה!</h2>
            <p className="text-gray-600 mb-6">פרטי התור נשלחו אליך במייל</p>
            
            <div className="bg-white rounded-2xl p-5 text-right mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">שירות:</span>
                  <span className="font-bold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">תאריך:</span>
                  <span className="font-bold">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">שעה:</span>
                  <span className="font-bold">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">מחיר:</span>
                  <span className="font-bold text-[#7C9885]">₪{selectedService?.price}</span>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate(-1)} className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]">
              חזרה
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}