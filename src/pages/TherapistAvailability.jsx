import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [therapist, setTherapist] = useState(null);
  const [newSlot, setNewSlot] = useState({ day_of_week: 0, start_time: "09:00", end_time: "17:00" });
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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Availability.create({ ...data, therapist_id: therapist.id, is_active: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistAvailability"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Availability.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistAvailability"] }),
  });

  // Group by day
  const grouped = DAYS.map(day => ({
    ...day,
    slots: availability.filter(a => a.day_of_week === day.value),
  }));

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">ניהול זמינות</h1>

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8">
        <h2 className="font-bold mb-4">הוסף משבצת זמן</h2>
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
          <Button onClick={() => createMutation.mutate(newSlot)} className="bg-teal-600 hover:bg-teal-700">
            <Plus size={16} className="ml-2"/> הוסף
          </Button>
        </div>
      </div>

      {/* Display */}
      <div className="space-y-4">
        {grouped.map(day => (
          <div key={day.value} className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold mb-3">יום {day.label}</h3>
            {day.slots.length === 0 ? (
              <p className="text-sm text-gray-400">לא מוגדר</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {day.slots.map(slot => (
                  <div key={slot.id} className="flex items-center gap-2 bg-teal-50 rounded-xl px-4 py-2">
                    <span className="text-sm font-medium text-teal-700">{slot.start_time} - {slot.end_time}</span>
                    <button onClick={() => deleteMutation.mutate(slot.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}