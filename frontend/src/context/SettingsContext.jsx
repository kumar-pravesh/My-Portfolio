import React, { createContext, useContext, useState, useEffect } from "react";
import { publicApi } from "../services/api";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    site_logo_text: "Portfolio",
    owner_name: "Pravesh Kumar",
    hero_greeting: "Hello, It's Me",
    hero_professional_title: "Software Engineer · Full-Stack Developer",
    hero_tagline:
      "Architecting scalable applications, intelligent systems & digital experiences.",
    company_name: "Portfolio",
    company_email: "praveshkumar5502@gmail.com",
    company_phone: "+91 9128521727",
    company_address: "Banka, Bihar, India",
    seo_title: "Pravesh Kumar — Java Full Stack Developer Portfolio",
    seo_description:
      "Portfolio of Pravesh Kumar, Java Full Stack Developer specializing in Spring Boot, React, and Enterprise Architecture.",
    hero_badge: "Available for Senior Full Stack & Lead Roles",
    hero_title: "Building Enterprise Digital Experiences That Matter",
    hero_highlight: "Java Full Stack Developer",
    hero_subtitle:
      "Architecting scalable web applications, enterprise microservices, modern UIs, and robust cloud solutions.",
    hero_typed_words: [
      "Java Full Stack Developer",
      "Spring Boot & Microservices Specialist",
      "React JS Frontend Architect",
      "Enterprise REST API Developer",
      "Cloud Systems Integrator",
    ],
    resume_url: "/resume.pdf",
    hero_cta_primary: "Download CV",
    hero_cta_secondary: "Explore Projects",
    about_heading: "Associate IT Engineer & Full Stack Architect",
    about_text:
      "Dedicated software engineer with expertise in Java 21, Spring Boot microservices, React 19, Neon PostgreSQL, and clean architecture.",
    github_url: "https://github.com/kumar-pravesh",
    linkedin_url: "https://www.linkedin.com/in/pravesh-kumar-38b1422a7",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getSettings()
      .then((data) => {
        if (isMounted && data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => {
        console.warn("Using default settings fallback:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
