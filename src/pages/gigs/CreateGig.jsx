import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Zap,
  Image,
  Video,
  FileText,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { createGigApi } from "../../api/gigApi.js";
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

const STEPS = ["Overview", "Pricing", "Extras", "Description", "Requirements", "Gallery"];

const CATEGORY_PKG_FEATURES = {
  "graphic-design": [
    { key: "revisions",         label: "Revisions",          type: "number" },
    { key: "logoTransparency",  label: "Logo transparency",  type: "bool" },
    { key: "vectorFile",        label: "Vector file",        type: "bool" },
    { key: "printableFile",     label: "Printable file",     type: "bool" },
    { key: "mockup3D",          label: "3D mockup",          type: "bool" },
    { key: "sourceFile",        label: "Source file",        type: "bool" },
    { key: "stationeryDesigns", label: "Stationery designs", type: "bool" },
    { key: "socialMediaKit",    label: "Social media kit",   type: "bool" },
  ],
  "web-development": [
    { key: "revisions",      label: "Revisions",          type: "number" },
    { key: "pages",          label: "Number of pages",    type: "number" },
    { key: "responsive",     label: "Responsive design",  type: "bool" },
    { key: "sourceFile",     label: "Source code",        type: "bool" },
    { key: "contentUpload",  label: "Content upload",     type: "bool" },
    { key: "speedOptimize",  label: "Speed optimization", type: "bool" },
    { key: "seoSetup",       label: "Basic SEO setup",    type: "bool" },
  ],
  "mobile-development": [
    { key: "revisions",      label: "Revisions",          type: "number" },
    { key: "screens",        label: "Number of screens",  type: "number" },
    { key: "sourceFile",     label: "Source code",        type: "bool" },
    { key: "responsive",     label: "Responsive design",  type: "bool" },
    { key: "apiIntegration", label: "API integration",    type: "bool" },
    { key: "appStore",       label: "App store upload",   type: "bool" },
  ],
  "digital-marketing": [
    { key: "revisions",       label: "Revisions",          type: "number" },
    { key: "platforms",       label: "Platforms included", type: "number" },
    { key: "posts",           label: "Posts per month",    type: "number" },
    { key: "analyticsReport", label: "Analytics report",   type: "bool" },
    { key: "adManagement",    label: "Ad management",      type: "bool" },
    { key: "contentCreation", label: "Content creation",   type: "bool" },
  ],
  "writing": [
    { key: "revisions",     label: "Revisions",       type: "number" },
    { key: "words",         label: "Words included",  type: "number" },
    { key: "seoOptimized",  label: "SEO optimized",   type: "bool" },
    { key: "topicResearch", label: "Topic research",  type: "bool" },
    { key: "formatting",    label: "Formatting",      type: "bool" },
  ],
  "video-editing": [
    { key: "revisions",     label: "Revisions",          type: "number" },
    { key: "duration",      label: "Duration (seconds)", type: "number" },
    { key: "scriptwriting", label: "Scriptwriting",      type: "bool" },
    { key: "voiceover",     label: "Voiceover",          type: "bool" },
    { key: "subtitles",     label: "Subtitles",          type: "bool" },
    { key: "colorGrading",  label: "Color grading",      type: "bool" },
    { key: "soundDesign",   label: "Sound design",       type: "bool" },
    { key: "sourceFile",    label: "Source file",        type: "bool" },
  ],
  "seo": [
    { key: "revisions",         label: "Revisions",           type: "number" },
    { key: "keywords",          label: "Keywords targeted",   type: "number" },
    { key: "backlinks",         label: "Backlinks included",  type: "number" },
    { key: "keywordResearch",   label: "Keyword research",    type: "bool" },
    { key: "onPageSeo",         label: "On-page SEO",         type: "bool" },
    { key: "analyticsReport",   label: "Analytics report",    type: "bool" },
    { key: "competitorAnalysis",label: "Competitor analysis", type: "bool" },
  ],
  "other": [
    { key: "revisions",  label: "Revisions",   type: "number" },
    { key: "sourceFile", label: "Source file", type: "bool" },
  ],
};

