"use client";

import { useTranslation } from "react-i18next";
import { Mail, Phone, ShieldCheck, Lock, Eye, Cookie } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: ShieldCheck,
      title: t("privacy.collect"),
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>{t("privacy.collectDesc1")}</li>
          <li>{t("privacy.collectDesc2")}</li>
          <li>IP Address & Browser Information</li>
        </ul>
      )
    },
    {
      icon: Eye,
      title: t("privacy.usage"),
      content: (
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>{t("privacy.usage1")}</li>
            <li>{t("privacy.usage2")}</li>
            <li>{t("privacy.usage3")}</li>
          </ul>
          <p className="text-xs text-text-secondary italic border-l-2 border-brand-primary/20 pl-4 py-1">
            {t("privacy.monetization")}
          </p>
        </div>
      )
    },
    {
      icon: Lock,
      title: t("privacy.protection"),
      content: <p>{t("privacy.protectionDesc")}</p>
    },
    {
      icon: ShieldCheck,
      title: t("privacy.sharing"),
      content: <p>{t("privacy.sharingDesc")}</p>
    },
    {
      icon: Cookie,
      title: t("privacy.cookies"),
      content: <p>{t("privacy.cookiesDesc")}</p>
    },
    {
      icon: User,
      title: t("privacy.responsibility"),
      content: <p>{t("privacy.responsibilityDesc")}</p>
    }
  ];

  return (
    <div className="min-h-screen bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-text-main mb-4 tracking-tight">
            {t("privacy.title")}
          </h1>
          <div className="h-1 w-20 bg-brand-primary mx-auto rounded-full mb-8 opacity-20" />
          <p className="text-lg text-text-secondary leading-relaxed">
            {t("privacy.intro")}
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 rounded-xl bg-brand-primary/[0.04] text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                  <section.icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-text-main tracking-tight">
                  {section.title}
                </h2>
              </div>
              <div className="text-text-secondary leading-relaxed pl-14 text-[15px]">
                {section.content}
              </div>
              {idx < sections.length - 1 && (
                <div className="h-px w-full bg-ui-border mt-12 opacity-50" />
              )}
            </motion.section>
          ))}
        </div>

        {/* Contact Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 p-8 rounded-[24px] bg-gray-50 border border-ui-border text-center"
        >
          <h3 className="text-lg font-bold text-text-main mb-6">
            {t("privacy.contact")}
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="mailto:landmarket@gmail.com" className="flex items-center gap-2.5 text-text-secondary hover:text-brand-primary font-bold transition-colors">
              <Mail className="w-4 h-4" />
              landmarket@gmail.com
            </a>
            <a href="tel:+917094055969" className="flex items-center gap-2.5 text-text-secondary hover:text-brand-primary font-bold transition-colors">
              <Phone className="w-4 h-4" />
              +91 7094055969
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Simple internal icon for responsibility since User wasn't in original list
function User({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
