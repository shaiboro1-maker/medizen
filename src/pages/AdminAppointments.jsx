import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Calendar, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminAppointments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => base44.entities.Appointment.list("-created_date", 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allAppointments"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allAppointments"] }),
  });

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = !searchQuery || 
      a.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.therapist_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.service_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    pending: appointments.filter(a => a.status === "pending").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
    completed: appointments.filter(a => a.status === "completed").length,
  };

  return (
    <div className="p-6 md:p-8 bg-[#F5F1E8] min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#7C9885]">ניהול תורים</h1>
          <p className="text-sm text-gray-600">כל התורים במערכת</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-500">סה"כ תורים</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            <p className="text-sm text-gray-500">מאושר</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">ממתין</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            <p className="text-sm text-gray-500">הושלם</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-gray-500">בוטל</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20}/>
            חיפוס וסינון
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="חפש לפי לקוח, מטפל או שירות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16}/>}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="confirmed">מאושר</SelectItem>
              <SelectItem value="pending">ממתין</SelectItem>
              <SelectItem value="completed">הושלם</SelectItem>
              <SelectItem value="cancelled">בוטל</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right p-3 font-medium">תאריך</th>
                  <th className="text-right p-3 font-medium">שעה</th>
                  <th className="text-right p-3 font-medium">לקוח</th>
                  <th className="text-right p-3 font-medium">מטפל</th>
                  <th className="text-right p-3 font-medium">שירות</th>
                  <th className="text-right p-3 font-medium">מחיר</th>
                  <th className="text-right p-3 font-medium">סטטוס</th>
                  <th className="text-right p-3 font-medium">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(a => (
                  <tr key={a.id} className="border-t">
                    <td className="p-3">{new Date(a.date).toLocaleDateString('he-IL')}</td>
                    <td className="p-3">{a.time}</td>
                    <td className="p-3">{a.client_name}</td>
                    <td className="p-3">{a.therapist_name}</td>
                    <td className="p-3">{a.service_name}</td>
                    <td className="p-3">₪{a.price || 0}</td>
                    <td className="p-3">
                      <Badge className={
                        a.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        a.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm('האם למחוק תור זה?')) {
                            deleteMutation.mutate(a.id);
                          }
                        }}
                        className="text-red-600"
                      >
                        מחק
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}