const CATEGORY_EXTRA_FEATURES = {
  "graphic-design": [
    { key: "vectorFile",        label: "Vector file",        hasPrice: true  },
    { key: "mockup3D",          label: "3D mockup",          hasPrice: true  },
    { key: "logoTransparency",  label: "Logo transparency",  hasPrice: false },
    { key: "printableFile",     label: "Printable file",     hasPrice: false },
    { key: "sourceFile",        label: "Source file",        hasPrice: false },
    { key: "stationeryDesigns", label: "Stationery designs", hasPrice: false },
    { key: "socialMediaKit",    label: "Social media kit",   hasPrice: false },
  ],
  "web-development": [
    { key: "sourceFile",    label: "Source code delivery", hasPrice: false },
    { key: "speedOptimize", label: "Speed optimization",   hasPrice: true  },
    { key: "seoSetup",      label: "SEO setup",            hasPrice: true  },
    { key: "contentUpload", label: "Content upload",       hasPrice: true  },
  ],
  "mobile-development": [
    { key: "sourceFile",     label: "Source code delivery", hasPrice: false },
    { key: "apiIntegration", label: "API integration",      hasPrice: true  },
    { key: "appStore",       label: "App store upload",     hasPrice: true  },
  ],
  "digital-marketing": [
    { key: "analyticsReport", label: "Analytics report", hasPrice: true },
    { key: "adManagement",    label: "Ad management",    hasPrice: true },
    { key: "contentCreation", label: "Content creation", hasPrice: true },
  ],
  "writing": [
    { key: "seoOptimized",  label: "SEO optimization", hasPrice: true  },
    { key: "topicResearch", label: "Topic research",   hasPrice: true  },
    { key: "formatting",    label: "Formatting",       hasPrice: false },
  ],
  "video-editing": [
    { key: "scriptwriting", label: "Scriptwriting", hasPrice: true  },
    { key: "voiceover",     label: "Voiceover",     hasPrice: true  },
    { key: "subtitles",     label: "Subtitles",     hasPrice: true  },
    { key: "colorGrading",  label: "Color grading", hasPrice: true  },
    { key: "soundDesign",   label: "Sound design",  hasPrice: true  },
    { key: "sourceFile",    label: "Source file",   hasPrice: false },
  ],
  "seo": [
    { key: "keywordResearch",    label: "Keyword research",   hasPrice: true },
    { key: "onPageSeo",          label: "On-page SEO",        hasPrice: true },
    { key: "analyticsReport",    label: "Analytics report",   hasPrice: true },
    { key: "competitorAnalysis", label: "Competitor analysis",hasPrice: true },
  ],
  "other": [
    { key: "sourceFile", label: "Source file", hasPrice: false },
  ],
};

const defaultPkg = {
  label: "", price: "", deliveryTime: "", description: "",
  features: {
    revisions: 1, logoTransparency: false, vectorFile: false,
    printableFile: false, mockup3D: false, sourceFile: false,
    stationeryDesigns: false, socialMediaKit: false,
  },
};

const defaultExtras = {
  fastDelivery: {
    basic:    { enabled: false, days: "", price: "" },
    standard: { enabled: false, days: "", price: "" },
    premium:  { enabled: false, days: "", price: "" },
  },
  additionalRevision:  { enabled: false, price: "" },
  additionalLogo:      { enabled: false, price: "" },
  logoTransparency:    { enabled: false },
  vectorFile:          { enabled: false, price: "" },
  printableFile:       { enabled: false },
  mockup3D:            { enabled: false, price: "" },
  sourceFile:          { enabled: false },
  stationeryDesigns:   { enabled: false },
  socialMediaKit:      { enabled: false },
  speedOptimize:       { enabled: false, price: "" },
  seoSetup:            { enabled: false, price: "" },
  contentUpload:       { enabled: false, price: "" },
  apiIntegration:      { enabled: false, price: "" },
  appStore:            { enabled: false, price: "" },
  analyticsReport:     { enabled: false, price: "" },
  adManagement:        { enabled: false, price: "" },
  contentCreation:     { enabled: false, price: "" },
  seoOptimized:        { enabled: false, price: "" },
  topicResearch:       { enabled: false, price: "" },
  formatting:          { enabled: false },
  scriptwriting:       { enabled: false, price: "" },
  voiceover:           { enabled: false, price: "" },
  subtitles:           { enabled: false, price: "" },
  colorGrading:        { enabled: false, price: "" },
  soundDesign:         { enabled: false, price: "" },
  keywordResearch:     { enabled: false, price: "" },
  onPageSeo:           { enabled: false, price: "" },
  competitorAnalysis:  { enabled: false, price: "" },
};

