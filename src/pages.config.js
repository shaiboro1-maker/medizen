/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Accessibility from './pages/Accessibility';
import AdminBulletin from './pages/AdminBulletin';
import AdminContent from './pages/AdminContent';
import AdminDashboard from './pages/AdminDashboard';
import AdminNotifications from './pages/AdminNotifications';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminTherapists from './pages/AdminTherapists';
import AdminUserContent from './pages/AdminUserContent';
import AdminWebinars from './pages/AdminWebinars';
import BookAppointment from './pages/BookAppointment';
import BulletinBoard from './pages/BulletinBoard';
import Diary from './pages/Diary';
import Exercises from './pages/Exercises';
import Landing from './pages/Landing';
import MiniSite from './pages/MiniSite';
import Music from './pages/Music';
import MyAccount from './pages/MyAccount';
import MyAppointments from './pages/MyAppointments';
import MyChat from './pages/MyChat';
import MyFavorites from './pages/MyFavorites';
import MyOrders from './pages/MyOrders';
import Podcasts from './pages/Podcasts';
import Recipes from './pages/Recipes';
import Shop from './pages/Shop';
import SubmitContent from './pages/SubmitContent';
import Support from './pages/Support';
import TherapistAppointments from './pages/TherapistAppointments';
import TherapistAvailability from './pages/TherapistAvailability';
import TherapistBulletin from './pages/TherapistBulletin';
import TherapistCampaigns from './pages/TherapistCampaigns';
import TherapistChat from './pages/TherapistChat';
import TherapistClients from './pages/TherapistClients';
import TherapistContent from './pages/TherapistContent';
import TherapistCoupons from './pages/TherapistCoupons';
import TherapistCourses from './pages/TherapistCourses';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistIntegrations from './pages/TherapistIntegrations';
import TherapistMiniSite from './pages/TherapistMiniSite';
import TherapistMiniSiteSettings from './pages/TherapistMiniSiteSettings';
import TherapistNewsletter from './pages/TherapistNewsletter';
import TherapistPodcasts from './pages/TherapistPodcasts';
import TherapistPricing from './pages/TherapistPricing';
import TherapistProducts from './pages/TherapistProducts';
import TherapistProfile from './pages/TherapistProfile';
import TherapistRegister from './pages/TherapistRegister';
import TherapistReminders from './pages/TherapistReminders';
import TherapistSearch from './pages/TherapistSearch';
import TherapistServices from './pages/TherapistServices';
import TherapistTeam from './pages/TherapistTeam';
import TherapistWebinars from './pages/TherapistWebinars';
import Webinars from './pages/Webinars';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Accessibility": Accessibility,
    "AdminBulletin": AdminBulletin,
    "AdminContent": AdminContent,
    "AdminDashboard": AdminDashboard,
    "AdminNotifications": AdminNotifications,
    "AdminOrders": AdminOrders,
    "AdminProducts": AdminProducts,
    "AdminTherapists": AdminTherapists,
    "AdminUserContent": AdminUserContent,
    "AdminWebinars": AdminWebinars,
    "BookAppointment": BookAppointment,
    "BulletinBoard": BulletinBoard,
    "Diary": Diary,
    "Exercises": Exercises,
    "Landing": Landing,
    "MiniSite": MiniSite,
    "Music": Music,
    "MyAccount": MyAccount,
    "MyAppointments": MyAppointments,
    "MyChat": MyChat,
    "MyFavorites": MyFavorites,
    "MyOrders": MyOrders,
    "Podcasts": Podcasts,
    "Recipes": Recipes,
    "Shop": Shop,
    "SubmitContent": SubmitContent,
    "Support": Support,
    "TherapistAppointments": TherapistAppointments,
    "TherapistAvailability": TherapistAvailability,
    "TherapistBulletin": TherapistBulletin,
    "TherapistCampaigns": TherapistCampaigns,
    "TherapistChat": TherapistChat,
    "TherapistClients": TherapistClients,
    "TherapistContent": TherapistContent,
    "TherapistCoupons": TherapistCoupons,
    "TherapistCourses": TherapistCourses,
    "TherapistDashboard": TherapistDashboard,
    "TherapistIntegrations": TherapistIntegrations,
    "TherapistMiniSite": TherapistMiniSite,
    "TherapistMiniSiteSettings": TherapistMiniSiteSettings,
    "TherapistNewsletter": TherapistNewsletter,
    "TherapistPodcasts": TherapistPodcasts,
    "TherapistPricing": TherapistPricing,
    "TherapistProducts": TherapistProducts,
    "TherapistProfile": TherapistProfile,
    "TherapistRegister": TherapistRegister,
    "TherapistReminders": TherapistReminders,
    "TherapistSearch": TherapistSearch,
    "TherapistServices": TherapistServices,
    "TherapistTeam": TherapistTeam,
    "TherapistWebinars": TherapistWebinars,
    "Webinars": Webinars,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};