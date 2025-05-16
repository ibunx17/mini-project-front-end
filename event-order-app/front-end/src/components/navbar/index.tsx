"use client";

import Link from "next/link";
import { deleteCookie } from "cookies-next";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { IUserParam } from "@/interface/user.interface";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

const Navbar = () => {
  const [user, setUser] = useState<IUserParam | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reload, setReload] = useState(false);
  const categories = useAppSelector((state) => state.event.categories);
  const locations = useAppSelector((state) => state.event.locations);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") || "";
  const [search, setSearch] = useState(keywordFromUrl);
  const refreshUser = () => setReload((prev) => !prev);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
  }, [reload]);

  const handleLogout = () => {
    deleteCookie("access_token");
    localStorage.removeItem("user");
    toast.success("Log out successfully");
    refreshUser();
    router.refresh();
  };

  useEffect(() => {
    setSearch(keywordFromUrl);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [keywordFromUrl]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearchAuto(search);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSearchAuto = async (query: string) => {
    try {
      if (query)
        router.push(`/homepage?keyword=${encodeURIComponent(query)}`);
      else {
        router.push("/");
      }
    } catch (err) {
      toast.error("Gagal mencari data");
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    router.push(`/homepage?keyword=${encodeURIComponent(search)}`);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("navbar-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-0 py-0 shadow-lg backdrop-blur-lg border-b border-sky-400/40 bg-slate-700">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 py-2 px-12">
        {/* Logo */}
        <Link
          href="/"
          className="text-stone-100 text-3xl font-extrabold tracking-tight flex items-center gap-2"
        >
          <span className="bg-stone-100 rounded-full w-10 h-10 flex items-center justify-center text-sky-500 font-black text-2xl shadow mr-2">
            T
          </span>
          <span className="text-sky-400 font-bold">Tiketin</span>
          <span className="font-light text-stone-100">.com</span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:w-auto flex justify-center items-center py-2"
        >
          <div className="relative w-full max-w-[400px]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari event seru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-xl text-gray-900 border border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400 w-full bg-stone-100 shadow-sm transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-700 transition"
              aria-label="Cari"
            >
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </form>

        {/* User / Auth Buttons */}
        <div className="flex items-center gap-4 text-white relative self-end md:self-auto">
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                href="/register"
                className="border-2 border-sky-400 px-4 py-2 rounded-xl w-[110px] text-center hover:bg-sky-400 hover:text-white transition font-semibold"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="border-2 border-sky-400 px-4 py-2 rounded-xl w-[110px] text-center bg-sky-400 text-white hover:bg-sky-500 transition font-semibold"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="relative" id="navbar-dropdown">
              <button
                className="flex items-center gap-2 cursor-pointer focus:outline-none"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="User menu"
              >
                <img
                  src={
                    user.profile_picture?.startsWith("http")
                      ? user.profile_picture
                      : `${process.env.NEXT_PUBLIC_API_URL}/${
                          user.profile_picture ||
                          "Profile_avatar_placeholder_large.png"
                        }`
                  }
                  alt="profile"
                  className="w-10 h-10 rounded-full border-2 border-sky-400 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/Profile_avatar_placeholder_large.png";
                  }}
                />
                <span className="font-bold hidden sm:inline text-lg">
                  {user.first_name}
                </span>
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl z-50 text-slate-700 border border-sky-100 animate-fade-in">
                  {user.role === "event_organizer" ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="block w-full text-left px-4 py-2 hover:bg-sky-50 rounded-t-xl transition"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        className="block w-full text-left px-4 py-2 hover:bg-sky-50 transition"
                      >
                        Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/transaction/detail"
                        className="block w-full text-left px-4 py-2 hover:bg-sky-50 transition"
                      >
                        Transactions
                      </Link>
                      <Link
                        href="/profile"
                        className="block w-full text-left px-4 py-2 hover:bg-sky-50 transition"
                      >
                        Profile
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-sky-50 rounded-b-xl transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
