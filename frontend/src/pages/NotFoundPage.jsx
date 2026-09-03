import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  useEffect(() => {
    document.title = "404 Page Not Found";
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-24 px-[5%] flex flex-col justify-center items-center text-center">
      <h1 className="text-8xl font-black text-[#f5a623] mb-4">404</h1>
      <h2 className="text-3xl font-extrabold text-white mb-2">
        Page Not Found
      </h2>
      <p className="text-slate-400 max-w-md mb-8 text-base">
        The requested URL or resource does not exist or has been removed from
        the Portfolio system.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#2b4b9b] text-white font-bold text-sm hover:bg-[#3a5cb0] transition-all shadow-lg shadow-[#2b4b9b]/40"
      >
        <Home size={18} /> Back to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
