import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = [
  { value: 0, label: "ראשון" },
  { value: 1, label: "שני" },
  { value: 2, label: "שלישי" },
  { value: 3, label: "רביעי" },
  { value: 4, label: "חמישי" },
  { value: 5, label: "שישי" },
  { value: 6, label: "שבת" },
];

export default function TherapistAvailability() {
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [newSlot, setNewSlot] = useState({ day_of_week: 0, start_time: "09:00", end_time: "17:00", service_id: "" });
  const [newBlock, setNewBlock] = useState({ date: "", start_time: "09:00", end_time: "10:00", reason: "" });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: availability = [] } = useQuery({
    queryKey: ["therapistAvailability", therapist?.id],
    queryFn: () => base44.entities.Availability.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const { data: blockedTimes = [] } = useQuery({
    queryKey: ["blockedTimes", therapist?.id],
    queryFn: () => base44.entities.BlockedTime.filter({ therapist_id: therapist.id }, "-date"),
    enabled: !!therapist,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["therapistServices", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const createAvailabilityMutation = useMutation({
    mutationFn: (data) => base44.entities.Availability.create({ ...data, therapist_id: therapist.id, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapistAvailability"] });
      setNewSlot({ day_of_week: 0, start_time: "09:00", end_time: "17:00", service_id: "" });
    },
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id) => base44.entities.Availability.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistAvailability"] }),
  });

  const createBlockMutation = useMutation({
    mutationFn: (data) => base44.entities.BlockedTime.create({ ...data, therapist_id: therapist.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedTimes"] });
      setNewBlock({ date: "", start_time: "09:00", end_time: "10:00", reason: "" });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: (id) => base44.entities.BlockedTime.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blockedTimes"] }),
  });

  const grouped = DAYS.map(day => ({
    ...day,
    slots: availability.filter(a => a.day_of_week === day.value),
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <h1 className="text-2xl font-bold flex-1">ניהול זמינות ותורים</h1>
      </div>

      <Tabs defaultValue="regular" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="regular">זמינות קבועה</TabsTrigger>
          <TabsTrigger value="blocked">חסימת שעות</TabsTrigger>
        </TabsList>

        <TabsContent value="regular" className="space-y-6">
          {/* Add new availability */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-teal-600"/>
              הוסף זמינות חדשה
            </h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>יום</Label>
                <Select value={String(newSlot.day_of_week)} onValueChange={(v) => setNewSlot({...newSlot, day_of_week: Number(v)})}>
                  <SelectTrigger className="w-32"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d.value} value={String(d.value)}>יום {d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>שעת התחלה</Label>
                <Input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})} className="w-32"/>
              </div>
              <div className="space-y-2">
                <Label>שעת סיום</Label>
                <Input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})} className="w-32"/>
              </div>
              <div className="space-y-2">
                <Label>שירות ספציפי (אופציונלי)</Label>
                <Select value={newSlot.service_id} onValueChange={(v) => setNewSlot({...newSlot, service_id: v})}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="כל השירותים"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>כל השירותים</SelectItem>
                    {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => createAvailabilityMutation.mutate(newSlot)} className="bg-teal-600 hover:bg-teal-700">
                <Plus size={16} className="ml-2"/> הוסף
              </Button>
            </div>
          </div>

          {/* Display availability */}
          <div className="space-y-4">
            {grouped.map(day => (
              <div key={day.value} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold mb-3">יום {day.label}</h3>
                {day.slots.length === 0 ? (
                  <p className="text-sm text-gray-400">לא מוגדר</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {day.slots.map(slot => {
                      const service = services.find(s => s.id === slot.service_id);
                      return (
                        <div key={slot.id} className="flex items-center gap-2 bg-teal-50 rounded-xl px-4 py-2 border border-teal-100">
                          <span className="text-sm font-medium text-teal-700">
                            {slot.start_time} - {slot.end_time}
                          </span>
                          {service && (
                            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">
                              {service.name}
                            </span>
                          )}
                          <button onClick={() => deleteAvailabilityMutation.mutate(slot.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-6">
          {/* Add blocked time */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Clock size={20} className="text-red-600"/>
              חסום שעות ספציפיות
            </h2>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>תאריך</Label>
                <Input type="date" value={newBlock.date} onChange={(e) => setNewBlock({...newBlock, date: e.target.value})} className="w-40"/>
              </div>
              <div className="space-y-2">
                <Label>שעת התחלה</Label>
                <Input type="time" value={newBlock.start_time} onChange={(e) => setNewBlock({...newBlock, start_time: e.target.value})} className="w-32"/>
              </div>
              <div className="space-y-2">
                <Label>שעת סיום</Label>
                <Input type="time" value={newBlock.end_time} onChange={(e) => setNewBlock({...newBlock, end_time: e.target.value})} className="w-32"/>
              </div>
              <div className="space-y-2">
                <Label>סיבה (אופציונלי)</Label>
                <Input value={newBlock.reason} onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})} placeholder="פגישה אישית..." className="w-48"/>
              </div>
              <Button onClick={() => createBlockMutation.mutate(newBlock)} className="bg-red-600 hover:bg-red-700">
                <Plus size={16} className="ml-2"/> חסום
              </Button>
            </div>
          </div>

          {/* Display blocked times */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-bold mb-4">שעות חסומות</h3>
            {blockedTimes.length === 0 ? (
              <p className="text-sm text-gray-400">אין שעות חסומות</p>
            ) : (
              <div className="space-y-2">
                {blockedTimes.map(block => (
                  <div key={block.id} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 border border-red-100">
                    <div>
                      <span className="font-medium text-red-700">
                        {new Date(block.date).toLocaleDateString("he-IL")} • {block.start_time} - {block.end_time}
                      </span>
                      {block.reason && <p className="text-sm text-gray-500 mt-1">{block.reason}</p>}
                    </div>
                    <button onClick={() => deleteBlockMutation.mutate(block.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}