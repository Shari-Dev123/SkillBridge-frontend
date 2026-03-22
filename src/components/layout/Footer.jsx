import { Link } from "react-router-dom";
import {
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiInstagram,
} from "react-icons/fi";
import "./Footer.css";

const CATEGORIES = [
  { label: "Web Development",  to: "/gigs?category=web-development"  },
  { label: "Graphic Design",   to: "/gigs?category=graphic-design"   },
  { label: "Digital Marketing",to: "/gigs?category=digital-marketing" },
  { label: "Writing",          to: "/gigs?category=writing"          },
];

const FOR_SELLERS = [
  { label: "Become a Seller",  to: "/register"              },
  { label: "Create a Gig",     to: "/seller/gigs/create"    },
  { label: "Dashboard",        to: "/seller/dashboard"      },
];

const FOR_BUYERS = [
  { label: "Browse Services",  to: "/gigs"           },
  { label: "My Orders",        to: "/buyer/orders"   },
  { label: "Sign Up",          to: "/register"       },
];

const SOCIALS = [
  { Icon: FiTwitter,  href: "#", label: "Twitter"   },
  { Icon: FiLinkedin, href: "#", label: "LinkedIn"  },
  { Icon: FiGithub,   href: "#", label: "GitHub"    },
  { Icon: FiInstagram,href: "#", label: "Instagram" },
];

const FooterCol = ({ heading, links }) => (
  <div className="footer__col">
    <h4 className="footer__heading">{heading}</h4>
    {links.map(({ label, to }) => (
      <Link key={to + label} to={to}>{label}</Link>
    ))}
  </div>
);

const Footer = () => (
  <footer className="footer">
    <div className="container footer__inner">

      {/* Brand */}
      <div className="footer__brand">
        <Link to="/" className="footer__logo">
          Skill<span>Bridge</span>
        </Link>
        <p className="footer__tagline">
          Find the perfect freelance service for your business
        </p>
        <div className="footer__socials">
          {SOCIALS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="footer__social-btn"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="footer__links">
        <FooterCol heading="Categories"  links={CATEGORIES}  />
        <FooterCol heading="For Sellers" links={FOR_SELLERS} />
        <FooterCol heading="For Buyers"  links={FOR_BUYERS}  />
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="footer__bottom">
      <div className="container footer__bottom-inner">
        <p>© {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        <div className="footer__bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;