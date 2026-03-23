import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FiTool,
  FiGlobe,
  FiBriefcase,
  FiImage,
  FiBookOpen,
  FiAward,
  FiSave,
  FiPlus,
  FiX,
  FiLoader,
} from "react-icons/fi";
import {
  updateProfileApi,
  uploadAvatarApi,
  updateSellerProfileApi,
  getProfileApi,
} from "../../api/userApi.js";
import toast from "react-hot-toast";
import UserAvatar from "../../components/common/UserAvatar.jsx";
import "./Profile.css";

const LANGUAGE_LEVELS = ["Basic", "Conversational", "Fluent", "Native"];

const SELLER_SECTIONS = [
  { key: "skills",        label: "Skills & Expertise",  Icon: FiTool      },
  { key: "languages",     label: "Languages",            Icon: FiGlobe     },
  { key: "workExp",       label: "Work Experience",      Icon: FiBriefcase },
  { key: "portfolio",     label: "Portfolio",            Icon: FiImage     },
  { key: "education",     label: "Education",            Icon: FiBookOpen  },
  { key: "certifications",label: "Certifications",       Icon: FiAward     },
];

const EditProfile = () => {
  const { user, isSeller, updateUser } = useAuth();

  const [activeTab, setActiveTab]       = useState("basic");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [skillInput, setSkillInput]     = useState("");

  const [basicForm, setBasicForm] = useState({
    name:    user?.name    || "",
    country: user?.country || "",
    phone:   user?.phone   || "",
    bio:     user?.bio     || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [sellerForm, setSellerForm] = useState({
    tagline:        "",
    username:       "",
    bio:            "",
    introVideo:     "",
    skills:         [],
    languages:      [{ name: "English", level: "Fluent" }],
    hourlyRate:     "",
    workExperience: [],
    education:      [],
    certifications: [],
    portfolio:      [],
  });

  // ── Load existing seller profile ──────────────────────────────────
  useQuery({
    queryKey: ["my-profile"],
    queryFn:  getProfileApi,
    enabled:  isSeller,
    onSuccess: (data) => {
      const sp = data?.sellerProfile;
      if (!sp) return;
      setSellerForm({
        tagline:        sp.tagline        || "",
        username:       sp.username       || "",
        bio:            sp.bio            || "",
        introVideo:     sp.introVideo     || "",
        skills:         sp.skills         || [],
        languages:      sp.languages?.length ? sp.languages : [{ name: "English", level: "Fluent" }],
        hourlyRate:     sp.hourlyRate     || "",
        workExperience: sp.workExperience || [],
        education:      sp.education      || [],
        certifications: sp.certifications || [],
        portfolio:      sp.portfolio      || [],
      });
    },
  });

  // ── Mutations ─────────────────────────────────────────────────────
  const { mutate: updateProfile, isLoading: updatingProfile } = useMutation({
    mutationFn: updateProfileApi,
    onSuccess:  (data) => { updateUser(data.user); toast.success("Profile updated!"); },
    onError:    (err)  => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: uploadAvatar, isLoading: uploadingAvatar } = useMutation({
    mutationFn: uploadAvatarApi,
    onSuccess:  (data) => { updateUser({ ...user, avatar: data.avatar }); toast.success("Avatar updated!"); },
    onError:    (err)  => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: updateSeller, isLoading: updatingSeller } = useMutation({
    mutationFn: updateSellerProfileApi,
    onSuccess:  () => toast.success("Seller profile updated!"),
    onError:    (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  // ── Handlers ──────────────────────────────────────────────────────
  const handleBasicSubmit    = (e) => { e.preventDefault(); updateProfile(basicForm); };
  const handleSellerSubmit   = (e) => { e.preventDefault(); updateSeller(sellerForm); };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = "Required";
    if (!passwordForm.newPassword)     errors.newPassword     = "Required";
    if (passwordForm.newPassword.length < 6) errors.newPassword = "Min 6 chars";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length) { setPasswordErrors(errors); return; }
    toast.success("Password updated!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
  };

  // Skills
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !sellerForm.skills.includes(s)) {
      setSellerForm({ ...sellerForm, skills: [...sellerForm.skills, s] });
      setSkillInput("");
    }
  };
  const removeSkill = (s) =>
    setSellerForm({ ...sellerForm, skills: sellerForm.skills.filter((x) => x !== s) });

  // Languages
  const addLanguage    = () => setSellerForm({ ...sellerForm, languages: [...sellerForm.languages, { name: "", level: "Fluent" }] });
  const updateLanguage = (i, key, val) => {
    const langs = [...sellerForm.languages];
    langs[i] = { ...langs[i], [key]: val };
    setSellerForm({ ...sellerForm, languages: langs });
  };
  const removeLanguage = (i) =>
    setSellerForm({ ...sellerForm, languages: sellerForm.languages.filter((_, idx) => idx !== i) });

  // Work Experience
  const addWork    = () => setSellerForm({ ...sellerForm, workExperience: [...sellerForm.workExperience, { company: "", title: "", from: "", to: "", description: "" }] });
  const updateWork = (i, key, val) => {
    const arr = [...sellerForm.workExperience];
    arr[i] = { ...arr[i], [key]: val };
    setSellerForm({ ...sellerForm, workExperience: arr });
  };
  const removeWork = (i) =>
    setSellerForm({ ...sellerForm, workExperience: sellerForm.workExperience.filter((_, idx) => idx !== i) });

  // Education
  const addEdu    = () => setSellerForm({ ...sellerForm, education: [...sellerForm.education, { institution: "", degree: "", major: "", from: "", to: "" }] });
  const updateEdu = (i, key, val) => {
    const arr = [...sellerForm.education];
    arr[i] = { ...arr[i], [key]: val };
    setSellerForm({ ...sellerForm, education: arr });
  };
  const removeEdu = (i) =>
    setSellerForm({ ...sellerForm, education: sellerForm.education.filter((_, idx) => idx !== i) });

  // Certifications
  const addCert    = () => setSellerForm({ ...sellerForm, certifications: [...sellerForm.certifications, { name: "", issuedBy: "", year: "" }] });
  const updateCert = (i, key, val) => {
    const arr = [...sellerForm.certifications];
    arr[i] = { ...arr[i], [key]: val };
    setSellerForm({ ...sellerForm, certifications: arr });
  };
  const removeCert = (i) =>
    setSellerForm({ ...sellerForm, certifications: sellerForm.certifications.filter((_, idx) => idx !== i) });

  // Portfolio
  const addPortfolio    = () => setSellerForm({ ...sellerForm, portfolio: [...sellerForm.portfolio, { title: "", image: "", link: "", description: "" }] });
  const updatePortfolio = (i, key, val) => {
    const arr = [...sellerForm.portfolio];
    arr[i] = { ...arr[i], [key]: val };
    setSellerForm({ ...sellerForm, portfolio: arr });
  };
  const removePortfolio = (i) =>
    setSellerForm({ ...sellerForm, portfolio: sellerForm.portfolio.filter((_, idx) => idx !== i) });

  const TABS = [
    { key: "basic",    label: "Basic Info"      },
    ...(isSeller ? [{ key: "seller", label: "Seller Profile" }] : []),
    { key: "password", label: "Password"        },
  ];

  return (
    <div className="profile-page">
      <div className="container profile-layoutt">

        {/* ── Sidebar ── */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-section">
            <UserAvatar
              user={{ ...user, avatar: avatarPreview || user?.avatar }}
              size="xl"
              editable
              uploading={uploadingAvatar}
              onFileSelect={(file) => {
                setAvatarPreview(URL.createObjectURL(file));
                const fd = new FormData();
                fd.append("avatar", file);
                uploadAvatar(fd);
              }}
            />
            <p className="profile-name">{user?.name}</p>
            <p className="profile-role">{user?.role}</p>
            <p className="profile-avatar-hint">Click on photo to change</p>
          </div>

          <nav className="profile-nav">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`profile-nav-item ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ── */}
        <div className="profile-content">

          {/* ── Basic Info ── */}
          {activeTab === "basic" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2 className="profile-card-title">Basic Information</h2>
              </div>
              <form onSubmit={handleBasicSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={basicForm.name}
                    onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                    className="form-input"
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    className="form-input form-input--disabled"
                    disabled
                  />
                  <span className="form-hint">Email cannot be changed</span>
                </div>

                <div className="profile-form-row">
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      value={basicForm.country}
                      onChange={(e) => setBasicForm({ ...basicForm, country: e.target.value })}
                      className="form-input"
                      placeholder="e.g. Pakistan"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      value={basicForm.phone}
                      onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                      className="form-input"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">About Me</label>
                  <textarea
                    value={basicForm.bio}
                    onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                    className="form-input form-textarea"
                    placeholder="Tell buyers about yourself..."
                    rows={4}
                    maxLength={600}
                  />
                  <div className="form-input-meta">
                    <span className="form-hint">Visible on your public profile</span>
                    <span className="form-char-count">{basicForm.bio.length}/600</span>
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                    {updatingProfile
                      ? <><FiLoader className="btn-spinner" size={15} /> Saving...</>
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Seller Profile ── */}
          {activeTab === "seller" && isSeller && (
            <form onSubmit={handleSellerSubmit} className="seller-form">

              {/* ① Overview */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <h2 className="profile-card-title">Seller Profile</h2>
                  <p className="profile-card-subtitle">This info will be visible to buyers</p>
                </div>
                <div className="profile-form">
                  <div className="profile-form-row">
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input
                        className="form-input"
                        placeholder="e.g. turab_dev"
                        value={sellerForm.username}
                        onChange={(e) => setSellerForm({ ...sellerForm, username: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tagline / Headline</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Full Stack MERN Developer"
                        value={sellerForm.tagline}
                        onChange={(e) => setSellerForm({ ...sellerForm, tagline: e.target.value })}
                        maxLength={150}
                      />
                      <span className="form-char-count">{sellerForm.tagline.length}/150</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">About</label>
                    <textarea
                      className="form-input form-textarea"
                      rows={5}
                      maxLength={1000}
                      placeholder="Tell buyers about yourself, experience, and what you offer..."
                      value={sellerForm.bio}
                      onChange={(e) => setSellerForm({ ...sellerForm, bio: e.target.value })}
                    />
                    <div className="form-input-meta">
                      <span />
                      <span className="form-char-count">{sellerForm.bio.length}/1000</span>
                    </div>
                  </div>

                  <div className="profile-form-row">
                    <div className="form-group">
                      <label className="form-label">Intro Video URL</label>
                      <input
                        className="form-input"
                        placeholder="https://youtube.com/..."
                        value={sellerForm.introVideo}
                        onChange={(e) => setSellerForm({ ...sellerForm, introVideo: e.target.value })}
                      />
                      <span className="form-hint">YouTube or Loom link</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hourly Rate ($)</label>
                      <input
                        type="number"
                        className="form-input form-input--narrow"
                        min="1"
                        placeholder="e.g. 25"
                        value={sellerForm.hourlyRate}
                        onChange={(e) => setSellerForm({ ...sellerForm, hourlyRate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ② Skills */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="section-heading">
                    <FiTool size={16} />
                    <h3 className="section-heading__title">Skills & Expertise</h3>
                  </div>
                </div>
                <div className="profile-form">
                  <div className="tag-input-row">
                    <input
                      className="form-input"
                      placeholder="Add a skill and press Enter or click Add"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    />
                    <button type="button" className="btn btn-outline" onClick={addSkill}>Add</button>
                  </div>
                  {sellerForm.skills.length > 0 && (
                    <div className="tags-list">
                      {sellerForm.skills.map((s) => (
                        <span key={s} className="tag-chip">
                          {s}
                          <button type="button" className="tag-chip-remove" onClick={() => removeSkill(s)}>
                            <FiX size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ③ Languages */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="section-heading">
                    <FiGlobe size={16} />
                    <h3 className="section-heading__title">Languages</h3>
                  </div>
                </div>
                <div className="profile-form">
                  {sellerForm.languages.map((lang, i) => (
                    <div key={i} className="entry-card entry-card--lang">
                      <div className="form-group">
                        <label className="form-label form-label--sm">Language</label>
                        <input
                          className="form-input"
                          placeholder="e.g. English"
                          value={lang.name}
                          onChange={(e) => updateLanguage(i, "name", e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label form-label--sm">Level</label>
                        <select
                          className="form-input"
                          value={lang.level}
                          onChange={(e) => updateLanguage(i, "level", e.target.value)}
                        >
                          {LANGUAGE_LEVELS.map((l) => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <button type="button" className="entry-remove-btn" onClick={() => removeLanguage(i)}>
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-entry-btn" onClick={addLanguage}>
                    <FiPlus size={14} /> Add Language
                  </button>
                </div>
              </div>

              {/* ④ Work Experience */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="section-heading">
                    <FiBriefcase size={16} />
                    <h3 className="section-heading__title">Work Experience</h3>
                  </div>
                </div>
                <div className="profile-form">
                  {sellerForm.workExperience.map((w, i) => (
                    <div key={i} className="entry-card">
                      <div className="entry-card__header">
                        <span className="entry-card__label">Experience #{i + 1}</span>
                        <button type="button" className="entry-remove-btn" onClick={() => removeWork(i)}>
                          <FiX size={16} />
                        </button>
                      </div>
                      <div className="entry-card__grid">
                        <div className="form-group">
                          <label className="form-label form-label--sm">Company</label>
                          <input className="form-input" placeholder="Company name" value={w.company}
                            onChange={(e) => updateWork(i, "company", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label form-label--sm">Job Title</label>
                          <input className="form-input" placeholder="e.g. Frontend Developer" value={w.title}
                            onChange={(e) => updateWork(i, "title", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label form-label--sm">From</label>
                          <input className="form-input" placeholder="e.g. 2021" value={w.from}
                            onChange={(e) => updateWork(i, "from", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label form-label--sm">To</label>
                          <input className="form-input" placeholder="e.g. Present" value={w.to}
                            onChange={(e) => updateWork(i, "to", e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label form-label--sm">Description</label>
                        <textarea className="form-input form-textarea" rows={2}
                          placeholder="What did you do there?" value={w.description}
                          onChange={(e) => updateWork(i, "description", e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="add-entry-btn" onClick={addWork}>
                    <FiPlus size={14} /> Add Work Experience
                  </button>
                </div>
              </div>

              {/* ⑤ Portfolio */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="section-heading">
                    <FiImage size={16} />
                    <h3 className="section-heading__title">Portfolio</h3>
                  </div>
                </div>
                <div className="profile-form">
                  {sellerForm.portfolio.map((p, i) => (
                    <div key={i} className="entry-card">
                      <div className="entry-card__header">
                        <span className="entry-card__label">Project #{i + 1}</span>
                        <button type="button" className="entry-remove-btn" onClick={() => removePortfolio(i)}>
                          <FiX size={16} />
                        </button>
                      </div>
                      <div className="entry-card__grid">
                        <div className="form-group">
                          <label className="form-label form-label--sm">Title</label>
                          <input className="form-input" placeholder="Project name" value={p.title}
                            onChange={(e) => updatePortfolio(i, "title", e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label form-label--sm">Live Link</label>
                          <input className="form-input" placeholder="https://..." value={p.link}
                            onChange={(e) => updatePortfolio(i, "link", e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label form-label--sm">Image URL</label>
                        <input className="form-input" placeholder="https://cloudinary.com/..." value={p.image}
                          onChange={(e) => updatePortfolio(i, "image", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label form-label--sm">Description</label>
                        <textarea className="form-input form-textarea" rows={2}
                          placeholder="Describe this project..." value={p.description}
                          onChange={(e) => updatePortfolio(i, "description", e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="add-entry-btn" onClick={addPortfolio}>
                    <FiPlus size={14} /> Add Portfolio Item
                  </button>
                </div>
              </div>

              {/* ⑥ Education */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="section-heading">
                    <FiBookOpen size={16} />
                    <h3 className="section-heading__title">Education</h3>
                  </div>
                </div>
                <div className="profile-form">
                  {sellerForm.education.map((e, i) => (
                    <div key={i} className="entry-card">
                      <div className="entry-card__header">
                        <span className="entry-card__label">Education #{i + 1}</span>
                        <button type="button" className="entry-remove-btn" onClick={() => removeEdu(i)}>
                          <FiX size={16} />
                        </button>
                      </div>
                      <div className="entry-card__grid">
                        <div className="form-group">
                          <label className="form-label form-label--sm">Institution</label>
                          <input className="form-input" placeholder="University / College" value={e.institution}
                            onChange={(ev) => updateEdu(i, "institution", ev.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label form-label--sm">Degree</label>
                          <input className="form-input" placeholder="e.g. BS Computer Science" value={e.degree}
                            onChange={(ev) => updateEdu(i, "degree", ev.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label form-label--sm">Major</label>
                          <input className="form-input" placeholder="e.g. Software Engineering" value={e.major}
                            onChange={(ev) => updateEdu(i, "major", ev.target.value)} />
                        </div>
                        <div className="entry-card__grid entry-card__grid--half">
                          <div className="form-group">
                            <label className="form-label form-label--sm">From</label>
                            <input className="form-input" placeholder="2019" value={e.from}
                              onChange={(ev) => updateEdu(i, "from", ev.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label form-label--sm">To</label>
                            <input className="form-input" placeholder="2023" value={e.to}
                              onChange={(ev) => updateEdu(i, "to", ev.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="add-entry-btn" onClick={addEdu}>
                    <FiPlus size={14} /> Add Education
                  </button>
                </div>
              </div>

              {/* ⑦ Certifications */}
              <div className="profile-card">
                <div className="profile-card-header">
                  <div className="section-heading">
                    <FiAward size={16} />
                    <h3 className="section-heading__title">Certifications</h3>
                  </div>
                </div>
                <div className="profile-form">
                  {sellerForm.certifications.map((c, i) => (
                    <div key={i} className="entry-card entry-card--cert">
                      <div className="form-group">
                        <label className="form-label form-label--sm">Certification Name</label>
                        <input className="form-input" placeholder="e.g. AWS Certified Developer" value={c.name}
                          onChange={(e) => updateCert(i, "name", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label form-label--sm">Issued By</label>
                        <input className="form-input" placeholder="e.g. Amazon" value={c.issuedBy}
                          onChange={(e) => updateCert(i, "issuedBy", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label form-label--sm">Year</label>
                        <input className="form-input" placeholder="2023" value={c.year}
                          onChange={(e) => updateCert(i, "year", e.target.value)} />
                      </div>
                      <button type="button" className="entry-remove-btn entry-remove-btn--self" onClick={() => removeCert(i)}>
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-entry-btn" onClick={addCert}>
                    <FiPlus size={14} /> Add Certification
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="seller-form-footer">
                <button type="submit" className="btn btn-primary seller-save-btn" disabled={updatingSeller}>
                  {updatingSeller
                    ? <><FiLoader className="btn-spinner" size={15} /> Saving...</>
                    : <><FiSave size={15} /> Save Seller Profile</>}
                </button>
              </div>

            </form>
          )}

          {/* ── Password ── */}
          {activeTab === "password" && (
            <div className="profile-card">
              <div className="profile-card-header">
                <h2 className="profile-card-title">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordSubmit} className="profile-form">
                {[
                  { key: "currentPassword", label: "Current Password", placeholder: "Enter current password" },
                  { key: "newPassword",      label: "New Password",     placeholder: "Min 6 characters"      },
                  { key: "confirmPassword",  label: "Confirm New Password", placeholder: "Repeat new password" },
                ].map(({ key, label, placeholder }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label}</label>
                    <input
                      type="password"
                      value={passwordForm[key]}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                      className={`form-input ${passwordErrors[key] ? "error" : ""}`}
                      placeholder={placeholder}
                    />
                    {passwordErrors[key] && (
                      <span className="form-error">{passwordErrors[key]}</span>
                    )}
                  </div>
                ))}
                <div className="profile-form-actions">
                  <button type="submit" className="btn btn-primary">Update Password</button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EditProfile;