"use client";

import { useTranslation } from "react-i18next";
import { Mail, Phone, CheckCircle2, ShieldAlert, FileText, UserCheck, Scale, History } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfService() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: FileText,
      title: t("terms.acceptance"),
      content: <p>{t("terms.acceptanceDesc")}</p>
    },
    {
      icon: UserCheck,
      title: t("terms.responsibilities"),
      content: (
        <div className="space-y-4">
          <ul className="list-disc pl-5 space-y-2">
            <li>{t("terms.resp1")}</li>
            <li>{t("terms.resp2")}</li>
            <li>{t("terms.resp3")}</li>
          </ul>
        </div>
      )
    },
    {
      icon: CheckCircle2,
      title: t("terms.rules"),
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>{t("terms.rule1")}</li>
          <li>{t("terms.rule2")}</li>
        </ul>
      )
    },
    {
      icon: Scale,
      title: t("terms.platformResp"),
      content: (
        <div className="space-y-4">
          <p>{t("terms.platformRespDesc")}</p>
          <p className="text-xs text-text-secondary italic border-l-2 border-brand-primary/20 pl-4 py-1">
            {t("terms.monetization")}
          </p>
        </div>
      )
    },
    {
      icon: ShieldAlert,
      title: t("terms.usage"),
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>{t("terms.usage1")}</li>
          <li>{t("terms.usage2")}</li>
        </ul>
      )
    },
    {
      icon: History,
      title: t("terms.removal"),
      content: <p>{t("terms.removalDesc")}</p>
    },
    {
      icon: Scale,
      title: t("terms.liability"),
      content: <p>{t("terms.liabilityDesc")}</p>
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
            {t("terms.title")}
          </h1>
          <div className="h-1 w-24 bg-brand-primary mx-auto rounded-full mb-8 opacity-20" />
          <p className="text-lg text-text-secondary leading-relaxed">
            Please read these terms carefully before using the LandMarket platform.
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
                  <section.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
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
          className="mt-20 p-8 rounded-[32px] bg-gradient-to-br from-gray-50 to-white border border-ui-border text-center shadow-sm"
        >
          <h3 className="text-lg font-bold text-text-main mb-6">
            {t("terms.contact")}
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="mailto:landmarket@gmail.com" className="flex items-center gap-2.5 text-text-secondary hover:text-brand-primary font-bold transition-colors group">
              <Mail className="w-4 h-4 text-brand-primary group-hover:scale-110" />
              landmarket@gmail.com
            </a>
            <a href="tel:+917094055969" className="flex items-center gap-2.5 text-text-secondary hover:text-brand-primary font-bold transition-colors group">
              <Phone className="w-4 h-4 text-brand-primary group-hover:scale-110 " />
              +91 7094055969
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
