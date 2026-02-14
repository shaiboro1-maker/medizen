import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, DollarSign, Star, Bell, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import moment from "moment";

export default function ClientPortal() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    init();
  }, []);

  const { data: appointments = [] } = useQuery({
    queryKey: ["clientAppointments", user?.email],
    queryFn: () => base44.entities.Appointment.filter({ client_email: user.email }, "-date"),
    enabled: !!user,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["clientOrders", user?.email],
    queryFn: () => base44.entities.Order.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["clientNotifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 20),
    enabled: !!user,
  });

  const createReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      alert("הביקורת נשלחה בהצלחה!");
      setSelectedAppointment(null);
      setRating(5);
      setReviewText("");
    },
  });

  const handleSubmitReview = () => {
    if (!selectedAppointment) return;
    createReviewMutation.mutate({
      therapist_id: selectedAppointment.therapist_id,
      client_email: user.email,
      client_name: user.full_name,
      rating,
      review_text: reviewText,
      is_approved: false,
    });
  };

  const totalSpent = [...appointments, ...orders].reduce((sum, item) => sum + (item.price || item.total || 0), 0);
  const upcomingAppointments = appointments.filter(a => 
    moment(a.date).isAfter(moment()) && a.status !== 'cancelled'
  );
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const unreadNotifications = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#7C9885]">שלום, {user?.full_name}</h1>
        <p className="text-[#A8947D]">האזור האישי שלך</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="text-blue-600" size={20}/>
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
            <p className="text-2xl font-bold">{completedAppointments.length}</p>
            <p className="text-sm text-gray-500">טיפולים שהושלמו</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="text-purple-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">₪{totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-500">סה״כ הוצאות</p>
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

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>תורים קרובים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map(apt => (
                <div key={apt.id} className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{apt.service_name}</h3>
                    <p className="text-sm text-gray-600">עם {apt.therapist_name}</p>
                    <p className="text-sm text-gray-500">
                      {moment(apt.date).format('DD/MM/YYYY')} בשעה {apt.time}
                    </p>
                  </div>
                  <Badge className="bg-blue-600">
                    {moment(apt.date).fromNow()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>התראות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-3 rounded-lg ${notif.is_read ? 'bg-gray-50' : 'bg-yellow-50'}`}
                >
                  <h4 className="font-medium text-sm">{notif.title}</h4>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {moment(notif.created_date).format('DD/MM/YYYY HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appointment History */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>היסטוריית תורים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-center py-8 text-gray-400">אין תורים</p>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="bg-white border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{apt.service_name}</h3>
                      <p className="text-sm text-gray-600">מטפל: {apt.therapist_name}</p>
                      <p className="text-sm text-gray-500">
                        {moment(apt.date).format('DD/MM/YYYY')} בשעה {apt.time}
                      </p>
                    </div>
                    <Badge className={
                      apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {apt.status === 'completed' && 'הושלם'}
                      {apt.status === 'confirmed' && 'מאושר'}
                      {apt.status === 'cancelled' && 'בוטל'}
                      {apt.status === 'pending' && 'ממתין'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-[#7C9885]">₪{apt.price}</span>
                    {apt.status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <Star size={14} className="ml-1"/> כתוב ביקורת
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>היסטוריית תשלומים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...appointments.filter(a => a.payment_status === 'paid'), ...orders].length === 0 ? (
              <p className="text-center py-8 text-gray-400">אין היסטוריית תשלומים</p>
            ) : (
              <>
                {appointments.filter(a => a.payment_status === 'paid').map(apt => (
                  <div key={apt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{apt.service_name}</p>
                      <p className="text-sm text-gray-500">{moment(apt.date).format('DD/MM/YYYY')}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#7C9885]">₪{apt.price}</p>
                      <Badge className="bg-green-100 text-green-800 text-xs">שולם</Badge>
                    </div>
                  </div>
                ))}
                {orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">הזמנה #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{moment(order.created_date).format('DD/MM/YYYY')}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#7C9885]">₪{order.total}</p>
                      <Badge className={
                        order.payment_status === 'paid' ? 
                        'bg-green-100 text-green-800 text-xs' : 
                        'bg-yellow-100 text-yellow-800 text-xs'
                      }>
                        {order.payment_status === 'paid' ? 'שולם' : 'ממתין'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>כתוב ביקורת על הטיפול</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">דירוג:</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      size={32} 
                      className={num <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">הביקורת שלך:</p>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="ספר לנו על החוויה שלך..."
                rows={4}
              />
            </div>
            <Button 
              onClick={handleSubmitReview} 
              className="w-full bg-[#B8A393] hover:bg-[#C5B5A4]"
              disabled={!reviewText}
            >
              שלח ביקורת
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}