import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { publicApi } from "../services/api";
import ArticleCard from "./ArticleCard";
import SectionHeader from "./SectionHeader";

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getBlogs({ limit: 3 })
      .then((data) => {
        if (isMounted) {
          setBlogs(Array.isArray(data) ? data : data.data || []);
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

  if (!loading && blogs.length === 0) return null;

  return (
    <section className="py-14 sm:py-16 px-[5%] lg:px-[9%] max-w-full bg-[#0b1528]">
      <SectionHeader
        badge="Technical Publications"
        title="Latest"
        highlight="Articles"
        subtitle="Insights on Java 21, Spring Boot microservices, React, and system architecture"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-[#0b1528] border border-white/5 animate-pulse h-96"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((blog, idx) => (
            <motion.div
              key={blog.reference_id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex"
            >
              <ArticleCard blog={blog} index={idx} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="text-center mt-8 sm:mt-10">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-[#f5a623] hover:text-[#f5a623] transition-all"
        >
          Explore All Articles <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
};

export default BlogSection;
