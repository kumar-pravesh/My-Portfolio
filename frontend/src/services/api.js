const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "API Error" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${endpoint}]:`, err.message);
    throw err;
  }
}

// ── Public API Services ──────────────────────────────────────────
export const publicApi = {
  // Settings (hero title, company info, bio, etc.)
  getSettings: () => request("/settings/public"),

  // Projects
  getProjects: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/projects/public${q ? `?${q}` : ""}`);
  },
  getProjectBySlug: (slug) => request(`/projects/public/${slug}`),
  getCurrentWork: () => request("/projects/public/current-work"),

  // Services
  getServices: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/content/services/public${q ? `?${q}` : ""}`);
  },
  getServiceBySlug: (slug) => request(`/content/services/public/${slug}`),

  // Case Studies
  getCaseStudies: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/content/case_studies/public${q ? `?${q}` : ""}`);
  },
  getCaseStudyBySlug: (slug) => request(`/content/case_studies/public/${slug}`),

  // Blog Posts
  getBlogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/content/blog_posts/public${q ? `?${q}` : ""}`);
  },
  getBlogBySlug: (slug) => request(`/content/blog_posts/public/${slug}`),

  // Testimonials
  getTestimonials: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/content/testimonials/public${q ? `?${q}` : ""}`);
  },

  // Media Library
  getMedia: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/media/public${q ? `?${q}` : ""}`);
  },

  // Contact Submission
  submitContact: (data) =>
    request("/contact/public", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
