import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-[#0BC5EA] flex items-center justify-center text-white text-lg font-bold">
            IV
          </div>
          <span className="text-xl font-bold text-[#1A365D] tracking-wide">
            InsuraView
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {["Home", "Features", "Plans", "About Us", "Contact"].map((text) => (
            <Link
              key={text}
              to={`/${text.toLowerCase().replace(/\s+/g, "")}`}
              className="text-base font-medium text-gray-700 hover:text-[#0BC5EA] transition-colors"
            >
              {text}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <button className="bg-[#ED8936] hover:bg-[#dd7c2e] text-white text-sm px-4 py-1.5 rounded-md transition-colors cursor-pointer font-medium">
              Log in
            </button>
          </Link>
          <Link to="/register">
            <button className="hidden md:flex border border-[#1A365D] text-[#1A365D] hover:bg-[#1A365D] hover:text-white transition-colors text-sm px-4 py-1.5 rounded-md cursor-pointer font-medium">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
