import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { publicApi } from "../services/api";
import ServiceCard from "./ServiceCard";
import SectionHeader from "./SectionHeader";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getServices({ featured: "true", limit: 3 })
      .then((data) => {
        if (isMounted) {
          setServices(Array.isArray(data) ? data : data.data || []);
        }
      })
      .catch((err) => {
        if (isMounted) setError("Unable to load services at this time.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && (error || services.length === 0)) return null;

  return (
    <section
      className="py-14 sm:py-16 px-[5%] lg:px-[9%] max-w-full bg-[#060c18] border-y border-white/[0.06]"
      id="services"
    >
      <SectionHeader
        badge="Enterprise Services"
        title="Featured"
        highlight="Services"
        subtitle="Solutions designed to help enterprise businesses grow and scale"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-8 rounded-3xl bg-[#0b1528] border border-white/5 animate-pulse h-96"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, index) => (
              <motion.div
                key={service.reference_id || service.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex"
              >
                <ServiceCard service={service} index={index} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-[#f5a623] hover:text-[#f5a623] transition-all"
            >
              Explore All Services <ArrowRight size={15} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default Services;
