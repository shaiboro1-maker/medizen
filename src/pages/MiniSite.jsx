import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "../utils";
import { 
  Phone, Mail, MapPin, Globe, Facebook, Instagram, Clock, 
  Calendar, Star, Share2, MessageCircle, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function MiniSite() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const slug = searchParams.get('slug');

  const { data: therapist, isLoading } = useQuery({
    queryKey: ["minisite", slug],
    queryFn: async () => {
      const therapists = await base44.entities.Therapist.filter({ unique_slug: slug });
      return therapists[0];
    },
    enabled: !!slug,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
  });

  const { data: availability = [] } = useQuery({
    queryKey: ["availability", therapist?.id],
    queryFn: () => base44.entities.Availability.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
  });

  const { data: therapistContent = [] } = useQuery({
    queryKey: ["therapistContent", therapist?.id],
    queryFn: async () => {
      const allContent = await base44.entities.UserContent.filter({ user_email: therapist.user_email, status: "approved" });
      return allContent;
    },
    enabled: !!therapist,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#F5F1E8'}}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7C9885] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#F5F1E8'}}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">מטפל לא נמצא</p>
          <Button onClick={() => navigate(createPageUrl("Landing"))}>חזרה לדף הבית</Button>
        </div>
      </div>
    );
  }

  const settings = therapist.minisite_settings || {};
  const primaryColor = settings.primary_color || "#7C9885";
  const fontFamily = settings.font_family || "Heebo";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: therapist.full_name,
        text: `בוא לבקר במיני-סייט של ${therapist.full_name}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("הקישור הועתק ללוח! 📋");
    }
  };

  const handleWhatsApp = () => {
    const phone = therapist.social_links?.whatsapp || therapist.phone;
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F5F1E8', fontFamily}}>
      {/* Cover Image */}
      <div className="relative h-64 overflow-hidden">
        {therapist.cover_image ? (
          <>
            <img src={therapist.cover_image} alt="Cover" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-400"/>
        )}
        
        {/* Logo in top right corner */}
        {therapist.logo_url && (
          <div className="absolute top-4 right-4">
            <div className="bg-white/95 rounded-xl p-2 shadow-lg">
              <img src={therapist.logo_url} alt="לוגו" className="w-16 h-16 object-contain"/>
            </div>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="relative px-4 pb-6" style={{marginTop: '-4rem'}}>
        <div className="flex items-end gap-4 mb-4">
          {therapist.profile_image && (
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden" style={{backgroundColor: primaryColor}}>
              <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{color: primaryColor}}>{therapist.full_name}</h1>
            {therapist.specializations?.[0] && (
              <p className="text-gray-600">{therapist.specializations[0]}</p>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 size={20}/>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button 
            onClick={() => navigate(createPageUrl(`BookAppointment?therapist_id=${therapist.id}`))}
            className="text-white font-bold py-6"
            style={{backgroundColor: primaryColor}}
          >
            <Calendar size={20} className="ml-2"/>
            קביעת תור
          </Button>
          <Button 
            onClick={handleWhatsApp}
            variant="outline"
            className="font-bold py-6"
          >
            <MessageCircle size={20} className="ml-2"/>
            שלח הודעה
          </Button>
        </div>



        {/* About */}
        {therapist.bio && (
          <div className="bg-white rounded-2xl p-5 mb-4">
            <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>אודות</h2>
            <p className="text-gray-700 whitespace-pre-line">{therapist.bio}</p>
          </div>
        )}

        {/* Therapeutic Approach */}
        {therapist.therapeutic_approach && (
          <div className="bg-white rounded-2xl p-5 mb-4">
            <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>הגישה הטיפולית</h2>
            <p className="text-gray-700 whitespace-pre-line">{therapist.therapeutic_approach}</p>
          </div>
        )}

        {/* Services */}
        {settings.show_services !== false && services.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4">
            <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>שירותים</h2>
            <div className="space-y-3">
              {services.map(service => (
                <div key={service.id} className="p-4 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{service.name}</h3>
                    <span className="font-bold" style={{color: primaryColor}}>₪{service.price}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14}/>
                      {service.duration_minutes} דקות
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Working Hours */}
        {availability.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4">
            <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>שעות פעילות</h2>
            <div className="space-y-2">
              {DAYS.map((day, index) => {
                const dayAvail = availability.filter(a => a.day_of_week === index);
                return (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium">{day}</span>
                    <div className="text-sm text-gray-600">
                      {dayAvail.length === 0 ? (
                        <span className="text-red-500">סגור</span>
                      ) : (
                        dayAvail.map((a, i) => (
                          <span key={i} className="ml-2">{a.start_time} - {a.end_time}</span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Gallery */}
        {settings.show_gallery !== false && therapist.gallery?.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4">
            <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>גלריה</h2>
            <div className="grid grid-cols-3 gap-2">
              {therapist.gallery.map((img, i) => (
                <img key={i} src={img} alt={`Gallery ${i + 1}`} className="w-full aspect-square object-cover rounded-lg"/>
              ))}
            </div>
          </div>
        )}

        {/* Therapist Content */}
        {therapistContent.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4">
            <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>תכנים מומלצים</h2>
            <div className="space-y-3">
              {therapistContent.map(content => (
                <div key={content.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-3">
                    {content.image_url && (
                      <img src={content.image_url} alt={content.title} className="w-20 h-20 object-cover rounded-lg"/>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{content.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{content.description || content.content}</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100" style={{color: primaryColor}}>
                        {content.content_type === "exercise" && "💪 תרגיל"}
                        {content.content_type === "recipe" && "🥗 מתכון"}
                        {content.content_type === "inspiration" && "✨ השראה"}
                        {content.content_type === "story" && "📖 סיפור"}
                        {content.content_type === "joke" && "😂 בדיחה"}
                        {content.content_type === "tip" && "⭐ טיפ"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-5 mb-4">
          <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>יצירת קשר</h2>
          <div className="space-y-3">
            {therapist.phone && (
              <a href={`tel:${therapist.phone}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <Phone size={20} style={{color: primaryColor}}/>
                <span>{therapist.phone}</span>
              </a>
            )}
            {therapist.user_email && (
              <a href={`mailto:${therapist.user_email}`} className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                <Mail size={20} style={{color: primaryColor}}/>
                <span>{therapist.user_email}</span>
              </a>
            )}
            {therapist.address && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={20} style={{color: primaryColor}}/>
                <span>{therapist.address}, {therapist.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Social Links */}
        {therapist.social_links && (
          <div className="bg-white rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-3" style={{color: primaryColor}}>מצא אותי ברשתות</h2>
            <div className="flex gap-3 flex-wrap">
              {therapist.website && (
                <a href={therapist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Globe size={18}/>
                  <span className="text-sm">אתר</span>
                </a>
              )}
              {therapist.social_links.facebook && (
                <a href={therapist.social_links.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
                  <Facebook size={18}/>
                  <span className="text-sm">Facebook</span>
                </a>
              )}
              {therapist.social_links.instagram && (
                <a href={therapist.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200">
                  <Instagram size={18}/>
                  <span className="text-sm">Instagram</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-50">
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(createPageUrl(`BookAppointment?therapist_id=${therapist.id}`))}
            className="flex-1 text-white font-bold py-6 text-lg"
            style={{backgroundColor: primaryColor}}
          >
            קבע תור עכשיו
            <ChevronLeft size={20} className="mr-2"/>
          </Button>
          <Button 
            onClick={handleShare}
            variant="outline"
            size="icon"
            className="py-6 px-4"
          >
            <Share2 size={20}/>
          </Button>
        </div>
      </div>
      
      {/* Spacer for fixed bottom */}
      <div className="h-24"></div>
    </div>
  );
}