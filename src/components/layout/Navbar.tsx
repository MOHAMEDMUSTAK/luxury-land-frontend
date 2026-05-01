"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, User, PlusCircle, Menu, X, LogOut, LayoutDashboard, Bell, CheckCircle2, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage } = useLanguageStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { notifications, unreadCount, startPolling, stopPolling, markAsRead, markAllAsRead, clearHistory } = useNotificationStore();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const router = useRouter();
  const currentLang = i18n.language || 'en';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startPolling();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isAuthenticated, startPolling, stopPolling]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    router.replace('/login');
  };

  return (
    <header 
      className="sticky top-0 sm:top-4 z-[100] mx-0 sm:mx-4 lg:mx-8 xl:mx-auto max-w-7xl sm:rounded-3xl glass-header transition-all duration-500 ease-in-out pb-3 sm:pb-6 pt-[calc(env(safe-area-inset-top,0px)+12px)] sm:pt-[calc(env(safe-area-inset-top,0px)+24px)] shadow-xl border-white/40"
    >
      <div className="px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-3 group transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/25 group-hover:scale-105 group-hover:shadow-brand-primary/40 transition-all duration-500">
            L
          </div>
          <span className="text-2xl font-black tracking-tight hidden sm:block">
            <span className="gradient-accent">Land</span><span className="text-brand-secondary">Market</span>
          </span>
        </Link>

        {/* Smart Search Bar (Desktop) */}
        {mounted && isAuthenticated && (
          <div className="hidden lg:flex flex-1 max-w-xl mx-12 relative">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-brand-primary/60 group-focus-within:text-brand-primary transition-all duration-300" />
              </div>
              <input
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                className="navbar-search-input peer block w-full pl-12 pr-4 py-3 bg-white/40 border-2 border-white/60 rounded-2xl leading-5 text-text-main placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-white focus:bg-white/70 transition-all duration-300 sm:text-sm font-bold shadow-inner"
                placeholder={mounted ? t("navbar.searchPlaceholder") : "Search..."}
              />
            </form>
          </div>
        )}

        {/* Right Nav Options */}
        <div className="hidden md:flex items-center gap-6">
          {mounted && isAuthenticated && (
            <>
              <Link href="/my-ads" className="text-text-secondary hover:text-brand-primary transition-all duration-300 flex items-center gap-2.5 font-bold text-xs uppercase tracking-widest group">
                <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform text-brand-primary" />
                <span>{mounted ? t("navbar.myAds") : "My Ads"}</span>
              </Link>
              <Link href="/wishlist" className="text-text-secondary hover:text-red-500 transition-all duration-300 flex items-center gap-2.5 font-bold text-xs uppercase tracking-widest group">
                <Heart className="h-5 w-5 group-hover:scale-110 transition-transform text-red-500" />
                <span>{mounted ? t("navbar.wishlist") : "Wishlist"}</span>
              </Link>
            </>
          )}
          
          {!mounted ? (
            <div className="w-11 h-11 animate-pulse bg-white/40 rounded-2xl" />
          ) : isAuthenticated && (
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                className="relative text-text-secondary hover:text-brand-primary transition-all flex items-center justify-center w-11 h-11 rounded-2xl hover:bg-white hover:shadow-xl border border-transparent hover:border-ui-border active:scale-95 group/notif"
              >
                <Bell className="h-5.5 w-5.5 group-hover/notif:scale-110 transition-all duration-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white px-1 shadow-lg ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-ui-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[400px] z-50"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border bg-gray-50/50">
                      <h3 className="text-sm font-bold text-text-main">{t("navbar.notifications")}</h3>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button 
                            onClick={() => markAllAsRead()}
                            className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary transition-colors tracking-wide uppercase"
                          >
                            {t("navbar.markRead")}
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button 
                            onClick={() => {
                              if (window.confirm("Clear all notification history?")) clearHistory();
                            }}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors tracking-wide uppercase"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-hide">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                          <Bell className="w-8 h-8 text-gray-200 mb-2" />
                          <p className="text-sm font-bold text-gray-400">All caught up!</p>
                          <p className="text-xs text-text-secondary mt-1">Check back later for new notifications.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                              setIsNotifOpen(false);
                              router.push(notif.link);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all flex gap-3 group ${
                              notif.isRead ? 'bg-white hover:bg-gray-50 opacity-70' : 'bg-brand-primary/[0.03] hover:bg-brand-primary/5 border border-brand-primary/10'
                            }`}
                          >
                            <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              notif.type === 'wishlist' ? 'bg-red-50 text-red-500' :
                              notif.type === 'chat' ? 'bg-blue-50 text-blue-500' :
                              'bg-green-50 text-green-500'
                            }`}>
                              {notif.type === 'wishlist' ? <Heart className="w-4 h-4 fill-current" /> :
                               notif.type === 'chat' ? <div className="font-bold text-sm">💬</div> :
                               <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm leading-tight ${notif.isRead ? 'text-text-secondary font-medium' : 'text-text-main font-bold'}`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-text-secondary mt-1 font-bold">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-1" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-ui-border text-center bg-gray-50/50">
                      <p className="text-[9px] uppercase tracking-widest text-text-secondary font-bold">Recent activity</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          {!mounted ? (
            <div className="w-32 h-10 animate-pulse bg-white/40 rounded-xl" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button 
                onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-white/60 hover:shadow-sm transition-all border border-transparent hover:border-white/40 active:scale-95 group/profile"
              >
                {user?.profileImage ? (
                  <div className="relative w-8.5 h-8.5 rounded-xl overflow-hidden shadow-sm border border-brand-primary/10 group-hover/profile:border-brand-primary/30 transition-colors">
                    <Image 
                      src={user.profileImage} 
                      alt={user.name!} 
                      width={34}
                      height={34}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm group-hover/profile:shadow-brand-primary/20 transition-all">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-bold max-w-[100px] truncate text-text-main group-hover/profile:text-brand-primary transition-colors">{user?.name}</span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white border border-ui-border rounded-2xl shadow-xl overflow-hidden py-2"
                  >
                    <div className="px-4 py-3 border-b border-ui-border">
                      <p className="text-sm font-bold text-text-main">{user?.name}</p>
                      <p className="text-xs text-text-secondary truncate">{user?.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link href={`/profile/${user?.id}`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-brand-primary transition-colors font-medium">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link href="/profile/edit" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-brand-primary transition-colors font-medium">
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </Link>
                      <Link href="/my-ads" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-brand-primary transition-colors font-medium">
                        <LayoutDashboard className="w-4 h-4" />
                        Manage My Ads
                      </Link>
                      <Link href="/wishlist" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-brand-primary transition-colors font-medium">
                        <Heart className="w-4 h-4" />
                        My Wishlist
                      </Link>
                      <Link href="/my-ads/create" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-gray-50 hover:text-brand-primary transition-colors font-medium">
                        <PlusCircle className="w-4 h-4" />
                        Post Property
                      </Link>
                    </div>
                    
                    <div className="pt-1 mt-1 border-t border-ui-border">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" className="btn-primary px-6 py-2 text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-primary/20">
              {t("navbar.login")}
            </Link>
          )}

          <div className="flex items-center bg-gray-50/80 border border-ui-border rounded-xl p-1">
            <button 
              onClick={() => handleLanguageChange('en')}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${currentLang.startsWith('en') ? 'bg-white text-brand-primary shadow-sm border border-brand-primary/10' : 'text-text-secondary hover:text-text-main'}`}
            >
              EN
            </button>
            <button 
              onClick={() => handleLanguageChange('ta')}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${currentLang.startsWith('ta') ? 'bg-white text-brand-primary shadow-sm border border-brand-primary/10' : 'text-text-secondary hover:text-text-main'}`}
            >
              TA
            </button>
          </div>
        </div>

        {/* Mobile Menu & Notifications */}
        <div className="md:hidden flex items-center gap-3">
          {mounted && isAuthenticated && (
            <div className="relative">
              <button 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); setIsMobileMenuOpen(false); }}
                className="relative text-text-main p-2 rounded-xl bg-gray-50 border border-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm active:scale-95 transition-all"
              >
                <Bell className="h-5.5 w-5.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex min-w-[16px] h-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white px-1 shadow-lg ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed inset-x-4 top-20 bg-white border border-ui-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px] z-[110]"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-ui-border bg-gray-50/50">
                      <h3 className="text-sm font-bold text-text-main">{t("navbar.notifications")}</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markAllAsRead()}
                          className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary transition-colors tracking-wide uppercase"
                        >
                          {t("navbar.markRead")}
                        </button>
                      )}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-hide">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                          <Bell className="w-8 h-8 text-gray-200 mb-2" />
                          <p className="text-sm font-bold text-gray-400">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                              setIsNotifOpen(false);
                              router.push(notif.link);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all flex gap-3 group ${
                              notif.isRead ? 'bg-white hover:bg-gray-50 opacity-70' : 'bg-brand-primary/[0.03] hover:bg-brand-primary/5 border border-brand-primary/10'
                            }`}
                          >
                            <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              notif.type === 'wishlist' ? 'bg-red-50 text-red-500' :
                              notif.type === 'chat' ? 'bg-blue-50 text-blue-500' :
                              'bg-green-50 text-green-500'
                            }`}>
                              {notif.type === 'wishlist' ? <Heart className="w-4 h-4 fill-current" /> :
                               notif.type === 'chat' ? <div className="font-bold text-sm">💬</div> :
                               <CheckCircle2 className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm leading-tight ${notif.isRead ? 'text-text-secondary font-medium' : 'text-text-main font-bold'}`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-text-secondary mt-1 font-bold">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsNotifOpen(false); }}
            className="text-text-main p-2 rounded-xl bg-gray-50 border border-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-ui-border overflow-hidden shadow-lg absolute w-full"
          >
            <div className="px-4 py-6 space-y-4">
              {mounted && isAuthenticated && (
                <div className="flex items-center gap-3 pb-4 border-b border-ui-border">
                  {user?.profileImage ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-primary/10">
                      <Image src={user.profileImage} alt={user.name!} width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-text-main font-bold text-sm">{user?.name}</p>
                    <p className="text-xs text-text-secondary">{user?.email}</p>
                  </div>
                </div>
              )}
              {mounted && isAuthenticated ? (
                <>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href={`/profile/${user?.id}`} className="flex items-center gap-3 text-text-main font-semibold py-2">
                    <User className="w-5 h-5 text-brand-primary" />
                    My Profile
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/profile/edit" className="flex items-center gap-3 text-text-main font-semibold py-2">
                    <Settings className="w-5 h-5 text-brand-primary" />
                    Account Settings
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/my-ads" className="flex items-center gap-3 text-text-main font-semibold py-2">
                    <LayoutDashboard className="w-5 h-5 text-brand-primary" />
                    My Ads
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/my-ads/create" className="flex items-center gap-3 text-text-main font-semibold py-2">
                    <PlusCircle className="w-5 h-5 text-brand-primary" />
                    Post Property
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/wishlist" className="flex items-center gap-3 text-text-main font-semibold py-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    {t("common.wishlist")}
                  </Link>
                </>
              ) : null}
              {mounted && isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 text-red-500 font-semibold py-2"
                >
                  <LogOut className="w-5 h-5" />
                  {t("common.logout")}
                </button>
              ) : (
                <Link onClick={() => setIsMobileMenuOpen(false)} href="/login" className="flex items-center gap-3 text-brand-primary font-bold py-2">
                  <User className="w-5 h-5" />
                  {t("navbar.login")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