const CreateGig = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const [title, setTitle]                       = useState("");
  const [category, setCategory]                 = useState("");
  const pkgFeatures   = CATEGORY_PKG_FEATURES[category]   || CATEGORY_PKG_FEATURES["other"];
  const extraFeatures = CATEGORY_EXTRA_FEATURES[category] || CATEGORY_EXTRA_FEATURES["other"];
  const [tagInput, setTagInput]                 = useState("");
  const [tags, setTags]                         = useState([]);
  const [kwInput, setKwInput]                   = useState("");
  const [positiveKeywords, setPositiveKeywords] = useState([]);

  const [pricing, setPricing] = useState({
    basic:    { ...defaultPkg, label: "Basic"    },
    standard: { ...defaultPkg, label: "Standard" },
    premium:  { ...defaultPkg, label: "Premium"  },
  });

  const [extras, setExtras]           = useState(defaultExtras);
  const [description, setDescription] = useState("");
  const [faqs, setFaqs]               = useState([{ question: "", answer: "" }]);
  const [requirements, setRequirements] = useState([]);
  const [reqInput, setReqInput]         = useState("");
  const [images,        setImages]        = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [video,         setVideo]         = useState(null);
  const [videoPreview,  setVideoPreview]  = useState("");
  const [documents,     setDocuments]     = useState([]);
  const [errors, setErrors]               = useState({});

  const { mutate: createGig, isPending } = useMutation({
    mutationFn: createGigApi,
    onSuccess: () => {
      toast.success("Gig published successfully!");
      navigate("/seller/dashboard");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create gig"),
  });

  /* ── Helpers ── */
  const addTag = (val, list, setList, max = 10) => {
    const t = val.trim().toLowerCase();
    if (t && !list.includes(t) && list.length < max) setList([...list, t]);
  };

  const handlePricingChange = (pkg, field, value) =>
    setPricing((p) => ({ ...p, [pkg]: { ...p[pkg], [field]: value } }));

  const handleFeatureChange = (pkg, key, value) =>
    setPricing((p) => ({
      ...p,
      [pkg]: { ...p[pkg], features: { ...p[pkg].features, [key]: value } },
    }));

  const handleExtraToggle = (key) =>
    setExtras((e) => ({ ...e, [key]: { ...e[key], enabled: !e[key].enabled } }));

  const handleExtraField = (key, field, value) =>
    setExtras((e) => ({ ...e, [key]: { ...e[key], [field]: value } }));

  const handleFastDeliveryToggle = (pkg) =>
    setExtras((e) => ({
      ...e,
      fastDelivery: {
        ...e.fastDelivery,
        [pkg]: { ...e.fastDelivery[pkg], enabled: !e.fastDelivery[pkg].enabled },
      },
    }));

  const handleFastDeliveryField = (pkg, field, value) =>
    setExtras((e) => ({
      ...e,
      fastDelivery: {
        ...e.fastDelivery,
        [pkg]: { ...e.fastDelivery[pkg], [field]: value },
      },
    }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) { toast.error("Max 3 images"); return; }
    setImages((p) => [...p, ...files]);
    setImagePreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i) => {
    setImages((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const handleVideoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setVideo(f);
    setVideoPreview(URL.createObjectURL(f));
  };

  const handleDocChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + documents.length > 2) { toast.error("Max 2 documents"); return; }
    setDocuments((p) => [...p, ...files]);
  };

  const addFaq    = () => setFaqs((f) => [...f, { question: "", answer: "" }]);
  const updateFaq = (i, field, val) =>
    setFaqs((f) => f.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)));
  const removeFaq = (i) => setFaqs((f) => f.filter((_, idx) => idx !== i));

  const addRequirement = () => {
    if (reqInput.trim()) {
      setRequirements((r) => [...r, { question: reqInput.trim(), type: "text", isRequired: true }]);
      setReqInput("");
    }
  };

  /* ── Validation ── */
  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!title.trim()) e.title    = "Title is required";
      if (!category)     e.category = "Category is required";
    }
    if (step === 1) {
      if (!pricing.basic.price)        e.basicPrice    = "Basic price is required";
      if (!pricing.basic.deliveryTime) e.basicDelivery = "Basic delivery time is required";
      if (!pricing.basic.description)  e.basicDesc     = "Basic description is required";
    }
    if (step === 3) {
      if (!description.trim()) e.description = "Description is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep((s) => s + 1); };
  const handleBack = () => setStep((s) => s - 1);

  /* ── Submit ── */
  const handleSubmit = () => {
    if (!validateStep()) return;
    const fd = new FormData();
    fd.append("title",            title);
    fd.append("description",      description);
    fd.append("category",         category);
    fd.append("pricing",          JSON.stringify(pricing));
    fd.append("tags",             JSON.stringify(tags));
    fd.append("positiveKeywords", JSON.stringify(positiveKeywords));
    fd.append("extras",           JSON.stringify(extras));
    fd.append("faqs",             JSON.stringify(faqs.filter((f) => f.question)));
    fd.append("requirements",     JSON.stringify(requirements));
    images.forEach((img) => fd.append("gigImages", img));
    if (video) fd.append("gigVideo", video);
    documents.forEach((doc) => fd.append("gigDocuments", doc));
    createGig(fd);
  };

  /* ── Render ── */
  return (
    <div className="gig-form-page">
      <div className="container">

        <div className="gig-form-header">
          <h1 className="gig-form-title">Create a New Gig</h1>
          <p className="gig-form-subtitle">Fill in the details to list your service on SkillBridge</p>
        </div>

        {/* Steps */}
        <div className="gig-steps">
          {STEPS.map((s, i) => (
            <div key={i} className={`gig-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
              <div className="gig-step__num">
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="gig-step__label">{s}</span>
            </div>
          ))}
        </div>

        <div className="gig-form-card">

          {/* ── STEP 0: Overview ── */}
          {step === 0 && (
            <div className="gig-form-section">
              <h2 className="gig-form-section-title">Gig Overview</h2>

              <div className="form-group">
                <label className="form-label">Gig Title <span className="required">*</span></label>
                <input
                  type="text" value={title}
                  onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
                  placeholder="e.g. I will design a professional logo for your brand"
                  className={`form-input ${errors.title ? "error" : ""}`}
                  maxLength={100}
                />
                <div className="form-input-meta">
                  <span className="form-error">{errors.title}</span>
                  <span className="form-char-count">{title.length}/100</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setErrors({}); }}
                  className={`form-input form-select ${errors.category ? "error" : ""}`}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.category && <span className="form-error">{errors.category}</span>}
              </div>

              {/* Search Tags */}
              <div className="form-group">
                <label className="form-label">Search Tags <span className="form-hint">(max 5)</span></label>
                <p className="form-desc">Tags help buyers find your gig in search results.</p>
                <div className="tag-input-row">
                  <input
                    type="text" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput, tags, setTags, 5); setTagInput(""); }}}
                    placeholder="e.g. logo design"
                    className="form-input"
                  />
                  <button type="button" className="btn btn-outline"
                    onClick={() => { addTag(tagInput, tags, setTags, 5); setTagInput(""); }}>
                    Add
                  </button>
                </div>
                <div className="tags-list">
                  {tags.map((t) => (
                    <span key={t} className="tag-chip">
                      {t}
                      <button type="button" className="tag-chip-remove"
                        onClick={() => setTags(tags.filter((x) => x !== t))}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Positive Keywords */}
              <div className="form-group">
                <label className="form-label">Positive Keywords <span className="form-hint">(max 10)</span></label>
                <p className="form-desc">Keywords that describe the best qualities of your service.</p>
                <div className="tag-input-row">
                  <input
                    type="text" value={kwInput}
                    onChange={(e) => setKwInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(kwInput, positiveKeywords, setPositiveKeywords, 10); setKwInput(""); }}}
                    placeholder="e.g. professional, creative, fast delivery"
                    className="form-input"
                  />
                  <button type="button" className="btn btn-outline"
                    onClick={() => { addTag(kwInput, positiveKeywords, setPositiveKeywords, 10); setKwInput(""); }}>
                    Add
                  </button>
                </div>
                <div className="tags-list">
                  {positiveKeywords.map((k) => (
                    <span key={k} className="tag-chip tag-chip--green">
                      {k}
                      <button type="button" className="tag-chip-remove"
                        onClick={() => setPositiveKeywords(positiveKeywords.filter((x) => x !== k))}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Pricing ── */}
          {step === 1 && (
            <div className="gig-form-section">
              <h2 className="gig-form-section-title">Set Your Packages</h2>
              <p className="gig-form-section-desc">Set the prices for your 3 packages and select the elements to include in each offer.</p>

              {!category && (
                <div className="gig-form-warning">
                  <AlertTriangle size={15} />
                  Please select a category in Step 1 to see relevant features
                </div>
              )}

              <div className="pkg-table">
                <div className="pkg-table__row pkg-table__header">
                  <div className="pkg-table__label" />
                  {["basic", "standard", "premium"].map((pkg) => (
                    <div key={pkg} className="pkg-table__col">
                      <div className={`pkg-badge pkg-badge--${pkg}`}>{pkg}</div>
                      <input
                        type="text" value={pricing[pkg].label}
                        onChange={(e) => handlePricingChange(pkg, "label", e.target.value)}
                        placeholder={pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                        className="form-input pkg-name-input"
                      />
                    </div>
                  ))}
                </div>

                <div className="pkg-table__row">
                  <div className="pkg-table__label">Price ($)</div>
                  {["basic", "standard", "premium"].map((pkg) => (
                    <div key={pkg} className="pkg-table__col">
                      <input
                        type="number" value={pricing[pkg].price} min="1"
                        onChange={(e) => handlePricingChange(pkg, "price", e.target.value)}
                        placeholder="$"
                        className={`form-input ${pkg === "basic" && errors.basicPrice ? "error" : ""}`}
                      />
                      {pkg === "basic" && errors.basicPrice && <span className="form-error">{errors.basicPrice}</span>}
                    </div>
                  ))}
                </div>

                <div className="pkg-table__row">
                  <div className="pkg-table__label">Delivery (days)</div>
                  {["basic", "standard", "premium"].map((pkg) => (
                    <div key={pkg} className="pkg-table__col">
                      <input
                        type="number" value={pricing[pkg].deliveryTime} min="1"
                        onChange={(e) => handlePricingChange(pkg, "deliveryTime", e.target.value)}
                        placeholder="days"
                        className={`form-input ${pkg === "basic" && errors.basicDelivery ? "error" : ""}`}
                      />
                      {pkg === "basic" && errors.basicDelivery && <span className="form-error">{errors.basicDelivery}</span>}
                    </div>
                  ))}
                </div>

                <div className="pkg-table__row">
                  <div className="pkg-table__label">Description</div>
                  {["basic", "standard", "premium"].map((pkg) => (
                    <div key={pkg} className="pkg-table__col">
                      <textarea
                        value={pricing[pkg].description}
                        onChange={(e) => handlePricingChange(pkg, "description", e.target.value)}
                        placeholder="What's included..." rows={3}
                        className={`form-input form-textarea ${pkg === "basic" && errors.basicDesc ? "error" : ""}`}
                      />
                      {pkg === "basic" && errors.basicDesc && <span className="form-error">{errors.basicDesc}</span>}
                    </div>
                  ))}
                </div>

                {pkgFeatures.map((feat) => (
                  <div key={feat.key} className="pkg-table__row">
                    <div className="pkg-table__label">{feat.label}</div>
                    {["basic", "standard", "premium"].map((pkg) => (
                      <div key={pkg} className="pkg-table__col pkg-table__col--center">
                        {feat.type === "number" ? (
                          <input
                            type="number" min="0"
                            value={pricing[pkg].features[feat.key]}
                            onChange={(e) => handleFeatureChange(pkg, feat.key, Number(e.target.value))}
                            className="form-input pkg-num-input" placeholder="0"
                          />
                        ) : (
                          <label className="pkg-checkbox">
                            <input
                              type="checkbox"
                              checked={pricing[pkg].features[feat.key]}
                              onChange={(e) => handleFeatureChange(pkg, feat.key, e.target.checked)}
                            />
                            <span className="pkg-checkmark" />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Extras ── */}
          {step === 2 && (
            <div className="gig-form-section">
              <h2 className="gig-form-section-title">Add Extra Services</h2>
              <p className="gig-form-section-desc">Increase your order value by offering add-ons.</p>

              {/* Fast Delivery */}
              <div className="extra-block">
                <div className="extra-block__title">
                  <Zap size={15} /> Extra Fast Delivery
                </div>
                {["basic", "standard", "premium"].map((pkg) => (
                  <div key={pkg} className="extra-row">
                    <label className="pkg-checkbox extra-check">
                      <input type="checkbox"
                        checked={extras.fastDelivery[pkg].enabled}
                        onChange={() => handleFastDeliveryToggle(pkg)} />
                      <span className="pkg-checkmark" />
                      <span className="extra-row__label">{pkg.charAt(0).toUpperCase() + pkg.slice(1)}</span>
                    </label>
                    {extras.fastDelivery[pkg].enabled && (
                      <div className="extra-row__fields">
                        <span>I'll deliver in only</span>
                        <input type="number" placeholder="days" min="1"
                          value={extras.fastDelivery[pkg].days}
                          onChange={(e) => handleFastDeliveryField(pkg, "days", e.target.value)}
                          className="form-input extra-small-input" />
                        <span>days for an extra</span>
                        <div className="input-prefix-wrap">
                          <span className="input-prefix">$</span>
                          <input type="number" placeholder="0" min="1"
                            value={extras.fastDelivery[pkg].price}
                            onChange={(e) => handleFastDeliveryField(pkg, "price", e.target.value)}
                            className="form-input extra-small-input" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Additional Revision */}
              <div className="extra-block">
                <div className="extra-row">
                  <label className="pkg-checkbox extra-check">
                    <input type="checkbox" checked={extras.additionalRevision.enabled}
                      onChange={() => handleExtraToggle("additionalRevision")} />
                    <span className="pkg-checkmark" />
                    <span className="extra-row__label">Additional Revision</span>
                  </label>
                  {extras.additionalRevision.enabled && (
                    <div className="extra-row__fields">
                      <span>for an extra</span>
                      <div className="input-prefix-wrap">
                        <span className="input-prefix">$</span>
                        <input type="number" placeholder="0" min="1"
                          value={extras.additionalRevision.price}
                          onChange={(e) => handleExtraField("additionalRevision", "price", e.target.value)}
                          className="form-input extra-small-input" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Logo */}
              <div className="extra-block">
                <div className="extra-row">
                  <label className="pkg-checkbox extra-check">
                    <input type="checkbox" checked={extras.additionalLogo.enabled}
                      onChange={() => handleExtraToggle("additionalLogo")} />
                    <span className="pkg-checkmark" />
                    <span className="extra-row__label">Additional Logo</span>
                  </label>
                  {extras.additionalLogo.enabled && (
                    <div className="extra-row__fields">
                      <span>for an extra</span>
                      <div className="input-prefix-wrap">
                        <span className="input-prefix">$</span>
                        <input type="number" placeholder="0" min="1"
                          value={extras.additionalLogo.price}
                          onChange={(e) => handleExtraField("additionalLogo", "price", e.target.value)}
                          className="form-input extra-small-input" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {extraFeatures.map((feat) => (
                <div key={feat.key} className="extra-block">
                  <div className="extra-row">
                    <label className="pkg-checkbox extra-check">
                      <input type="checkbox" checked={extras[feat.key].enabled}
                        onChange={() => handleExtraToggle(feat.key)} />
                      <span className="pkg-checkmark" />
                      <span className="extra-row__label">{feat.label}</span>
                    </label>
                    {feat.hasPrice && extras[feat.key].enabled && (
                      <div className="extra-row__fields">
                        <span>for an extra</span>
                        <div className="input-prefix-wrap">
                          <span className="input-prefix">$</span>
                          <input type="number" placeholder="0" min="1"
                            value={extras[feat.key].price || ""}
                            onChange={(e) => handleExtraField(feat.key, "price", e.target.value)}
                            className="form-input extra-small-input" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 3: Description ── */}
          {step === 3 && (
            <div className="gig-form-section">
              <h2 className="gig-form-section-title">Describe Your Gig</h2>

              <div className="form-group">
                <label className="form-label">Gig Description <span className="required">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setErrors({}); }}
                  placeholder="Describe your service in detail. What will you deliver? What makes your service unique?"
                  className={`form-input form-textarea ${errors.description ? "error" : ""}`}
                  rows={8} maxLength={2000}
                />
                <div className="form-input-meta">
                  <span className="form-error">{errors.description}</span>
                  <span className="form-char-count">{description.length}/2000</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Frequently Asked Questions</label>
                <p className="form-desc">Add Q&A to help buyers understand your service better.</p>
                {faqs.map((faq, i) => (
                  <div key={i} className="faq-item">
                    <div className="faq-item__header">
                      <span className="faq-item__num">Q{i + 1}</span>
                      {faqs.length > 1 && (
                        <button type="button" className="faq-remove" onClick={() => removeFaq(i)}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <input type="text" value={faq.question}
                      onChange={(e) => updateFaq(i, "question", e.target.value)}
                      placeholder="e.g. What file formats will I receive?"
                      className="form-input" />
                    <textarea value={faq.answer}
                      onChange={(e) => updateFaq(i, "answer", e.target.value)}
                      placeholder="Your answer..." rows={3}
                      className="form-input form-textarea" />
                  </div>
                ))}
                <button type="button" className="btn btn-ghost" onClick={addFaq}>+ Add FAQ</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Requirements ── */}
          {step === 4 && (
            <div className="gig-form-section">
              <h2 className="gig-form-section-title">Get Requirements from Buyers</h2>
              <p className="gig-form-section-desc">
                Add questions to help buyers provide exactly what you need to start working.
              </p>

              <div className="default-questions">
                <div className="default-questions__title">
                  Standard Questions <span className="badge-optional">optional</span>
                </div>
                <div className="default-q-item">
                  <span className="default-q-type">Multiple choice</span>
                  <p>1. If you're ordering for a business, what's your industry?</p>
                  <p className="default-q-hint">3D design, e-commerce, accounting, marketing, etc.</p>
                </div>
                <div className="default-q-item">
                  <span className="default-q-type">Multiple choice</span>
                  <p>2. Is this order part of a bigger project you're working on?</p>
                  <p className="default-q-hint">Building a mobile app, creating an animation, developing a game, etc.</p>
                </div>
              </div>

              <div className="form-group gig-form-mt">
                <label className="form-label">Your Questions</label>
                <p className="form-desc">Request specific details needed to complete the order.</p>
                <div className="tag-input-row">
                  <input type="text" value={reqInput}
                    onChange={(e) => setReqInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRequirement(); }}}
                    placeholder="e.g. Please share your brand colors and logo concept"
                    className="form-input" />
                  <button type="button" className="btn btn-outline" onClick={addRequirement}>Add</button>
                </div>
                {requirements.length > 0 && (
                  <div className="requirements-list">
                    {requirements.map((r, i) => (
                      <div key={i} className="requirement-item">
                        <span className="requirement-num">{i + 1}</span>
                        <span className="requirement-text">{r.question}</span>
                        <button type="button" className="faq-remove"
                          onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 5: Gallery ── */}
          {step === 5 && (
            <div className="gig-form-section">
              <h2 className="gig-form-section-title">Gig Gallery</h2>
              <p className="gig-form-section-desc">Get noticed with visual examples of your services.</p>

              {/* Images */}
              <div className="form-group">
                <label className="form-label">Images <span className="form-hint">(up to 3)</span></label>
                {imagePreviews.length > 0 && (
                  <div className="image-preview-grid">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="image-preview-item">
                        <img src={src} alt={`preview-${i}`} />
                        <button className="image-preview-remove" type="button" onClick={() => removeImage(i)}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 3 && (
                  <label className="image-upload-area">
                    <Image size={28} className="image-upload-icon" />
                    <p className="image-upload-text">Click to upload images</p>
                    <p className="image-upload-hint">JPG, PNG, WEBP — max 5MB each</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="gig-form-hidden" />
                  </label>
                )}
              </div>

              {/* Video */}
              <div className="form-group">
                <label className="form-label">Video <span className="form-hint">(one only)</span></label>
                {videoPreview ? (
                  <div className="video-preview">
                    <video src={videoPreview} controls className="video-player" />
                    <button type="button" className="btn btn-ghost btn-sm"
                      onClick={() => { setVideo(null); setVideoPreview(""); }}>
                      Remove video
                    </button>
                  </div>
                ) : (
                  <label className="image-upload-area">
                    <Video size={28} className="image-upload-icon" />
                    <p className="image-upload-text">Click to upload video</p>
                    <p className="image-upload-hint">MP4, MOV — max 50MB</p>
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="gig-form-hidden" />
                  </label>
                )}
              </div>

              {/* Documents */}
              <div className="form-group">
                <label className="form-label">Documents <span className="form-hint">(up to 2 PDFs)</span></label>
                <label className="image-upload-area">
                  <FileText size={28} className="image-upload-icon" />
                  <p className="image-upload-text">Click to upload PDFs</p>
                  <p className="image-upload-hint">PDF only — max 10MB each</p>
                  <input type="file" accept=".pdf" multiple onChange={handleDocChange} className="gig-form-hidden" />
                </label>
                {documents.length > 0 && (
                  <div className="doc-list">
                    {documents.map((d, i) => (
                      <div key={i} className="doc-item">
                        <FileText size={14} />
                        <span>{d.name}</span>
                        <button type="button" className="faq-remove"
                          onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Final Summary */}
              <div className="gig-summary">
                <h3 className="gig-summary-title">Review before publishing</h3>
                {[
                  ["Title",        title],
                  ["Category",     category],
                  ["Tags",         `${tags.length} added`],
                  ["Keywords",     `${positiveKeywords.length} added`],
                  ["Basic Price",  `$${pricing.basic.price || "—"}`],
                  ["Delivery",     `${pricing.basic.deliveryTime || "—"} days`],
                  ["Images",       `${images.length} uploaded`],
                  ["Video",        video ? "1 uploaded" : "None"],
                  ["Documents",    `${documents.length} uploaded`],
                  ["FAQs",         `${faqs.filter((f) => f.question).length} added`],
                  ["Requirements", `${requirements.length} added`],
                ].map(([label, val]) => (
                  <div key={label} className="gig-summary-row">
                    <span>{label}</span>
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="gig-form-actions">
            {step > 0 && (
              <button className="btn btn-outline" onClick={handleBack} disabled={isPending}>
                <ChevronLeft size={15} /> Back
              </button>
            )}
            <div className="gig-form-actions-right">
              {step < STEPS.length - 1 ? (
                <button className="btn btn-primary" onClick={handleNext}>
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={isPending}>
                  {isPending ? (
                    <span className="gig-form-btn-inner">
                      <Loader2 size={15} className="gig-form-spinner" /> Publishing...
                    </span>
                  ) : (
                    <span className="gig-form-btn-inner">
                      <Rocket size={15} /> Publish Gig
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateGig;