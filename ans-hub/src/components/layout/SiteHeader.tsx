import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useFrappeAuth } from "frappe-react-sdk";
import { LogOut } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";

export function SiteHeader() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500 text-white font-bold text-lg">+</div>
          <div className="leading-tight">
            <div className="font-semibold text-base text-gray-900">Localisation Hub</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/news"
            className={`text-sm font-medium transition-colors ${
              isActive("/news") ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            News
          </Link>
          <Link
            to="/events"
            className={`text-sm font-medium transition-colors ${
              isActive("/events") ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            Events
          </Link>
          <Link
            to="/pillars"
            className={`text-sm font-medium transition-colors ${
              isActive("/pillars") ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            Pillars
          </Link>
          <Link
            to="/knowledge"
            className={`text-sm font-medium transition-colors ${
              isActive("/knowledge") ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            Knowledge
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors ${
              isActive("/about") ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 md:inline">
            Sign in
          </Link>
          <Link to="/login">
            <Button size="sm" className="bg-red-500 text-white hover:bg-red-600">
              Join the network
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const navigate = useNavigate();
  const { currentUser } = useFrappeAuth();
  const { logout } = useContext(UserContext);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-500 text-white font-bold text-lg">+</div>
            <div className="font-semibold text-base text-gray-900">The Localisation Hub</div>
          </div>
          <p className="mt-4 max-w-md text-sm text-gray-600">
            A peer-to-peer learning platform supporting African National Societies on the journey toward self-reliance
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-900">Explore</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li><Link to="/news" className="hover:text-red-500">News</Link></li>
            <li><Link to="/events" className="hover:text-red-500">Events</Link></li>
            <li><Link to="/pillars" className="hover:text-red-500">Pillars</Link></li>
            <li><Link to="/knowledge" className="hover:text-red-500">Knowledge</Link></li>
            <li><Link to="/about" className="hover:text-red-500">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-900">Network</div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>10 National Societies</li>
            <li>7 Consortium Partners</li>
            <li><Link to="/login" className="hover:text-red-500">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-gray-600 md:flex-row">
          <div>© 2026 The Localisation Hub</div>
          {currentUser && (
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
