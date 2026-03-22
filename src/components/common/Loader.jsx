import "./Loader.css";

const Loader = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className="spinner" />
      </div>
    );
  }

  return <div className="spinner" />;
};

export default Loader;