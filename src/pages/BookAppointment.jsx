import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

const DAYS_HEB = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function BookAppointment() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const therapistId = urlParams.get("therapist");
  const serviceId = urlParams.get("service");

  const [step, setStep] = useState(serviceId ? 2 : 1);
  const [selectedService, setSelectedService] = useState(serviceId || null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [user, setUser] = useState(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: therapist } = useQuery({
    queryKey: ["therapist", therapistId],
    queryFn: () => base44.entities.Therapist.filter({ id: therapistId }),
    select: (data) => data[0],
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

  const { data: existingAppointments = [] } = useQuery({
    queryKey: ["existingAppointments", therapistId],
    queryFn: () => base44.entities.Appointment.filter({ therapist_id: therapistId, status: "confirmed" }),
    enabled: !!therapistId,
  });

  const service = services.find(s => s.id === selectedService);

  // Generate next 14 days with available slots
  const availableDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 14; i++) {
      const date = moment().add(i, "days");
      const dayOfWeek = date.day();
      const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
      if (dayAvailability.length > 0) {
        days.push({ date: date.format("YYYY-MM-DD"), dayOfWeek, label: DAYS_HEB[dayOfWeek], dateLabel: date.format("DD/MM") });
      }
    }
    return days;
  }, [availability]);

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate || !service) return [];
    const date = moment(selectedDate);
    const dayOfWeek = date.day();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
    
    const slots = [];
    dayAvailability.forEach(avail => {
      const start = moment(selectedDate + " " + avail.start_time, "YYYY-MM-DD HH:mm");
      const end = moment(selectedDate + " " + avail.end_time, "YYYY-MM-DD HH:mm");
      
      while (start.clone().add(service.duration_minutes, "minutes").isSameOrBefore(end)) {
        const timeStr = start.format("HH:mm");
        const isBooked = existingAppointments.some(
          a => a.date === selectedDate && a.time === timeStr
        );
        if (!isBooked) {
          slots.push(timeStr);
        }
        start.add(service.duration_minutes, "minutes");
      }
    });
    return slots;
  }, [selectedDate, service, availability, existingAppointments]);

  const bookMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onMutate: async (newAppointment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["existingAppointments", therapistId] });
      
      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(["existingAppointments", therapistId]);
      
      // Optimistically update
      queryClient.setQueryData(["existingAppointments", therapistId], (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          ...newAppointment,
          created_date: new Date().toISOString()
        }
      ]);
      
      return { previousAppointments };
    },
    onError: (err, newAppointment, context) => {
      // Rollback on error
      queryClient.setQueryData(["existingAppointments", therapistId], context.previousAppointments);
    },
    onSuccess: () => {
      setBookingComplete(true);
      queryClient.invalidateQueries({ queryKey: ["existingAppointments"] });
    },
  });

  const handleBook = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    bookMutation.mutate({
      therapist_id: therapistId,
      therapist_name: therapist?.full_name,
      client_email: user.email,
      client_name: user.full_name,
      service_id: selectedService,
      service_name: service?.name,
      date: selectedDate,
      time: selectedTime,
      duration_minutes: service?.duration_minutes,
      price: service?.price,
      status: "confirmed",
      notes,
    });
  };

  if (bookingComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600"/>
        </motion.div>
        <h1 className="text-2xl font-bold mb-3">התור נקבע בהצלחה!</h1>
        <p className="text-gray-500 mb-2">{service?.name} אצל {therapist?.full_name}</p>
        <p className="text-gray-500 mb-8">{moment(selectedDate).format("DD/MM/YYYY")} בשעה {selectedTime}</p>
        <Button onClick={() => window.location.href = createPageUrl("MyAppointments")} className="bg-teal-600 hover:bg-teal-700 rounded-xl">
          צפה בתורים שלי
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>
      <h1 className="text-2xl font-bold mb-2">קביעת תור</h1>
      {therapist && <p className="text-gray-500 mb-8">אצל {therapist.full_name}</p>}

      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400"
            }`}>
              {step > s ? <Check size={14}/> : s}
            </div>
            {s < 4 && <div className={`w-8 h-0.5 ${step > s ? "bg-teal-600" : "bg-gray-200"}`}/>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-bold mb-4">בחר טיפול</h2>
            <div className="space-y-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s.id); setStep(2); }}
                  className={`w-full text-right bg-white rounded-2xl border p-5 hover:border-teal-300 transition-all ${
                    selectedService === s.id ? "border-teal-500 ring-2 ring-teal-100" : "border-gray-100"
                  }`}
                >
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-400">
                    <span><Clock size={12} className="inline ml-1"/>{s.duration_minutes} דקות</span>
                    <span className="font-semibold text-teal-700">₪{s.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Date */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-bold mb-4">בחר תאריך</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableDays.map((day) => (
                <button
                  key={day.date}
                  onClick={() => { setSelectedDate(day.date); setStep(3); }}
                  className={`rounded-2xl border p-4 text-center hover:border-teal-300 transition-all ${
                    selectedDate === day.date ? "border-teal-500 bg-teal-50" : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-500">יום {day.label}</div>
                  <div className="text-lg font-bold mt-1">{day.dateLabel}</div>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep(1)} className="mt-6">
              <ArrowRight size={14} className="ml-2"/> חזרה
            </Button>
          </motion.div>
        )}

        {/* Step 3: Select Time */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-bold mb-4">בחר שעה</h2>
            {timeSlots.length === 0 ? (
              <p className="text-gray-400 text-center py-8">אין שעות פנויות ביום זה</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => { setSelectedTime(time); setStep(4); }}
                    className={`rounded-xl border p-3 text-center font-medium hover:border-teal-300 transition-all ${
                      selectedTime === time ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-100 bg-white"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
            <Button variant="ghost" onClick={() => setStep(2)} className="mt-6">
              <ArrowRight size={14} className="ml-2"/> חזרה
            </Button>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-bold mb-4">אישור תור</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">טיפול</span>
                <span className="font-medium">{service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">תאריך</span>
                <span className="font-medium">{moment(selectedDate).format("DD/MM/YYYY")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">שעה</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">משך</span>
                <span className="font-medium">{service?.duration_minutes} דקות</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="text-gray-500">מחיר</span>
                <span className="text-xl font-bold text-teal-700">₪{service?.price}</span>
              </div>
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות (אופציונלי)..."
              className="mb-6"
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                <ArrowRight size={14} className="ml-2"/> חזרה
              </Button>
              <Button 
                onClick={handleBook} 
                disabled={bookMutation.isPending}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {bookMutation.isPending ? "שולח..." : "אשר תור"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}