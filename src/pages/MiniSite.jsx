import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, MapPin, Phone, Globe, Calendar, MessageCircle, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import AppDownload from "../components/AppDownload";

export default function MiniSite() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const { data: therapist, isLoading } = useQuery({
    queryKey: ["miniSiteTherapist", slug],
    queryFn: async () => {
      const therapists = await base44.entities.Therapist.filter({ unique_slug: slug });
      return therapists[0];
    },
    enabled: !!slug,
  });

  // Set document title and meta tags
  useEffect(() => {
    if (therapist) {
      const title = `${therapist.full_name} - ${therapist.specializations?.join(", ") || "מטפל מקצועי"} | MediZen`;
      const description = therapist.bio ? therapist.bio.substring(0, 160) : `${therapist.full_name} - מטפל מקצועי ב${therapist.city || "ישראל"}`;
      
      document.title = title;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }
  }, [therapist]);

  const { data: services = [] } = useQuery({
    queryKey: ["miniSiteServices", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["miniSiteCourses", therapist?.id],
    queryFn: () => base44.entities.Course.filter({ therapist_id: therapist.id, is_active: true }),
    enabled: !!therapist,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["miniSiteReviews", therapist?.id],
    queryFn: () => base44.entities.Review.filter({ therapist_id: therapist.id }, "-created_date", 10),
    enabled: !!therapist,
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ["miniSiteBlog", therapist?.id],
    queryFn: () => base44.entities.BlogPost.filter({ therapist_id: therapist.id, is_published: true }, "-created_date", 10),
    enabled: !!therapist,
  });

  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "", custom_fields: {} });
  const [selectedCategory, setSelectedCategory] = useState("");

  const openWhatsApp = () => {
    const phone = therapist.phone?.replace(/\D/g, "");
    const message = encodeURIComponent(`שלום ${therapist.full_name}, אני מעוניין לקבוע תור`);
    window.open(`https://wa.me/972${phone}?text=${message}`, "_blank");
  };

  const submitContactForm = useMutation({
    mutationFn: () => base44.entities.ContactFormSubmission.create({
      therapist_id: therapist.id,
      ...contactForm,
    }),
    onSuccess: () => {
      setContactForm({ name: "", email: "", phone: "", message: "", custom_fields: {} });
      alert("ההודעה נשלחה בהצלחה!");
    },
  });

  if (isLoading) return <div className="text-center py-20">טוען...</div>;
  if (!therapist) return <div className="text-center py-20">מטפל לא נמצא</div>;

  const settings = therapist.minisite_settings || {};
  const primaryColor = settings.primary_color || "#0F766E";
  const secondaryColor = settings.secondary_color || "#F59E0B";
  const fontFamily = settings.font_family || "Heebo";
  
  const showGallery = settings.show_gallery !== false;
  const showServices = settings.show_services !== false;
  const showCourses = settings.show_courses !== false;
  const showBlog = settings.show_blog !== false;
  const showReviews = settings.show_reviews !== false;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily }}>
      <style>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
      `}</style>
      {/* Hero Section with Cover */}
      <div className="relative h-80 overflow-hidden" style={{ background: `linear-gradient(to bottom left, ${primaryColor}, ${secondaryColor})` }}>
        {therapist.cover_image && (
          <img src={therapist.cover_image} alt="" className="w-full h-full object-cover opacity-40"/>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            {therapist.logo_url && (
              <img src={therapist.logo_url} alt="logo" className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/90 p-2"/>
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{therapist.full_name}</h1>
            <p className="text-xl text-teal-50">{therapist.specializations?.join(" · ")}</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Star size={20} className="text-amber-300 fill-amber-300"/>
              <span className="text-lg font-semibold">{therapist.rating?.toFixed(1) || "חדש"}</span>
              <span className="text-teal-100">({therapist.review_count || 0} ביקורות)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10">
        
        {/* Professional Title & Tagline - כרטיס ביקור */}
        {therapist.therapeutic_approach && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center border-4 border-teal-100">
            <p className="text-xl md:text-2xl font-semibold text-gray-800 italic">
              "{therapist.therapeutic_approach}"
            </p>
          </div>
        )}

        {/* Video Intro */}
        {therapist.video_intro_url && (
          <div className="mb-8">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <iframe src={therapist.video_intro_url} className="w-full h-full" allowFullScreen/>
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <Link to={createPageUrl(`BookAppointment?therapist=${therapist.id}`)}>
              <Button className="w-full py-6 text-lg" style={{ backgroundColor: primaryColor }}>
                <Calendar size={20} className="ml-2"/> קבע תור עכשיו
              </Button>
            </Link>
            {therapist.phone && (
              <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
                <MessageCircle size={20} className="ml-2"/> שוחח בוואטסאפ
              </Button>
            )}
          </div>
        </div>

        {/* Bio & Credentials */}
        {therapist.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-2 h-8 bg-teal-600 rounded-full"></div>
              אודות והכשרה מקצועית
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg mb-6">{therapist.bio}</p>
            
            {/* Years of Experience */}
            {therapist.years_experience && (
              <div className="bg-teal-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {therapist.years_experience}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">שנות ניסיון מקצועי</p>
                    <p className="text-sm text-gray-600">טיפול והכשרה</p>
                  </div>
                </div>
              </div>
            )}

            {/* Certifications */}
            {therapist.certifications && therapist.certifications.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">הסמכות ותעודות</h3>
                <div className="space-y-2">
                  {therapist.certifications.map((cert, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <Badge className="bg-teal-600 text-white mt-1">✓</Badge>
                      <div>
                        <p className="font-semibold">{cert.name}</p>
                        {cert.institution && <p className="text-sm text-gray-600">{cert.institution} {cert.year && `· ${cert.year}`}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties */}
            {therapist.specializations && therapist.specializations.length > 0 && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">תחומי התמחות</h3>
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.map((spec, i) => (
                    <Badge key={i} variant="outline" className="border-teal-600 text-teal-700 px-3 py-1">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
              {therapist.city && therapist.address && (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(therapist.address + ", " + therapist.city)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                >
                  <MapPin size={18}/> {therapist.address}, {therapist.city}
                </a>
              )}
              {therapist.phone && (
                <a href={`tel:${therapist.phone}`} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
                  <Phone size={18}/> {therapist.phone}
                </a>
              )}
              {therapist.website && (
                <a href={therapist.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
                  <Globe size={18}/> אתר אינטרנט
                </a>
              )}
            </div>
          </div>
        )}

        {/* Gallery */}
        {showGallery && therapist.gallery?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">גלריה</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {therapist.gallery.map((url, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all">
                  <img src={url} alt="" className="w-full h-64 object-cover"/>
                </div>
              ))}
              {therapist.video_testimonials?.map((vid, i) => (
                <div key={`vid-${i}`} className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all">
                  <video src={vid.url} className="w-full h-64 object-cover" controls/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing & Services */}
        {showServices && services.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
            מחירון וטיפולים
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map(s => (
              <div key={s.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{s.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>⏱️ {s.duration_minutes} דקות</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-3xl font-bold text-teal-600">₪{s.price}</span>
                    {s.deposit_required && (
                      <p className="text-xs text-gray-500 mt-1">דמי רצינות: ₪{s.deposit_amount}</p>
                    )}
                  </div>
                  <Link to={createPageUrl(`BookAppointment?therapist=${therapist.id}&service=${s.id}`)}>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      <Calendar size={16} className="ml-1"/> קבע תור
                    </Button>
                  </Link>
                </div>
                {s.treatment_series && s.treatment_series.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-2">📦 סדרות טיפול מיוחדות:</p>
                    {s.treatment_series.map((series, i) => (
                      <div key={i} className="flex justify-between items-center text-sm py-2 px-3 bg-amber-50 rounded-lg mb-2">
                        <span>{series.name} ({series.sessions} טיפולים)</span>
                        <span className="font-bold text-amber-700">₪{series.total_price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Cancellation Policy */}
          {therapist.cancellation_policy && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-sm mb-2">📋 מדיניות ביטולים</h3>
              <p className="text-sm text-gray-600">
                {therapist.cancellation_policy.allow_cancellation 
                  ? `ניתן לבטל תור עד ${therapist.cancellation_policy.hours_before} שעות מראש${therapist.cancellation_policy.cancellation_fee ? ` (דמי ביטול: ₪${therapist.cancellation_policy.cancellation_fee})` : " ללא חיוב"}`
                  : "אין אפשרות לבטל תור לאחר קביעה"}
              </p>
            </div>
          )}
        </div>
        )}

        {/* Courses */}
        {showCourses && courses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">קורסים דיגיטליים</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {courses.map(c => (
                <div key={c.id} className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all">
                  <div className="aspect-video">
                    <img 
                      src={c.image_url || "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop"} 
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
                    <h3 className="font-bold text-xl text-white mb-2">{c.title}</h3>
                    <p className="text-sm text-white/80 mb-3">{c.lessons?.length} שיעורים · {c.total_duration_minutes} דק׳</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-2xl">₪{c.price}</span>
                      <Button size="sm" className="bg-white/90 hover:bg-white text-[#7C9885]">רכישה</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts */}
        {showBlog && blogPosts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              <FileText size={24} className="inline ml-2"/>
              המאמרים שלי
            </h2>
            <div className="mb-6 flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={!selectedCategory ? "default" : "outline"}
                onClick={() => setSelectedCategory("")}
                className={!selectedCategory ? "bg-teal-600" : ""}
              >
                הכל ({blogPosts.length})
              </Button>
              {[...new Set(blogPosts.map(p => p.category).filter(Boolean))].map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? "bg-teal-600" : ""}
                >
                  {cat} ({blogPosts.filter(p => p.category === cat).length})
                </Button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {blogPosts
                .filter(post => !selectedCategory || post.category === selectedCategory)
                .map(post => (
                <div key={post.id} className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all">
                  <div className="aspect-video">
                    <img 
                      src={post.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop"} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5">
                    <Badge variant="secondary" className="mb-2 bg-white/90 text-[#7C9885] w-fit">{post.category || "כללי"}</Badge>
                    <h3 className="font-bold text-xl text-white mb-2">{post.title}</h3>
                    <p className="text-sm text-white/80 mb-3 line-clamp-2">{post.excerpt}</p>
                    <Button size="sm" className="bg-white/90 hover:bg-white text-[#7C9885] w-fit">קרא עוד</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {showReviews && reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">ביקורות ({reviews.length})</h2>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">
                      {r.client_name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{r.client_name || "אנונימי"}</p>
                      <div className="flex gap-0.5">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}/>
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.text && <p className="text-gray-600 text-sm">{r.text}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            <Mail size={24} className="inline ml-2"/>
            צור קשר
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">שם מלא</label>
              <Input value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} placeholder="שמך המלא"/>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">אימייל</label>
              <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="email@example.com"/>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">טלפון (אופציונלי)</label>
              <Input value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} placeholder="05X-XXXXXXX"/>
            </div>
            {therapist.contact_form_fields?.map((field) => (
              <div key={field.id}>
                <label className="text-sm font-medium mb-1 block">
                  {field.label} {field.required && <span className="text-red-600">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={contactForm.custom_fields[field.id] || ""}
                    onChange={(e) => setContactForm({...contactForm, custom_fields: {...contactForm.custom_fields, [field.id]: e.target.value}})}
                    className="h-24"
                  />
                ) : (
                  <Input
                    type={field.type}
                    value={contactForm.custom_fields[field.id] || ""}
                    onChange={(e) => setContactForm({...contactForm, custom_fields: {...contactForm.custom_fields, [field.id]: e.target.value}})}
                  />
                )}
              </div>
            ))}
            <div>
              <label className="text-sm font-medium mb-1 block">הודעה</label>
              <Textarea value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} placeholder="איך אוכל לעזור לך?" className="h-32"/>
            </div>
            <Button onClick={() => submitContactForm.mutate()} disabled={submitContactForm.isPending || !contactForm.name || !contactForm.email || !contactForm.message} className="w-full bg-teal-600 hover:bg-teal-700">
              <Mail size={16} className="ml-2"/> {submitContactForm.isPending ? "שולח..." : "שלח הודעה"}
            </Button>
          </div>
        </div>

        {/* App Download CTA */}
        <div className="mb-8">
          <AppDownload variant="compact"/>
        </div>
      </div>
    </div>
  );
}