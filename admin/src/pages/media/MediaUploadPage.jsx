import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Upload,
  ArrowLeft,
  Image as ImageIcon,
  Video,
  FileText,
  Film,
  Play,
  Globe,
  Lock,
  ShieldAlert,
  Check,
  X,
  Copy,
  RefreshCw,
  Link as LinkIcon,
  Tag,
  Folder,
  ExternalLink,
  Trash2,
  Eye,
  Star,
} from "lucide-react";
import { api } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { RefBadge, StatusBadge } from "../../components/shared/index.jsx";

const MEDIA_TYPES = [
  { value: "image", label: "Image (Screenshot / Design / Diagram)" },
  { value: "video", label: "Standard Video (16:9 Demo / Walkthrough)" },
  { value: "short_video", label: "Short Video / Reel (9:16 Vertical)" },
  { value: "presentation_video", label: "Presentation Video" },
  { value: "document", label: "Document (PPT / Word / Text)" },
  { value: "pdf", label: "PDF Document" },
  { value: "external_video", label: "External Video URL (YouTube / Vimeo)" },
  { value: "external_image", label: "External Image URL" },
];

const CATEGORIES = [
  "General",
  "Project",
  "Case Study",
  "Presentation",
  "Demo",
  "Reel",
  "Learning & Development",
  "UI/UX",
  "Architecture",
  "Technology",
  "Marketing",
];

