import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { publicApi } from "../services/api";

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getTestimonials({ limit: 3 })
      .then((data) => {
        if (isMounted) {
          setTestimonials(Array.isArray(data) ? data : data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && testimonials.length === 0) return null;

  return (
    <section className="py-24 px-[5%] lg:px-[9%] bg-[#080f1e]">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-2">
          Client <span className="text-[#f5a623]">Testimonials</span>
        </h2>
        <p className="text-base sm:text-lg text-slate-400">
          Feedback from clients and project stakeholders
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-8 rounded-3xl bg-[#0b1528] border border-white/5 animate-pulse h-48"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#0b1528] border border-white/5 relative flex flex-col justify-between"
            >
              <Quote
                size={36}
                className="text-[#f5a623]/20 absolute top-6 right-6"
              />
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#f5a623]">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#f5a623]" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed">
                  "{item.testimonial || item.content}"
                </p>
              </div>

              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="w-11 h-11 rounded-full bg-[#f5a623]/10 text-[#f5a623] flex items-center justify-center font-bold text-lg border border-[#f5a623]/30 shrink-0">
                  {(item.name || "C")[0]}
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">
                    {item.name}
                  </h4>
                  <p className="text-slate-400 text-xs">
                    {item.designation || "Client"}{" "}
                    {item.company ? `• ${item.company}` : ""}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Testimonials;
