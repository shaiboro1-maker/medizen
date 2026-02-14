import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import moment from "moment";
import 'moment/locale/he';

moment.locale('he');

export default function MyAppointments() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["myAppointments", user?.email],
    queryFn: () => base44.entities.Appointment.filter({ client_email: user.email }),
    enabled: !!user,
  });

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');
    
    const days = [];
    let day = startDate.clone();
    
    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }
    
    return days;
  }, [currentDate]);

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    return appointments.filter(apt => 
      moment(apt.date).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
    );
  }, [selectedDate, appointments]);

  // Check if a day has appointments
  const hasAppointments = (day) => {
    return appointments.some(apt => 
      moment(apt.date).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.clone().subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.clone().add(1, 'month'));
  };

  return (
    <div className="min-h-screen pb-24" style={{backgroundColor: '#F5F1E8'}}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-right mb-6">
          <h1 className="text-2xl font-bold text-[#7C9885]">📅 יומן תורים</h1>
          <p className="text-sm text-[#A8947D] mt-1">בחר תאריך לצפייה בתורים שלך</p>
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight size={24} className="text-[#7C9885]"/>
            </button>
            <h2 className="text-lg font-bold text-[#7C9885]">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft size={24} className="text-[#7C9885]"/>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-[#A8947D] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const isCurrentMonth = day.month() === currentDate.month();
              const isToday = day.isSame(moment(), 'day');
              const isSelected = selectedDate && day.isSame(selectedDate, 'day');
              const dayHasAppointments = hasAppointments(day);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day.clone())}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center relative
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-800'}
                    ${isToday ? 'bg-[#B8A393] text-white font-bold' : ''}
                    ${isSelected ? 'bg-[#7C9885] text-white' : 'hover:bg-gray-100'}
                  `}
                >
                  <span className="text-sm">{day.format('D')}</span>
                  {dayHasAppointments && !isToday && !isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#B89968]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments List */}
        {selectedDate && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="text-lg font-bold text-[#7C9885] mb-4 text-right">
              תורים ל-{selectedDate.format('D MMMM YYYY')}
            </h3>
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-8 text-[#A8947D]">
                <CalendarIcon size={48} className="mx-auto mb-2 opacity-30"/>
                <p>אין תורים ביום זה</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateAppointments.map(apt => (
                  <div key={apt.id} className="bg-[#F5F1E8] rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-right">
                        <h4 className="font-semibold text-base text-[#7C9885]">{apt.service_name}</h4>
                        <p className="text-sm text-[#A8947D]">אצל {apt.therapist_name}</p>
                      </div>
                      <Badge 
                        className={
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {apt.status === 'confirmed' ? 'מאושר' :
                         apt.status === 'pending' ? 'ממתין' :
                         apt.status === 'completed' ? 'הושלם' : 'בוטל'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-[#A8947D]">
                        <span>⏰ {apt.time}</span>
                        <span>⏱️ {apt.duration_minutes} דקות</span>
                      </div>
                      <span className="font-bold text-[#7C9885]">₪{apt.price}</span>
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-gray-500 mt-2 text-right">{apt.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Book Button */}
        <Link to={createPageUrl("TherapistSearch")}>
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-auto">
            <button 
              className="rounded-full px-6 py-3 text-white font-medium shadow-lg"
              style={{backgroundColor: '#B8A393'}}
            >
              <CalendarIcon size={20} className="inline ml-2"/>
              קבע תור חדש
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
}