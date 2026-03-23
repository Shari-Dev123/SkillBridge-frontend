import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingBag, FiBriefcase, FiLoader } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext.jsx";
import { registerApi } from "../../api/authApi.js";
import toast from "react-hot-toast";
import "./Auth.css";

const ROLES = [
  {
    value: "buyer",
    label: "I'm a Buyer",
    desc:  "Hire freelancers",
    Icon:  FiShoppingBag,
  },
  {
    value: "seller",
    label: "I'm a Seller",
    desc:  "Offer services",
    Icon:  FiBriefcase,
  },
];

const Register = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const [formData, setFormData] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "",
    role:            "buyer",
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name)    newErrors.name    = "Name is required";
    if (!formData.email)   newErrors.email   = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      const data = await registerApi(submitData);
      login(data.user, data.token);
      toast.success("Account created successfully!");
      navigate(data.user.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    { name: "name",            label: "Full Name",        type: "text",     placeholder: "John Doe"             },
    { name: "email",           label: "Email",            type: "email",    placeholder: "you@example.com"      },
    { name: "password",        label: "Password",         type: "password", placeholder: "Min 6 characters"     },
    { name: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Repeat your password" },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Skill<span>Bridge</span>
          </Link>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          {ROLES.map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              className={`role-btn ${formData.role === value ? "active" : ""}`}
              onClick={() => setFormData({ ...formData, role: value })}
            >
              <Icon size={20} className="role-icon" />
              <span className="role-label">{label}</span>
              <span className="role-desc">{desc}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {FIELDS.map(({ name, label, type, placeholder }) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`form-input ${errors[name] ? "error" : ""}`}
              />
              {errors[name] && (
                <span className="form-error">{errors[name]}</span>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <><FiLoader className="btn-spinner" size={16} /> Creating account...</>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="auth-terms">
          By joining, you agree to our{" "}
          <Link to="/terms" className="auth-link">Terms of Service</Link>{" "}and{" "}
          <Link to="/privacy" className="auth-link">Privacy Policy</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;