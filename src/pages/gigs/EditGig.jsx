import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, X, Loader2, Save } from "lucide-react";
import { getMyGigsApi, updateGigApi } from "../../api/gigApi.js";
import Loader from "../../components/common/Loader.jsx";
import toast from "react-hot-toast";
import "./GigForm.css";

const CATEGORIES = [
  { label: "Web Development",    value: "web-development"   },
  { label: "Graphic Design",     value: "graphic-design"    },
  { label: "Digital Marketing",  value: "digital-marketing" },
  { label: "Writing",            value: "writing"           },
  { label: "Video Editing",      value: "video-editing"     },
  { label: "Mobile Development", value: "mobile-development"},
  { label: "SEO",                value: "seo"               },
  { label: "Other",              value: "other"             },
];

const EditGig = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [tagInput, setTagInput]     = useState("");
  const [newImages, setNewImages]   = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [formData, setFormData]     = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-gigs"],
    queryFn: getMyGigsApi,
  });

  useEffect(() => {
    if (data?.gigs) {
      const gig = data.gigs.find((g) => g._id === id);
      if (gig) {
        setFormData({
          title:          gig.title       || "",
          description:    gig.description || "",
          category:       gig.category    || "",
          pricing: {
            basic:    gig.pricing?.basic    || { label: "Basic",    price: "", deliveryTime: "", description: "" },
            standard: gig.pricing?.standard || { label: "Standard", price: "", deliveryTime: "", description: "" },
            premium:  gig.pricing?.premium  || { label: "Premium",  price: "", deliveryTime: "", description: "" },
          },
          tags:           gig.tags   || [],
          existingImages: gig.images || [],
          isActive:       gig.isActive,
        });
      }
    }
  }, [data, id]);

  const { mutate: updateGig, isPending: updating } = useMutation({
    mutationFn: (formDataObj) => updateGigApi(id, formDataObj),
    onSuccess: () => {
      toast.success("Gig updated successfully!");
      queryClient.invalidateQueries(["my-gigs"]);
      navigate("/seller/dashboard");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update gig"),
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePricingChange = (pkg, field, value) =>
    setFormData({
      ...formData,
      pricing: { ...formData.pricing, [pkg]: { ...formData.pricing[pkg], [field]: value } },
    });

  const handleTagAdd = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput("");
    }
  };

  const handleTagRemove = (tag) =>
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
    setNewPreviews([...newPreviews, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const handleSubmit = () => {
    const fd = new FormData();
    fd.append("title",       formData.title);
    fd.append("description", formData.description);
    fd.append("category",    formData.category);
    fd.append("pricing",     JSON.stringify(formData.pricing));
    fd.append("tags",        JSON.stringify(formData.tags));
    fd.append("isActive",    formData.isActive);
    newImages.forEach((img) => fd.append("gigImages", img));
    updateGig(fd);
  };

  if (isLoading || !formData) return <Loader fullPage />;

  return (
    <div className="gig-form-page">
      <div className="container">

        <div className="gig-form-header">
          <h1 className="gig-form-title">Edit Gig</h1>
          <p className="gig-form-subtitle">Update your service details</p>
        </div>

        <div className="gig-form-card">

          {/* ── Basic Info ── */}
          <div className="gig-form-section">
            <h2 className="gig-form-section-title">Basic Information</h2>

            <div className="form-group">
              <label className="form-label">Gig Title</label>
              <input
                type="text" name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input form-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input form-textarea"
                rows={6}
              />
            </div>

            {/* Status Toggle */}
            <div className="form-group">
              <label className="form-label">Gig Status</label>
              <div className="toggle-row">
                <button
                  type="button"
                  className={`toggle-btn ${formData.isActive ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, isActive: true })}
                >
                  Active
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${!formData.isActive ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, isActive: false })}
                >
                  Paused
                </button>
              </div>
            </div>
          </div>

          <div className="gig-form-divider" />

          {/* ── Pricing ── */}
          <div className="gig-form-section">
            <h2 className="gig-form-section-title">Pricing</h2>
            <div className="pricing-grid">
              {["basic", "standard", "premium"].map((pkg) => (
                <div key={pkg} className="pricing-pkg-card">
                  <div className="pricing-pkg-header">
                    <span className="pricing-pkg-name">{pkg}</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number" min="1"
                      value={formData.pricing[pkg].price}
                      onChange={(e) => handlePricingChange(pkg, "price", e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery (days)</label>
                    <input
                      type="number" min="1"
                      value={formData.pricing[pkg].deliveryTime}
                      onChange={(e) => handlePricingChange(pkg, "deliveryTime", e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={formData.pricing[pkg].description}
                      onChange={(e) => handlePricingChange(pkg, "description", e.target.value)}
                      className="form-input form-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gig-form-divider" />

          {/* ── Images ── */}
          <div className="gig-form-section">
            <h2 className="gig-form-section-title">Images</h2>

            {formData.existingImages?.length > 0 && (
              <div className="form-group">
                <label className="form-label">Current Images</label>
                <div className="image-preview-grid">
                  {formData.existingImages.map((src, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={src} alt={`existing-${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Add New Images</label>
              {newPreviews.length > 0 && (
                <div className="image-preview-grid">
                  {newPreviews.map((src, i) => (
                    <div key={i} className="image-preview-item">
                      <img src={src} alt={`new-${i}`} />
                      <button
                        type="button"
                        className="image-preview-remove"
                        onClick={() => {
                          setNewImages(newImages.filter((_, j) => j !== i));
                          setNewPreviews(newPreviews.filter((_, j) => j !== i));
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="image-upload-area">
                <FolderOpen size={28} className="image-upload-icon" />
                <p className="image-upload-text">Click to upload new images</p>
                <input
                  type="file" accept="image/*" multiple
                  onChange={handleNewImages}
                  className="gig-form-hidden"
                />
              </label>
            </div>
          </div>

          <div className="gig-form-divider" />

          {/* ── Tags ── */}
          <div className="gig-form-section">
            <h2 className="gig-form-section-title">Tags</h2>
            <div className="tag-input-row">
              <input
                type="text" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleTagAdd(); }}}
                placeholder="Add a tag and press Enter"
                className="form-input"
              />
              <button type="button" className="btn btn-outline" onClick={handleTagAdd}>
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="tags-list">
                {formData.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" className="tag-chip-remove" onClick={() => handleTagRemove(tag)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="gig-form-actions">
            <button className="btn btn-outline" onClick={() => navigate("/seller/dashboard")}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={updating}>
              {updating ? (
                <span className="gig-form-btn-inner">
                  <Loader2 size={15} className="gig-form-spinner" /> Saving...
                </span>
              ) : (
                <span className="gig-form-btn-inner">
                  <Save size={15} /> Save Changes
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditGig;