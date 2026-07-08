"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        view: "View",
        save: "Save",
        cancel: "Cancel",
        loading: "Loading Premium Asset...",
        search: "Search properties",
        price: "Price",
        location: "Location",
        addLand: "Add Land",
        wishlist: "Wishlist",
        profile: "Profile",
        logout: "Sign Out"
      },
      navbar: {
        searchPlaceholder: "Search lands, cities, price...",
        myAds: "My Ads",
        wishlist: "Wishlist",
        login: "Login",
        notifications: "Notifications",
        markRead: "Mark all read"
      },
      home: {
        title: "Explore Properties",
        subtitle: "Showing {{count}} curated listings",
        filters: "Filters",
        sortBy: "Sort By",
        priceRange: "Price Range",
        sizeRange: "Size Range",
        propertyType: "Property Type",
        classification: "Classification",
        clearAll: "Clear All Filters",
        noResults: "No properties found matching your filters.",
        showAll: "Clear all filters and show all",
        updating: "Updating Inventory"
      },
      property: {
        status: "Status",
        available: "Available",
        sold: "Sold",
        details: "Property Details",
        highlights: "Property Highlights",
        whyThis: "Why This Property?",
        listedBy: "Listed by Owner",
        chat: "Chat with Owner",
        showPhone: "Show Phone Number",
        verified: "Verified Seller",
        totalSize: "Total Size",
        assetType: "Asset Type",
        landType: "Land Type",
        legalAudit: "Legal Audit Completed",
        registration: "Immediate Registration",
        primeLocation: "Prime Location Access",
        appreciation: "High Value Appreciation"
      },
      footer: {
        support: "Support & Contact",
        trusted: "Trusted Platform",
        tagline: "Trusted platform for land discovery",
        respondTime: "Usually responds within 24h"
      },
      privacy: {
        title: "Privacy Policy",
        intro: "Your privacy is important to us. This policy explains how we collect and use your information.",
        collect: "Information We Collect",
        collectDesc1: "Personal details (Name, Email, Phone)",
        collectDesc2: "Property details & Uploaded images",
        usage: "How We Use Information",
        usage1: "To provide platform services",
        usage2: "To connect buyers and sellers",
        usage3: "To improve platform experience",
        monetization: "This platform is currently free to use; however, we may introduce paid features or services in the future with prior notice to users.",
        protection: "Data Protection",
        protectionDesc: "We take appropriate measures to protect your data.",
        sharing: "Third-Party Sharing",
        sharingDesc: "We do NOT sell your data to third parties.",
        cookies: "Cookies",
        cookiesDesc: "We use cookies to enhance user experience.",
        responsibility: "User Responsibility",
        responsibilityDesc: "Users are responsible for the accuracy of the information they provide.",
        contact: "Contact Information"
      },
      terms: {
        title: "Terms of Service",
        acceptance: "Acceptance of Terms",
        acceptanceDesc: "By using this platform, you agree to these terms.",
        responsibilities: "User Responsibilities",
        resp1: "Provide accurate data",
        resp2: "No fake listings",
        resp3: "No misuse of platform features",
        rules: "Listing Rules",
        rule1: "Only valid land listings allowed",
        rule2: "No misleading information",
        platformResp: "Platform Responsibility",
        platformRespDesc: "We act as a platform and are not responsible for disputes arising from transactions.",
        monetization: "We reserve the right to introduce fees for certain features or services in the future, and users will be notified before any charges are applied.",
        usage: "Account Usage",
        usage1: "Users must protect their account credentials",
        usage2: "Unauthorized use of accounts is strictly prohibited",
        removal: "Content Removal",
        removalDesc: "We reserve the right to remove listings that violate our community policies.",
        liability: "Limitation of Liability",
        liabilityDesc: "We are not liable for any losses arising from the use of this platform.",
        contact: "Contact Information"
      }
    }
  },
  ta: {
    translation: {
      common: {
        view: "பார்",
        save: "சேமி",
        cancel: "ரத்து செய்",
        loading: "சொத்துக்களைத் தேடுகிறது...",
        search: "சொத்துகளை தேடு",
        price: "விலை",
        location: "இடம்",
        addLand: "நிலம் சேர்க்க",
        wishlist: "விருப்பப் பட்டியல்",
        profile: "சுயவிவரம்",
        logout: "வெளியேறு"
      },
      navbar: {
        searchPlaceholder: "நிலம், ஊர் அல்லது விலையைத் தேடுங்கள்...",
        myAds: "என் விளம்பரங்கள்",
        wishlist: "விருப்பப் பட்டியல்",
        login: "நுழைய",
        notifications: "அறிவிப்புகள்",
        markRead: "அனைத்தையும் படித்ததாகக் குறி"
      },
      home: {
        title: "சொத்துக்களை ஆராயுங்கள்",
        subtitle: "{{count}} சொத்துக்கள் காட்டப்படுகின்றன",
        filters: "வடிகட்டிகள்",
        sortBy: "வரிசைப்படுத்து",
        priceRange: "விலை வரம்பு",
        sizeRange: "அளவு வரம்பு",
        propertyType: "சொத்து வகை",
        classification: "நில வகைப்பாடு",
        clearAll: "அனைத்தையும் நீக்கு",
        noResults: "உங்கள் தேடலுக்கு எந்த சொத்துக்களும் கிடைக்கவில்லை.",
        showAll: "அனைத்தையும் நீக்கி அனைத்தையும் காட்டு",
        updating: "சரக்குகளைப் புதுப்பிக்கிறது"
      },
      property: {
        status: "நிலை",
        available: "கிடைக்கிறது",
        sold: "விற்கப்பட்டது",
        details: "சொத்து விவரங்கள்",
        highlights: "சிறப்பம்சங்கள்",
        whyThis: "ஏன் இந்த சொத்து?",
        listedBy: "உரிமையாளரால் பட்டியலிடப்பட்டது",
        chat: "உரிமையாளருடன் அரட்டையடிக்கவும்",
        showPhone: "தொலைபேசி எண்ணைக் காட்டு",
        verified: "சரிபார்க்கப்பட்ட விற்பனையாளர்",
        totalSize: "மொத்த அளவு",
        assetType: "சொத்து வகை",
        landType: "நில வகை",
        legalAudit: "சட்ட தணிக்கை முடிந்தது",
        registration: "உடனடி பதிவு",
        primeLocation: "முக்கிய இட அணுகல்",
        appreciation: "அதிக மதிப்பு உயர்வு"
      },
      footer: {
        support: "ஆதரவு மற்றும் தொடர்பு",
        trusted: "நம்பகமான தளம்",
        tagline: "நிலம் கண்டறிய நம்பகமான தளம்",
        respondTime: "பொதுவாக 24 மணிநேரத்திற்குள் பதிலளிக்கும்"
      },
      privacy: {
        title: "தனியுரிமைக் கொள்கை",
        intro: "உங்கள் தனியுரிமை எங்களுக்கு முக்கியமானது. உங்கள் தகவல்களை நாங்கள் எவ்வாறு சேகரிக்கிறோம் மற்றும் பயன்படுத்துகிறோம் என்பதை இந்தக் கொள்கை விளக்குகிறது.",
        collect: "நாங்கள் சேகரிக்கும் தகவல்கள்",
        collectDesc1: "தனிப்பட்ட விவரங்கள் (பெயர், மின்னஞ்சல், தொலைபேசி)",
        collectDesc2: "சொத்து விவரங்கள் மற்றும் பதிவேற்றப்பட்ட படங்கள்",
        usage: "தகவல்களை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்",
        usage1: "தள சேவைகளை வழங்க",
        usage2: "வாங்குபவர்களையும் விற்பனையாளர்களையும் இணைக்க",
        usage3: "பயனர் அனுபவத்தை மேம்படுத்த",
        monetization: "இந்த தளம் தற்போது இலவசமாகப் பயன்படுத்தப்படுகிறது; இருப்பினும், எதிர்காலத்தில் பயனர்களுக்கு முன்னறிவிப்புடன் கட்டணச் சேவைகளை நாங்கள் அறிமுகப்படுத்தலாம்.",
        protection: "தரவு பாதுகாப்பு",
        protectionDesc: "உங்கள் தரவைப் பாதுகாக்க நாங்கள் பொருத்தமான நடவடிக்கைகளை எடுக்கிறோம்.",
        sharing: "மூன்றாம் தரப்பு பகிர்வு",
        sharingDesc: "நாங்கள் உங்கள் தரவை மூன்றாம் தரப்பினருக்கு விற்க மாட்டோம்.",
        cookies: "குக்கீகள்",
        cookiesDesc: "பயனர் அனுபவத்தை மேம்படுத்த நாங்கள் குக்கீகளைப் பயன்படுத்துகிறோம்.",
        responsibility: "பயனர் பொறுப்பு",
        responsibilityDesc: "பயனர்கள் வழங்கும் தகவல்களின் துல்லியத்திற்கு அவர்களே பொறுப்பாவார்கள்.",
        contact: "தொடர்பு தகவல்"
      },
      terms: {
        title: "சேவை விதிகள்",
        acceptance: "விதிகளின் ஏற்பு",
        acceptanceDesc: "இந்தத் தளத்தைப் பயன்படுத்துவதன் மூலம், இந்த விதிகளுக்கு நீங்கள் உடன்படுகிறீர்கள்.",
        responsibilities: "பயனர் பொறுப்புகள்",
        resp1: "துல்லியமான தரவை வழங்கவும்",
        resp2: "போலி விளம்பரங்கள் கூடாது",
        resp3: "தளத்தை தவறாகப் பயன்படுத்துதல் கூடாது",
        rules: "பட்டியலிடும் விதிகள்",
        rule1: "செல்லுபடியாகும் நிலப் பட்டியல்கள் மட்டுமே அனுமதிக்கப்படும்",
        rule2: "தவறான தகவல்கள் வழங்கக் கூடாது",
        platformResp: "தளத்தின் பொறுப்பு",
        platformRespDesc: "நாங்கள் ஒரு ஊடகமாக மட்டுமே செயல்படுகிறோம், பரிவர்த்தனைகளில் ஏற்படும் தகராறுகளுக்கு நாங்கள் பொறுப்பல்ல.",
        monetization: "எதிர்காலத்தில் சில அம்சங்கள் அல்லது சேவைகளுக்கு கட்டணங்களை அறிமுகப்படுத்தும் உரிமையை நாங்கள் கொண்டுள்ளோம்.",
        usage: "கணக்கு பயன்பாடு",
        usage1: "பயனர்கள் தங்கள் கணக்கு விவரங்களைப் பாதுகாக்க வேண்டும்",
        usage2: "அனுமதியின்றி கணக்குகளைப் பயன்படுத்துவது தடைசெய்யப்பட்டுள்ளது",
        removal: "உள்ளடக்க நீக்கம்",
        removalDesc: "கொள்கைகளை மீறும் பட்டியல்களை நீக்கும் உரிமையை நாங்கள் கொண்டுள்ளோம்.",
        liability: "பொறுப்பு வரம்பு",
        liabilityDesc: "இந்தத் தளத்தைப் பயன்படுத்துவதால் ஏற்படும் எந்த இழப்புகளுக்கும் நாங்கள் பொறுப்பல்ல.",
        contact: "தொடர்பு தகவல்"
      }
    }
  }
};

i18n
  .use(initReactI18next);

if (typeof window !== 'undefined') {
  i18n.use(LanguageDetector);
}

i18n.init({
  resources,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  detection: typeof window !== 'undefined' ? {
    order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
    caches: ['localStorage']
  } : undefined,
});

export default i18n;
