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
import AdminBulletin from './pages/AdminBulletin';
import AdminContent from './pages/AdminContent';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminProducts from './pages/AdminProducts';
import AdminTherapists from './pages/AdminTherapists';
import AdminWebinars from './pages/AdminWebinars';
import BookAppointment from './pages/BookAppointment';
import BulletinBoard from './pages/BulletinBoard';
import Exercises from './pages/Exercises';
import Landing from './pages/Landing';
import MyAccount from './pages/MyAccount';
import MyAppointments from './pages/MyAppointments';
import MyFavorites from './pages/MyFavorites';
import MyOrders from './pages/MyOrders';
import Podcasts from './pages/Podcasts';
import Recipes from './pages/Recipes';
import Shop from './pages/Shop';
import TherapistAppointments from './pages/TherapistAppointments';
import TherapistAvailability from './pages/TherapistAvailability';
import TherapistBulletin from './pages/TherapistBulletin';
import TherapistClients from './pages/TherapistClients';
import TherapistContent from './pages/TherapistContent';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistPodcasts from './pages/TherapistPodcasts';
import TherapistProducts from './pages/TherapistProducts';
import TherapistProfile from './pages/TherapistProfile';
import TherapistRegister from './pages/TherapistRegister';
import TherapistSearch from './pages/TherapistSearch';
import TherapistServices from './pages/TherapistServices';
import TherapistWebinars from './pages/TherapistWebinars';
import Webinars from './pages/Webinars';
import TherapistCourses from './pages/TherapistCourses';
import TherapistChat from './pages/TherapistChat';
import TherapistCampaigns from './pages/TherapistCampaigns';
import TherapistMiniSite from './pages/TherapistMiniSite';
import MiniSite from './pages/MiniSite';
import MyChat from './pages/MyChat';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminBulletin": AdminBulletin,
    "AdminContent": AdminContent,
    "AdminDashboard": AdminDashboard,
    "AdminOrders": AdminOrders,
    "AdminProducts": AdminProducts,
    "AdminTherapists": AdminTherapists,
    "AdminWebinars": AdminWebinars,
    "BookAppointment": BookAppointment,
    "BulletinBoard": BulletinBoard,
    "Exercises": Exercises,
    "Landing": Landing,
    "MyAccount": MyAccount,
    "MyAppointments": MyAppointments,
    "MyFavorites": MyFavorites,
    "MyOrders": MyOrders,
    "Podcasts": Podcasts,
    "Recipes": Recipes,
    "Shop": Shop,
    "TherapistAppointments": TherapistAppointments,
    "TherapistAvailability": TherapistAvailability,
    "TherapistBulletin": TherapistBulletin,
    "TherapistClients": TherapistClients,
    "TherapistContent": TherapistContent,
    "TherapistDashboard": TherapistDashboard,
    "TherapistPodcasts": TherapistPodcasts,
    "TherapistProducts": TherapistProducts,
    "TherapistProfile": TherapistProfile,
    "TherapistRegister": TherapistRegister,
    "TherapistSearch": TherapistSearch,
    "TherapistServices": TherapistServices,
    "TherapistWebinars": TherapistWebinars,
    "Webinars": Webinars,
    "TherapistCourses": TherapistCourses,
    "TherapistChat": TherapistChat,
    "TherapistCampaigns": TherapistCampaigns,
    "TherapistMiniSite": TherapistMiniSite,
    "MiniSite": MiniSite,
    "MyChat": MyChat,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};