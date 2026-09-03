import React, { useEffect } from "react";
import Contact from "../components/Contact";

const ContactPage = () => {
  useEffect(() => {
    document.title = "Contact — Pravesh Kumar Portfolio";
  }, []);

  return (
    <div className="pt-24 min-h-screen">
      <Contact />
    </div>
  );
};

export default ContactPage;
