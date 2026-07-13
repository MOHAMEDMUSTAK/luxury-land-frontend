"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, MessageCircle, Heart, Trash2, Shield, Eye, Tag, Home, Star, Megaphone, HelpCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '@/lib/useIntersectionObserver';

const iconMap = {
  chat: MessageCircle,
  inquiry: HelpCircle,
  property_approved: CheckCircle2,
  property_status: Home,
  view_milestone: Eye,
  price_change: Tag,
  new_match: Star,
  promotion: Megaphone,
  offer: Tag,
  account: Shield,
  system: Bell,
};

export default function NotificationsPage() {
  const { 
    notifications, 
    filter, 
    setFilter, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearHistory,
    isLoading,
    hasMore,
    page
  } = useNotificationStore();
  
  const { t } = useTranslation();
  const router = useRouter();

  // Infinite scroll loader
  const [loadMoreRef, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

  useEffect(() => {
    // Initial fetch on mount
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const fetchMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1);
    }
  }, [isLoading, hasMore, page, fetchNotifications]);

  useEffect(() => {
    if (isIntersecting) {
      fetchMore();
    }
  }, [isIntersecting, fetchMore]);

  const handleNotificationClick = (id: string, link: string, isRead: boolean) => {
    if (!isRead) markAsRead(id);
    if (link) router.push(link);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 lg:pt-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">Notifications</h1>
            <p className="text-[var(--text-secondary)] mt-1 font-medium">Stay updated with your latest alerts and messages.</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === 'all' 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--ui-border)]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === 'unread' 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--ui-border)]'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-end gap-4 mb-4">
            <button 
              onClick={() => markAllAsRead()}
              className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-widest"
            >
              Mark All as Read
            </button>
            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all notification history?")) {
                  clearHistory();
                }
              }}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
            >
              Clear History
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 && !isLoading ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-[var(--surface)] border border-[var(--ui-border)] rounded-3xl shadow-sm"
              >
                <div className="w-20 h-20 bg-[var(--ui-surface)] rounded-full flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">You're all caught up!</h3>
                <p className="text-[var(--text-secondary)] max-w-sm">
                  {filter === 'unread' 
                    ? "You don't have any unread notifications right now." 
                    : "When you get notifications, they'll show up here."}
                </p>
              </motion.div>
            ) : (
              notifications.map((notif, index) => {
                const IconComponent = iconMap[notif.type as keyof typeof iconMap] || Bell;
                
                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className={`notification-card group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex gap-4 cursor-pointer overflow-hidden ${
                      notif.isRead 
                        ? 'bg-[var(--surface)] border-[var(--ui-border)] hover:border-[var(--ui-border-hover)] opacity-80' 
                        : 'bg-[var(--surface-elevated)] border-brand-primary/20 shadow-lg shadow-brand-primary/5 notification-unread'
                    }`}
                    onClick={(e) => {
                      // Prevent navigation if clicking action buttons
                      if ((e.target as HTMLElement).closest('.notif-actions')) return;
                      handleNotificationClick(notif._id, notif.link, notif.isRead);
                    }}
                  >
                    {/* Unread indicator line */}
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                      notif.priority === 'urgent' ? 'bg-red-50 text-red-500' :
                      notif.priority === 'high' ? 'bg-orange-50 text-orange-500' :
                      notif.type === 'chat' ? 'bg-blue-50 text-blue-500' :
                      notif.type === 'property_approved' ? 'bg-green-50 text-green-500' :
                      'bg-[var(--ui-surface)] text-brand-primary'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${!notif.isRead ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-base truncate ${notif.isRead ? 'font-semibold text-[var(--text-main)]' : 'font-bold text-[var(--text-main)]'}`}>
                          {notif.title}
                        </h4>
                      </div>
                      <p className={`text-sm leading-relaxed mb-2 ${notif.isRead ? 'text-[var(--text-secondary)]' : 'text-[var(--text-main)] font-medium'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Hover Actions */}
                    <div className="notif-actions absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif._id);
                          }}
                          className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--ui-border)] flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-colors shadow-sm"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        className="w-8 h-8 rounded-full bg-[var(--surface-elevated)] border border-[var(--ui-border)] flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Infinite Scroll Anchor */}
          <div ref={loadMoreRef} className="h-4" />
        </div>
      </div>
    </div>
  );
}
