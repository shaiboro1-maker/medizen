import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, Clock, Phone, Globe, Calendar, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TherapistProfile() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const therapistId = urlParams.get("id");

  const { data: therapist, isLoading } = useQuery({
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

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", therapistId],
    queryFn: () => base44.entities.Review.filter({ therapist_id: therapistId }, "-created_date"),
    enabled: !!therapistId,
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton className="h-64 w-full rounded-2xl mb-6"/>
      <Skeleton className="h-8 w-48 mb-4"/>
      <Skeleton className="h-4 w-32"/>
    </div>
  );

  if (!therapist) return (
    <div className="text-center py-20">
      <p className="text-gray-500">מטפל לא נמצא</p>
    </div>
  );

  const openWhatsApp = () => {
    const phone = therapist.phone?.replace(/\D/g, "");
    const message = encodeURIComponent(`שלום, אני מעוניין לקבוע תור אצל ${therapist.full_name}`);
    window.open(`https://wa.me/972${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>

      {/* Header */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm mb-8">
        <div className="h-48 md:h-64 bg-gradient-to-bl from-teal-600 to-emerald-500 relative">
          {therapist.profile_image && (
            <img src={therapist.profile_image} alt="" className="w-full h-full object-cover opacity-30"/>
          )}
          <div className="absolute bottom-0 right-0 left-0 p-6 flex items-end gap-5">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
              {therapist.profile_image ? (
                <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full bg-teal-100 flex items-center justify-center text-4xl font-bold text-teal-700">
                  {therapist.full_name?.[0]}
                </div>
              )}
            </div>
            <div className="pb-2 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">{therapist.full_name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-300 fill-amber-300"/>
                  <span className="font-semibold">{therapist.rating?.toFixed(1) || "חדש"}</span>
                  <span className="text-teal-100 text-sm">({therapist.review_count || 0} ביקורות)</span>
                </div>
                {therapist.city && (
                  <div className="flex items-center gap-1 text-teal-100">
                    <MapPin size={14}/> {therapist.city}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {therapist.specializations?.map((s, i) => (
              <Badge key={i} variant="secondary" className="bg-teal-50 text-teal-700">{s}</Badge>
            ))}
          </div>
          {therapist.bio && <p className="text-gray-600 leading-relaxed">{therapist.bio}</p>}
          
          <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500">
            {therapist.years_experience && (
              <span className="flex items-center gap-1"><Clock size={14}/> {therapist.years_experience} שנות ניסיון</span>
            )}
            {therapist.phone && (
              <a href={`tel:${therapist.phone}`} className="flex items-center gap-1 text-teal-600"><Phone size={14}/> {therapist.phone}</a>
            )}
            {therapist.website && (
              <a href={therapist.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600"><Globe size={14}/> אתר</a>
            )}
          </div>
          
          {therapist.phone && (
            <Button onClick={openWhatsApp} className="mt-6 bg-green-600 hover:bg-green-700 w-full md:w-auto">
              <MessageCircle size={16} className="ml-2"/> שוחח בוואטסאפ
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="bg-gray-100 rounded-xl p-1">
          <TabsTrigger value="services">שירותים</TabsTrigger>
          <TabsTrigger value="reviews">ביקורות ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          {services.length === 0 ? (
            <p className="text-center text-gray-400 py-8">אין שירותים זמינים כרגע</p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{service.name}</h3>
                    {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span><Clock size={12} className="inline ml-1"/>{service.duration_minutes} דקות</span>
                    </div>
                  </div>
                  <div className="text-left flex flex-col items-end gap-2">
                    <span className="text-xl font-bold text-teal-700">₪{service.price}</span>
                    <Link to={createPageUrl(`BookAppointment?therapist=${therapistId}&service=${service.id}`)}>
                      <Button className="bg-teal-600 hover:bg-teal-700 rounded-xl">
                        <Calendar size={14} className="ml-2"/> קבע תור
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-400 py-8">אין ביקורות עדיין</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {review.client_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{review.client_name || "אנונימי"}</p>
                      <div className="flex gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}/>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.text && <p className="text-gray-600 text-sm">{review.text}</p>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}