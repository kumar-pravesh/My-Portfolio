import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Linkedin, ArrowUpRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

const Navbar = ({ activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { settings } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "Projects", to: "/projects" },
    { name: "Digital Assets", to: "/assets" },
    { name: "Contact", to: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full px-[5%] lg:px-[9%] py-4 z-50 transition-all duration-300 ${isSticky ? "glass border-b border-white/5 shadow-2xl bg-[#0b1528]/90 backdrop-blur-md" : "bg-[#122240]"}`}
    >
      <div className="flex items-center justify-between relative w-full h-full">
        {/* LEFT: Logo */}
        <div className="flex-1 md:flex-none flex items-center z-50">
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-extrabold text-[#ccd6f6] tracking-wider cursor-pointer flex items-center gap-1"
          >
            {settings.site_logo_text || "Portfolio"}
            <span className="text-[#f5a623]">.</span>
          </Link>
        </div>

        {/* MOBILE: Menu Icon */}
        <div
          className="md:hidden cursor-pointer text-[#ccd6f6] z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        {/* CENTER: Unique Floating Nav Pill (Desktop) & Dropdown (Mobile) */}
        <nav
          className={`md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:flex md:items-center p-1.5 md:rounded-full md:bg-white/[0.03] md:border md:border-white/10 md:backdrop-blur-md md:shadow-2xl transition-all z-40 ${
            isOpen
              ? "flex flex-col absolute top-full mt-4 left-0 w-full p-6 bg-[#0b1528]/95 border border-white/10 rounded-2xl shadow-2xl space-y-2"
              : "hidden md:flex gap-1 lg:gap-2"
          }`}
        >
          {navLinks.map((link) => {
            const activeClasses =
              "bg-[#f5a623] text-[#0b1528] shadow-md shadow-[#f5a623]/20 font-bold scale-[1.02]";
            const inactiveClasses =
              "text-slate-300 hover:text-white hover:bg-white/5 font-medium";

            if (link.isHash) {
              return (
                <a
                  key={link.name}
                  href={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`px-5 py-2 rounded-full text-[13px] tracking-wide transition-all duration-300 text-center ${
                    location.pathname === "/" && activeSection === "assets"
                      ? activeClasses
                      : inactiveClasses
                  }`}
                >
                  {link.name}
                </a>
              );
            }

            return (
              <NavLink
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full text-[13px] tracking-wide transition-all duration-300 text-center ${
                    isActive ? activeClasses : inactiveClasses
                  }`
                }
                end={link.to === "/"}
              >
                {link.name}
              </NavLink>
            );
          })}

          {/* Mobile Only CTA */}
          <div className="md:hidden pt-4 mt-2 border-t border-white/10 flex justify-center">
            <a
              href={
                settings.linkedin_url ||
                "https://www.linkedin.com/in/pravesh-kumar-38b1422a7"
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group w-full relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-b from-[#0077b5] to-[#005582] text-white text-sm font-bold shadow-[0_4px_20px_rgba(0,119,181,0.4)] border border-[#0077b5]/50 overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              <Linkedin
                size={16}
                className="text-white drop-shadow-md z-10 relative"
              />
              <span className="z-10 tracking-wide drop-shadow-md relative">
                LinkedIn
              </span>
              <ArrowUpRight
                size={14}
                className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 transition-all z-10 relative"
              />
            </a>
          </div>
        </nav>

        {/* RIGHT: Desktop CTA */}
        <div className="hidden md:flex items-center justify-end flex-1 md:flex-none z-50">
          <a
            href={
              settings.linkedin_url ||
              "https://www.linkedin.com/in/pravesh-kumar-38b1422a7"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-b from-[#0077b5] to-[#005582] text-white text-[13px] font-bold shadow-[0_4px_20px_rgba(0,119,181,0.4)] hover:shadow-[0_6px_25px_rgba(0,119,181,0.6)] border border-[#0077b5]/50 overflow-hidden hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />

            <Linkedin
              size={15}
              className="text-white drop-shadow-md z-10 relative"
            />
            <span className="z-10 tracking-wide drop-shadow-md relative">
              LinkedIn
            </span>
            <ArrowUpRight
              size={14}
              className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 transition-all z-10 relative"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
