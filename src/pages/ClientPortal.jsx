import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, DollarSign, Star, FileText, Bell, Clock, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";

export default function ClientPortal() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, review_text: "" });

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["myAppointments", user?.email],
    queryFn: () => base44.entities.Appointment.filter({ client_email: user.email }, "-date"),
    enabled: !!user,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["myInvoices", user?.email],
    queryFn: () => base44.entities.Invoice.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["myNotifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: myReviews = [] } = useQuery({
    queryKey: ["myReviews", user?.email],
    queryFn: () => base44.entities.Review.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const createReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });
      setShowReview(false);
      setSelectedAppointment(null);
      alert("הביקורת נשלחה בהצלחה! תודה רבה על המשוב");
    },
  });

  const markNotificationReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myNotifications"] }),
  });

  const totalSpent = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + i.total, 0);
  const upcomingAppointments = appointments.filter(a => 
    moment(a.date).isAfter(moment()) && a.status !== "cancelled"
  );
  const pastAppointments = appointments.filter(a => 
    moment(a.date).isBefore(moment()) || a.status === "completed"
  );
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  const handleSubmitReview = () => {
    if (!selectedAppointment) return;
    createReviewMutation.mutate({
      therapist_id: selectedAppointment.therapist_id,
      user_email: user.email,
      user_name: user.full_name,
      rating: reviewData.rating,
      review_text: reviewData.review_text,
      service_id: selectedAppointment.service_id,
      appointment_id: selectedAppointment.id,
      is_approved: false
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#7C9885] mb-2">שלום, {user?.full_name}</h1>
          <p className="text-[#A8947D]">ניהול התורים והתשלומים שלך</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-3">
                <Calendar className="text-teal-600" size={20}/>
              </div>
              <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
              <p className="text-sm text-gray-500">תורים קרובים</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle className="text-green-600" size={20}/>
              </div>
              <p className="text-2xl font-bold">{pastAppointments.length}</p>
              <p className="text-sm text-gray-500">טיפולים שבוצעו</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                <DollarSign className="text-purple-600" size={20}/>
              </div>
              <p className="text-2xl font-bold">₪{totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-500">סה"כ הוצאה</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                <Bell className="text-amber-600" size={20}/>
              </div>
              <p className="text-2xl font-bold">{unreadNotifications}</p>
              <p className="text-sm text-gray-500">התראות חדשות</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="mb-8">
          <TabsList className="bg-white rounded-xl p-1 border border-[#E5DDD3]">
            <TabsTrigger value="appointments">תורים</TabsTrigger>
            <TabsTrigger value="payments">תשלומים</TabsTrigger>
            <TabsTrigger value="reviews">ביקורות</TabsTrigger>
            <TabsTrigger value="notifications">
              התראות {unreadNotifications > 0 && `(${unreadNotifications})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-3 text-[#7C9885]">תורים קרובים</h3>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-center py-8 bg-white rounded-xl border border-[#E5DDD3] text-[#A8947D]">אין תורים קרובים</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map(apt => (
                      <div key={apt.id} className="bg-white rounded-xl border border-[#E5DDD3] p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-[#7C9885]">{apt.service_name}</h4>
                            <p className="text-sm text-[#A8947D]">אצל {apt.therapist_name}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                <Calendar size={12} className="ml-1"/> {moment(apt.date).format('DD/MM/YYYY')}
                              </Badge>
                              <Badge variant="outline">
                                <Clock size={12} className="ml-1"/> {apt.time}
                              </Badge>
                            </div>
                          </div>
                          <Badge className={
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {apt.status === 'confirmed' ? 'מאושר' : apt.status === 'pending' ? 'ממתין' : apt.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3 text-[#7C9885]">טיפולים קודמים</h3>
                {pastAppointments.length === 0 ? (
                  <p className="text-center py-8 bg-white rounded-xl border border-[#E5DDD3] text-[#A8947D]">אין טיפולים קודמים</p>
                ) : (
                  <div className="space-y-3">
                    {pastAppointments.slice(0, 5).map(apt => (
                      <div key={apt.id} className="bg-white rounded-xl border border-[#E5DDD3] p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-[#7C9885]">{apt.service_name}</h4>
                            <p className="text-sm text-[#A8947D]">אצל {apt.therapist_name}</p>
                            <p className="text-xs text-gray-400 mt-1">{moment(apt.date).format('DD/MM/YYYY')}</p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            {!myReviews.find(r => r.appointment_id === apt.id) && (
                              <Button size="sm" onClick={() => { setSelectedAppointment(apt); setShowReview(true); }}>
                                <Star size={14} className="ml-1"/> דרג טיפול
                              </Button>
                            )}
                            {myReviews.find(r => r.appointment_id === apt.id) && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle size={12} className="ml-1"/> דורגת
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="bg-white rounded-xl border border-[#E5DDD3]">
              <table className="w-full text-sm">
                <thead className="border-b bg-[#F5F1E8]">
                  <tr>
                    <th className="text-right p-3 font-medium text-[#7C9885]">תאריך</th>
                    <th className="text-right p-3 font-medium text-[#7C9885]">תיאור</th>
                    <th className="text-right p-3 font-medium text-[#7C9885]">סכום</th>
                    <th className="text-right p-3 font-medium text-[#7C9885]">סטטוס</th>
                    <th className="text-right p-3 font-medium text-[#7C9885]">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-[#A8947D]">אין תשלומים</td></tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.id} className="border-b">
                        <td className="p-3">{moment(inv.created_date).format('DD/MM/YYYY')}</td>
                        <td className="p-3">חשבונית {inv.invoice_number}</td>
                        <td className="p-3 font-bold">₪{inv.total}</td>
                        <td className="p-3">
                          <Badge className={
                            inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                            inv.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {inv.status === 'paid' ? 'שולם' : inv.status === 'sent' ? 'ממתין' : inv.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Button size="sm" variant="outline">
                            <FileText size={14} className="ml-1"/> הורד
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-4">
              {myReviews.length === 0 ? (
                <p className="text-center py-8 bg-white rounded-xl border border-[#E5DDD3] text-[#A8947D]">
                  עדיין לא השארת ביקורות
                </p>
              ) : (
                myReviews.map(review => (
                  <div key={review.id} className="bg-white rounded-xl border border-[#E5DDD3] p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.review_text}</p>
                    <p className="text-xs text-gray-400">{moment(review.created_date).format('DD/MM/YYYY')}</p>
                    <Badge className={review.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {review.is_approved ? "מאושר" : "ממתין לאישור"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-center py-8 bg-white rounded-xl border border-[#E5DDD3] text-[#A8947D]">
                  אין התראות
                </p>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`bg-white rounded-xl border border-[#E5DDD3] p-5 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                    onClick={() => markNotificationReadMutation.mutate(notif.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[#7C9885]">{notif.title}</h4>
                        <p className="text-sm text-[#A8947D] mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{moment(notif.created_date).fromNow()}</p>
                      </div>
                      {!notif.is_read && (
                        <Badge className="bg-blue-100 text-blue-800">חדש</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={showReview} onOpenChange={setShowReview}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>דרג את הטיפול</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAppointment && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{selectedAppointment.service_name}</p>
                  <p className="text-sm text-gray-600">אצל {selectedAppointment.therapist_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2">דירוג</p>
                <div className="flex gap-1">
                  {Array(5).fill(0).map((_, i) => (
                    <Star 
                      key={i} 
                      size={32} 
                      className={`cursor-pointer transition-colors ${i < reviewData.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      onClick={() => setReviewData({...reviewData, rating: i + 1})}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">כתוב ביקורת</p>
                <Textarea 
                  rows={4} 
                  value={reviewData.review_text} 
                  onChange={(e) => setReviewData({...reviewData, review_text: e.target.value})}
                  placeholder="ספר לנו על החוויה שלך..."
                />
              </div>
              <Button onClick={handleSubmitReview} className="w-full bg-teal-600 hover:bg-teal-700">
                <MessageCircle size={16} className="ml-2"/> שלח ביקורת
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}