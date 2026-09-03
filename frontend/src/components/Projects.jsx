import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { publicApi } from "../services/api";
import ProjectCard from "./ProjectCard";
import SectionHeader from "./SectionHeader";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getProjects({ featured: "true", limit: 3 })
      .then((data) => {
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : data.data || []);
        }
      })
      .catch(() => {
        if (isMounted) setError("Unable to fetch projects at this time.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && (error || projects.length === 0)) return null;

  return (
    <section
      className="py-14 sm:py-16 px-[5%] lg:px-[9%] max-w-full bg-[#0b1528]"
      id="projects"
    >
      <SectionHeader
        badge="Production Systems"
        title="Featured"
        highlight="Projects"
        subtitle="Explore enterprise web applications and production deployments"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#0b1528] rounded-2xl border border-white/5 animate-pulse h-80 flex flex-col"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 3).map((project, index) => (
              <motion.div
                key={project.reference_id || project.id || index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex"
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-white/5 border border-white/15 text-white text-sm font-semibold hover:border-[#f5a623] hover:text-[#f5a623] transition-all"
            >
              View All Projects <FolderKanban size={16} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
};

export default Projects;
