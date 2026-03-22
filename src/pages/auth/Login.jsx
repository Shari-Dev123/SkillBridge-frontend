import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { loginApi } from "../../api/authApi.js";
import toast from "react-hot-toast";
import "./Auth.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi(formData);
      login(data.user, data.token);
      toast.success("Welcome back!");

      if (data.user.role === "admin") {
  navigate("/admin");
} else if (data.user.role === "seller") {
  navigate("/seller/dashboard");
} else {
  navigate("/buyer/dashboard");
}
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            Skill<span>Bridge</span>
          </Link>
          <h1 className="auth-title">Sign in to your account</h1>
          <p className="auth-subtitle">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Join now
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`form-input ${errors.email ? "error" : ""}`}
            />
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`form-input ${errors.password ? "error" : ""}`}
            />
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue as</span>
        </div>

        {/* Demo accounts */}
        <div className="auth-demo">
          <button
            className="btn btn-outline btn-sm"
            onClick={() =>
              setFormData({
                email: "buyer@demo.com",
                password: "123456",
              })
            }
          >
            Demo Buyer
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() =>
              setFormData({
                email: "seller@demo.com",
                password: "123456",
              })
            }
          >
            Demo Seller
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;