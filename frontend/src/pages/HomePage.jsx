import React, { useEffect } from "react";
import Hero from "../components/Hero";
import CurrentWork from "../components/CurrentWork";
import About from "../components/About";
import Services from "../components/Services";
import Projects from "../components/Projects";
import CaseStudiesSection from "../components/CaseStudiesSection";
import BlogSection from "../components/BlogSection";
import MediaHighlights from "../components/MediaHighlights";
import Contact from "../components/Contact";
import { useSettings } from "../context/SettingsContext";

const HomePage = () => {
  const { settings } = useSettings();

  useEffect(() => {
    document.title =
      settings.seo_title || "Pravesh Kumar — Java Full Stack Developer";
  }, [settings.seo_title]);

  return (
    <main className="overflow-x-hidden">
      <Hero />
      <CurrentWork />
      <About />
      <Services />
      <Projects />
      <CaseStudiesSection />
      <BlogSection />
      <MediaHighlights />
      <Contact />
    </main>
  );
};

export default HomePage;
