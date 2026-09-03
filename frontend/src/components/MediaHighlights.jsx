import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  FileText,
  Image as ImageIcon,
  Film,
  Smartphone,
  ExternalLink,
  Eye,
  X,
  Sparkles,
  Layers,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import { publicApi } from "../services/api";
import SectionHeader from "./SectionHeader";

const MediaHighlights = () => {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [activeMediaModal, setActiveMediaModal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    publicApi
      .getMedia({ featured: "true" })
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data.data || [];
          setMediaList(list);
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

  // Keyboard shortcut (Escape) to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveMediaModal(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!loading && mediaList.length === 0) return null;

  const filteredMedia = (
    activeTab === "all"
      ? mediaList
      : mediaList.filter((m) => {
          if (activeTab === "video")
            return (
              m.media_type === "video" || m.media_type === "presentation_video"
            );
          return m.media_type === activeTab;
        })
  ).slice(0, 6);

  return (
    <section
      id="assets"
      className="py-12 sm:py-14 px-[5%] lg:px-[9%] max-w-full relative"
    >
      <SectionHeader
        badge="Digital Assets"
        title="Media"
        highlight="Showcase"
        subtitle="Architecture diagrams, system demos, tech clips, and technical documents"
      />

      {/* Filter Tabs */}
      <div className="flex justify-center mb-8 -mt-2">
        <div className="p-1 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/10 inline-flex flex-wrap items-center justify-center gap-1">
          {[
            { id: "all", label: "All Media" },
            { id: "image", label: "Image" },
            { id: "video", label: "Video" },
            { id: "short_video", label: "Shorts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-[#f5a623] text-[#0b1528] shadow-md shadow-[#f5a623]/20 scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl bg-[#0b1528] border border-white/5 animate-pulse h-56"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredMedia.map((item, idx) => {
            const isReel = item.media_type === "short_video";
            const isVideo =
              item.media_type === "video" ||
              item.media_type === "presentation_video";

            return (
              <motion.div
                key={item.reference_id || idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group rounded-2xl bg-[#0b1528] border border-white/5 overflow-hidden hover:border-[#f5a623]/40 transition-all flex flex-col"
              >
                <div
                  className="relative overflow-hidden bg-black cursor-pointer aspect-video"
                  onClick={() => setActiveMediaModal(item)}
                >
                  {isVideo || isReel ? (
                    item.external_url ? (
                      <iframe
                        src={item.external_url.replace("watch?v=", "embed/")}
                        title={item.title}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <video
                        src={item.file_url}
                        poster={item.thumbnail_url}
                        preload="metadata"
                        className={`w-full h-full pointer-events-none ${isReel ? "object-contain" : "object-cover"}`}
                      />
                    )
                  ) : (
                    <img
                      src={item.file_url || item.thumbnail_url}
                      alt={item.alt_text || item.title}
                      className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${isReel ? "object-contain" : "object-cover"}`}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300/122240/f5a623?text=Asset";
                      }}
                    />
                  )}

                  {/* Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[#f5a623] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-[#f5a623]/30">
                    {isReel ? (
                      <Smartphone size={12} />
                    ) : isVideo ? (
                      <Film size={12} />
                    ) : (
                      <ImageIcon size={12} />
                    )}
                    {item.media_type}
                  </div>

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-2 rounded-xl bg-[#f5a623] text-[#0b1528] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                      <Eye size={14} /> Quick Preview
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white font-bold text-sm leading-snug line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Row (No Download Symbol, Opens In-Page Modal) */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[10px] text-slate-400">
                      {item.reference_id}
                    </span>
                    <button
                      onClick={() => setActiveMediaModal(item)}
                      className="text-[#f5a623] hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-xs py-1 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10"
                    >
                      <Eye size={12} /> View File
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Ultra-Premium In-Page Lightbox Modal ── */}
      <AnimatePresence>
        {activeMediaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMediaModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#0b1528] border border-white/20 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header Bar */}
              <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#0e192d]/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] font-mono text-xs font-bold">
                    {activeMediaModal.reference_id}
                  </span>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} className="text-[#f5a623]" />{" "}
                    {activeMediaModal.media_type} Showcase
                  </span>
                </div>

                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Close Preview (Esc)"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body Content Container */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Media Preview Stage */}
                <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center min-h-[300px] max-h-[500px]">
                  {activeMediaModal.media_type === "video" ||
                  activeMediaModal.media_type === "short_video" ||
                  activeMediaModal.media_type === "presentation_video" ? (
                    activeMediaModal.external_url ? (
                      <iframe
                        src={activeMediaModal.external_url.replace(
                          "watch?v=",
                          "embed/",
                        )}
                        title={activeMediaModal.title}
                        className="w-full aspect-video rounded-xl"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={activeMediaModal.file_url}
                        poster={activeMediaModal.thumbnail_url}
                        controls
                        autoPlay
                        className="w-full max-h-[480px] object-contain rounded-xl"
                      />
                    )
                  ) : activeMediaModal.media_type === "pdf" ? (
                    <iframe
                      src={activeMediaModal.file_url}
                      title={activeMediaModal.title}
                      className="w-full h-[450px] rounded-xl border border-white/10"
                    />
                  ) : (
                    <img
                      src={
                        activeMediaModal.file_url ||
                        activeMediaModal.thumbnail_url
                      }
                      alt={activeMediaModal.title}
                      className="max-w-full max-h-[480px] object-contain rounded-xl shadow-xl"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/800x600/122240/f5a623?text=Asset+Preview";
                      }}
                    />
                  )}
                </div>

                {/* Metadata & Narrative Description */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {activeMediaModal.title}
                  </h3>
                  {activeMediaModal.description && (
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {activeMediaModal.description}
                    </p>
                  )}
                  <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      <CheckCircle2 size={12} /> Verified Asset Record
                    </span>
                    {activeMediaModal.file_url && (
                      <a
                        href={activeMediaModal.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f5a623] hover:underline flex items-center gap-1 font-semibold text-xs"
                      >
                        Open Raw Asset in New Window <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default MediaHighlights;