export default function MediaUploadPage() {
  const { refId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(refId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "image",
    category: "General",
    tags: [],
    tagInput: "",
    alt_text: "",
    caption: "",
    external_url: "",
    status: "draft",
    visibility: "public",
    is_featured: false,
    display_order: 0,
    related_project: "",
    related_case_study: "",
    related_blog: "",
    related_service: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [existingAsset, setExistingAsset] = useState(null);
  const videoRef = useRef(null);

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const file = new File([blob], "generated-thumbnail.jpg", {
            type: "image/jpeg",
          });
          setThumbnailFile(file);
          setThumbnailPreview(URL.createObjectURL(blob));
          toast.success("Frame selected as thumbnail!");
        },
        "image/jpeg",
        0.9,
      );
    } catch (err) {
      console.error("Frame capture failed:", err);
      toast.error("Failed to capture frame. Ensure video is fully loaded.");
    }
  };

  // Relational Dropdowns
  const [projects, setProjects] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [blogs, setBlogs] = useState([]);

  // Fetch relations
  useEffect(() => {
    api
      .get("/projects?limit=100")
      .then((r) => setProjects(r.data?.data || r.data || []))
      .catch(() => {});
    api
      .get("/content/case_studies?limit=100")
      .then((r) => setCaseStudies(r.data?.data || r.data || []))
      .catch(() => {});
    api
      .get("/content/blog_posts?limit=100")
      .then((r) => setBlogs(r.data?.data || r.data || []))
      .catch(() => {});
  }, []);

  // Fetch edit data if refId present
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api
        .get(`/media/${refId}`)
        .then((r) => {
          const item = r.data;
          setExistingAsset(item);
          setFormData({
            title: item.title || "",
            description: item.description || "",
            media_type: item.media_type || "image",
            category: item.category || "General",
            tags: item.tags || [],
            tagInput: "",
            alt_text: item.alt_text || "",
            caption: item.caption || "",
            external_url: item.external_url || "",
            status: item.status || "draft",
            visibility: item.visibility || "public",
            is_featured: Boolean(item.is_featured),
            display_order: item.display_order || 0,
            related_project: item.related_project || "",
            related_case_study: item.related_case_study || "",
            related_blog: item.related_blog || "",
            related_service: item.related_service || "",
          });
          if (item.file_url) setFilePreview(item.file_url);
          if (item.thumbnail_url) setThumbnailPreview(item.thumbnail_url);
        })
        .catch(() => toast.error("Failed to load media asset."))
        .finally(() => setLoading(false));
    }
  }, [refId, isEdit]);

  // File Change & Preview
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);

    // Auto set title if empty
    if (!formData.title) {
      const name =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setFormData((prev) => ({ ...prev, title: name }));
    }
  };

  // Add Tag
  const handleAddTag = () => {
    if (!formData.tagInput.trim()) return;
    const tag = formData.tagInput.trim();
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: "",
      }));
    }
  };

  const handleRemoveTag = (tagToRem) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRem),
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim())
      return toast.error("Please enter a title for the asset.");

    setSaving(true);
    setUploadProgress(20);

    try {
      if (isEdit) {
        // Update existing record
        await api.put(`/media/${refId}`, {
          title: formData.title,
          description: formData.description,
          media_type: formData.media_type,
          category: formData.category,
          tags: formData.tags,
          alt_text: formData.alt_text,
          caption: formData.caption,
          external_url: formData.external_url,
          status: formData.status,
          visibility: formData.visibility,
          is_featured: formData.is_featured,
          display_order: parseInt(formData.display_order),
          related_project: formData.related_project || null,
          related_case_study: formData.related_case_study || null,
          related_blog: formData.related_blog || null,
          related_service: formData.related_service || null,
        });

        // Replace file if new file selected
        if (selectedFile || thumbnailFile) {
          const fileData = new FormData();
          fileData.append("media_type", formData.media_type); // Append BEFORE file
          if (selectedFile) fileData.append("file", selectedFile);
          if (thumbnailFile) fileData.append("thumbnail", thumbnailFile);
          await api.post(`/media/${refId}/replace`, fileData);
        }

        setUploadProgress(100);
        toast.success(`Updated media asset ${refId}`);
        navigate("/admin/media");
      } else {
        // Upload new asset
        const postBody = new FormData();
        postBody.append("title", formData.title);
        postBody.append("description", formData.description);
        postBody.append("media_type", formData.media_type); // Append BEFORE file
        postBody.append("category", formData.category);
        postBody.append("tags", JSON.stringify(formData.tags));
        postBody.append("alt_text", formData.alt_text);
        postBody.append("caption", formData.caption);
        postBody.append("external_url", formData.external_url);
        postBody.append("status", formData.status);
        postBody.append("visibility", formData.visibility);
        postBody.append("is_featured", formData.is_featured);
        postBody.append("display_order", formData.display_order);
        postBody.append("related_project", formData.related_project);
        postBody.append("related_case_study", formData.related_case_study);
        postBody.append("related_blog", formData.related_blog);
        postBody.append("related_service", formData.related_service);

        // Append files LAST so multer reads text fields first
        if (selectedFile) postBody.append("file", selectedFile);
        if (thumbnailFile) postBody.append("thumbnail", thumbnailFile);

        setUploadProgress(60);
        const r = await api.post("/media", postBody);
        setUploadProgress(100);
        toast.success(`Created media asset ${r.data.reference_id}`);
        navigate("/admin/media");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save media asset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/media")}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {isEdit ? `Edit Media Asset` : `Upload New Media Asset`}
            </h1>
            {isEdit && <RefBadge refId={refId} />}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Upload size={14} />{" "}
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Upload Asset"}
        </button>
      </div>

      {/* Progress Bar */}
      {saving && (
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/10">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - File Upload & Preview */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              File Asset & Preview
            </h2>

            {/* Media Type Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Media Type *
              </label>
              <select
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                value={formData.media_type}
                onChange={(e) =>
                  setFormData({ ...formData, media_type: e.target.value })
                }
              >
                {MEDIA_TYPES.map((t) => (
                  <option
                    key={t.value}
                    value={t.value}
                    className="bg-[#111827]"
                  >
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* External URL mode vs Upload File mode */}
            {formData.media_type.startsWith("external_") ? (
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  External Asset URL *
                </label>
                <input
                  type="url"
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  placeholder="https://youtube.com/watch?v=... or https://images.unsplash.com/..."
                  value={formData.external_url}
                  onChange={(e) =>
                    setFormData({ ...formData, external_url: e.target.value })
                  }
                />
              </div>
            ) : (
              /* Drag and Drop Zone */
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {isEdit ? "Replace File (Optional)" : "Select / Drop File *"}
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0])
                      handleFileSelect(e.dataTransfer.files[0]);
                  }}
                  className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-[#0d1322]/50 hover:bg-[#0d1322] transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                  onClick={() =>
                    document.getElementById("mediaFileInput").click()
                  }
                >
                  <Upload size={24} className="text-indigo-400" />
                  <div className="text-xs text-slate-300 font-semibold">
                    {selectedFile
                      ? selectedFile.name
                      : "Drag & drop file or click to browse"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Supports JPG, PNG, WEBP, MP4, PDF, PPTX (Max 500MB)
                  </div>
                  <input
                    id="mediaFileInput"
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />
                </div>
              </div>
            )}

            {/* Thumbnail Preview */}
            {(formData.media_type.includes("video") ||
              formData.media_type.includes("external")) && (
              <div className="mt-4 border-t border-white/5 pt-4">
                <label className="text-[11px] font-semibold text-slate-300 block mb-2">
                  Thumbnail Preview
                </label>
                {thumbnailPreview ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-dashed border-white/20 bg-[#0d1322]/50 flex flex-col items-center justify-center gap-2">
                    <ImageIcon size={24} className="text-slate-500" />
                    <span className="text-xs text-slate-400">
                      No frame selected yet
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* File Preview & Frame Selector */}
            {filePreview && (
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="text-[11px] font-semibold text-slate-400">
                  {formData.media_type.includes("video")
                    ? "Video Player & Frame Selector"
                    : "Live Preview"}
                </div>
                <div className="rounded-xl border border-white/10 overflow-hidden bg-black flex flex-col">
                  <div className="flex items-center justify-center min-h-[160px] bg-black">
                    {formData.media_type === "short_video" ? (
                      <video
                        ref={videoRef}
                        crossOrigin="anonymous"
                        src={filePreview}
                        onLoadedData={() => {
                          if (!thumbnailPreview && !isEdit) captureFrame();
                        }}
                        controls
                        className="h-64 aspect-[9/16] object-cover"
                      />
                    ) : formData.media_type.includes("video") ? (
                      <video
                        ref={videoRef}
                        crossOrigin="anonymous"
                        src={filePreview}
                        onLoadedData={() => {
                          if (!thumbnailPreview && !isEdit) captureFrame();
                        }}
                        controls
                        className="w-full h-auto max-h-[300px]"
                      />
                    ) : (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-auto object-contain max-h-[220px]"
                      />
                    )}
                  </div>

                  {/* Frame Extraction Controls */}
                  {formData.media_type.includes("video") && (
                    <div className="w-full bg-[#0d1322] p-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Play size={12} /> Pause to select frame
                      </span>
                      <button
                        type="button"
                        onClick={captureFrame}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-md"
                      >
                        <ImageIcon size={14} /> Use This Frame
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle & Right Column - Asset Metadata */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Asset Information
            </h2>

            {/* Title */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Title *
              </label>
              <input
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all font-bold"
                placeholder="e.g. Clinixa Healthcare Admin Dashboard Screenshot"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                placeholder="Brief technical or descriptive summary of the asset..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Alt Text & Caption */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Alt Text (Accessibility)
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g. Clinixa dashboard user interface"
                  value={formData.alt_text}
                  onChange={(e) =>
                    setFormData({ ...formData, alt_text: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Caption
                </label>
                <input
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  placeholder="e.g. Figure 1.2: System Architecture Diagram"
                  value={formData.caption}
                  onChange={(e) =>
                    setFormData({ ...formData, caption: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#111827]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Tags Manager */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Tags
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  className="flex-1 bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  placeholder="Type tag and press Add..."
                  value={formData.tagInput}
                  onChange={(e) =>
                    setFormData({ ...formData, tagInput: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Relational Links */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Related CMS Content
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Related Project
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={formData.related_project}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      related_project: e.target.value,
                    })
                  }
                >
                  <option value="" className="bg-[#111827]">
                    None
                  </option>
                  {projects.map((p) => (
                    <option
                      key={p.reference_id}
                      value={p.reference_id}
                      className="bg-[#111827]"
                    >
                      {p.reference_id} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Related Case Study
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={formData.related_case_study}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      related_case_study: e.target.value,
                    })
                  }
                >
                  <option value="" className="bg-[#111827]">
                    None
                  </option>
                  {caseStudies.map((cs) => (
                    <option
                      key={cs.reference_id}
                      value={cs.reference_id}
                      className="bg-[#111827]"
                    >
                      {cs.reference_id} - {cs.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Related Blog
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={formData.related_blog}
                  onChange={(e) =>
                    setFormData({ ...formData, related_blog: e.target.value })
                  }
                >
                  <option value="" className="bg-[#111827]">
                    None
                  </option>
                  {blogs.map((b) => (
                    <option
                      key={b.reference_id}
                      value={b.reference_id}
                      className="bg-[#111827]"
                    >
                      {b.reference_id} - {b.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Publishing & Visibility Settings */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Publishing & Access Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Status
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="draft" className="bg-[#111827]">
                    Draft
                  </option>
                  <option value="published" className="bg-[#111827]">
                    Published
                  </option>
                  <option value="archived" className="bg-[#111827]">
                    Archived
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Visibility
                </label>
                <select
                  className="w-full bg-[#0d1322] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all"
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.value })
                  }
                >
                  <option value="public" className="bg-[#111827]">
                    Public Website
                  </option>
                  <option value="internal" className="bg-[#111827]">
                    Internal Admin Only
                  </option>
                  <option value="private" className="bg-[#111827]">
                    Private
                  </option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-[#0d1322] border-white/20 text-indigo-600 focus:ring-0"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_featured: e.target.checked,
                      })
                    }
                  />
                  Featured Showcase Asset
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
