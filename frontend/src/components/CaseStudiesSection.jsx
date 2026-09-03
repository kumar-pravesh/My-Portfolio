import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { publicApi } from "../services/api";
import CaseStudyCard from "./CaseStudyCard";
import SectionHeader from "./SectionHeader";

const CaseStudiesSection = () => {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getCaseStudies({ featured: "true", limit: 3 })
      .then((data) => {
        if (isMounted) {
          setCaseStudies(Array.isArray(data) ? data : data.data || []);
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

  if (!loading && caseStudies.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 px-[5%] lg:px-[9%] bg-[#060c18] border-y border-white/[0.06]">
      <SectionHeader
        badge="Proven Impact"
        title="Featured"
        highlight="Case Studies"
        subtitle="In-depth architectural breakdowns, challenges, solution designs & business impact"
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
            {caseStudies.slice(0, 3).map((cs, idx) => (
              <motion.div
                key={cs.reference_id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex"
              >
                <CaseStudyCard cs={cs} index={idx} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-[#f5a623] hover:text-[#f5a623] transition-all"
            >
              View All Case Studies <ArrowRight size={15} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default CaseStudiesSection;
