import React from "react";
import { Link } from "react-router-dom";
import {
  Code,
  Server,
  Cloud,
  Database,
  CheckCircle2,
  ArrowRight,
  Layers,
} from "lucide-react";

const getServiceIconComponent = (iconName = "", name = "") => {
  const i = (iconName || name).toLowerCase();
  if (
    i.includes("server") ||
    i.includes("microservice") ||
    i.includes("architecture")
  ) {
    return (
      <Server
        size={22}
        className="text-[#f5a623] group-hover:text-[#0b1528] transition-colors"
      />
    );
  }
  if (
    i.includes("cloud") ||
    i.includes("devops") ||
    i.includes("infrastructure")
  ) {
    return (
      <Cloud
        size={22}
        className="text-[#f5a623] group-hover:text-[#0b1528] transition-colors"
      />
    );
  }
  if (
    i.includes("database") ||
    i.includes("sql") ||
    i.includes("tuning") ||
    i.includes("api")
  ) {
    return (
      <Database
        size={22}
        className="text-[#f5a623] group-hover:text-[#0b1528] transition-colors"
      />
    );
  }
  if (i.includes("web") || i.includes("full-stack") || i.includes("code")) {
    return (
      <Code
        size={22}
        className="text-[#f5a623] group-hover:text-[#0b1528] transition-colors"
      />
    );
  }
  return (
    <Layers
      size={22}
      className="text-[#f5a623] group-hover:text-[#0b1528] transition-colors"
    />
  );
};

const ServiceCard = ({ service, index = 0 }) => {
  const refId = service.reference_id || `SERV-00${index + 1}`;
  const slugOrId = service.slug || service.reference_id;

  // Features list normalization
  const featureList = Array.isArray(service.features)
    ? service.features
    : typeof service.features === "string"
      ? service.features.startsWith("[")
        ? (() => {
            try {
              return JSON.parse(service.features);
            } catch {
              return service.features.split(",");
            }
          })()
        : service.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
      : [];

  // Technologies list normalization
  const techList = Array.isArray(service.technologies)
    ? service.technologies
    : typeof service.technologies === "string"
      ? service.technologies.startsWith("[")
        ? (() => {
            try {
              return JSON.parse(service.technologies);
            } catch {
              return service.technologies.split(",");
            }
          })()
        : service.technologies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
      : [];

  return (
    <Link
      to={`/services/${slugOrId}`}
      className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0b1528] to-[#070e1c] p-5 hover:border-[#f5a623]/40 hover:shadow-[0_8px_32px_-8px_rgba(245,166,35,0.2)] transition-all duration-300 relative overflow-hidden h-full cursor-pointer"
      aria-label={`Explore service: ${service.name || service.title}`}
    >
      {/* Glow accent */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#f5a623]/10 rounded-full blur-xl group-hover:bg-[#f5a623]/20 transition-all duration-500 pointer-events-none" />

      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/25 flex items-center justify-center group-hover:scale-105 group-hover:bg-[#f5a623] transition-all duration-300">
            {getServiceIconComponent(
              service.icon,
              service.name || service.title,
            )}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/10 font-mono text-[11px] font-semibold group-hover:text-[#f5a623] transition-colors">
            {refId}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#f5a623] transition-colors leading-snug">
          {service.name || service.title}
        </h3>

        {/* Short Description */}
        <p className="text-[12px] text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {service.short_description ||
            service.full_description ||
            service.description}
        </p>

        {/* Feature Bullets */}
        {featureList.length > 0 && (
          <div className="mb-4 space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            {featureList.slice(0, 2).map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-[11px] text-slate-300 font-medium"
              >
                <CheckCircle2 size={12} className="text-[#f5a623] shrink-0" />
                <span className="line-clamp-1">{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Tech Badges */}
        {techList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {techList.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/[0.03] border border-white/10 text-slate-400 group-hover:border-[#f5a623]/30 group-hover:text-white transition-colors"
              >
                {tech}
              </span>
            ))}
            {techList.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                +{techList.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA Footer */}
        <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f5a623]/80 group-hover:text-[#f5a623] transition-colors">
            Learn More
            <ArrowRight
              size={12}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
