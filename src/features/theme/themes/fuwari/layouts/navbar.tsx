import { Link, useRouteContext } from "@tanstack/react-router";
import { Home, Menu, Search, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";
import { m } from "@/paraglide/messages";
import { LanguageSwitcher } from "./language-switcher";

interface NavbarProps {
  navOptions: Array<NavOption>;
  onMenuClick: () => void;
  isLoading?: boolean;
  user?: UserInfo;
  bannerHeightVh: number;
}

const NAVBAR_HEIGHT_REM = 4.5;
const MAIN_OVERLAP_REM = 3.5;

export function Navbar({
  onMenuClick,
  user,
  navOptions,
  isLoading,
  bannerHeightVh,
}: NavbarProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate threshold based on banner height and layout
      const bannerHeightPx = window.innerHeight * (bannerHeightVh / 100);
      const navbarHeightPx = NAVBAR_HEIGHT_REM * 16;
      const mainOverlapPx = MAIN_OVERLAP_REM * 16;
      const extraPaddingPx = 16;

      const threshold =
        bannerHeightPx - navbarHeightPx - mainOverlapPx - extraPaddingPx;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      setIsHidden(scrollTop >= threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [bannerHeightVh]);

  return (
    <div
      id="fuwari-navbar-wrapper"
      className={`z-50 sticky top-0 transition-all duration-300 ease-in-out ${
        isHidden
          ? "-translate-y-16 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
    >
      <div
        id="fuwari-navbar"
        className="anime-onload"
        style={{ animationDelay: "0ms" }}
      >
        <div className="anime-glass rounded-t-none! mx-auto flex items-center justify-between px-4 h-18 max-w-(--fuwari-page-width)"
          style={{ borderRadius: "0 0 var(--anime-radius) var(--anime-radius)" }}>
          <Link
            to="/"
            className="anime-btn-ripple rounded-lg h-13 px-5 font-bold active:scale-95 flex items-center transition-all duration-200 hover:text-(--anime-sakura-deep)"
          >
            <Home
              size={28}
              strokeWidth={1.5}
              className="text-(--anime-sakura) mr-2 shrink-0"
            />
            <span className="text-(--anime-sakura) text-base">
              {siteConfig.title}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navOptions.map((option) => {
              const className =
                "anime-btn-ripple rounded-lg h-11 font-bold px-5 active:scale-95 flex items-center fuwari-text-75 hover:text-(--anime-sakura) transition-all duration-200";
              if (option.external) {
                return (
                  <a
                    key={option.id}
                    href={option.to}
                    target={option.openInNewTab ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {option.label}
                  </a>
                );
              }
              return (
                <Link
                  key={option.id}
                  to={option.to}
                  className={className}
                  activeProps={{
                    className: "!text-[var(--anime-sakura)]",
                  }}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              to="/search"
              className="hidden lg:flex items-center h-11 mr-2 rounded-lg bg-black/3 hover:bg-black/5 dark:bg-white/4 dark:hover:bg-white/8 transition-all active:scale-95 group w-52"
              aria-label={m.nav_search()}
            >
              <Search
                size={18}
                className="ml-3 transition-colors text-black/30 dark:text-white/30 group-hover:text-(--anime-sakura)"
                strokeWidth={1.25}
              />
              <span className="ml-2 text-black/50 dark:text-white/50 text-sm bg-transparent outline-none truncate">
                {m.nav_search()}
              </span>
            </Link>
            <Link
              to="/search"
              className="lg:hidden anime-btn-ripple rounded-lg h-11 w-11 flex items-center justify-center active:scale-90 fuwari-text-75 hover:text-(--anime-sakura) transition-all duration-200"
              aria-label={m.nav_search()}
            >
              <Search size={18} strokeWidth={1.25} />
            </Link>
            <ThemeToggle className="anime-btn-ripple rounded-lg h-11 w-11 flex items-center justify-center active:scale-90 fuwari-text-75 hover:text-(--anime-sakura) transition-all duration-200 p-0! bg-transparent! [&_svg]:w-4.5! [&_svg]:h-4.5! [&_div]:w-auto! [&_div]:h-auto!" />
            <LanguageSwitcher className="anime-btn-ripple rounded-lg h-11 w-11 flex items-center justify-center active:scale-90 fuwari-text-75 hover:text-(--anime-sakura) transition-all duration-200 p-0! bg-transparent! [&_svg]:w-4.5! [&_svg]:h-4.5!" />
            <div className="hidden md:flex items-center">
              {isLoading ? (
                <Skeleton className="w-9 h-9 rounded-lg" />
              ) : user ? (
                <Link
                  to="/profile"
                  className="anime-btn-ripple rounded-lg h-11 w-11 flex items-center justify-center active:scale-90 transition-all duration-200"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-8 h-8 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-(--fuwari-btn-regular-bg) flex items-center justify-center rounded-md">
                      <UserIcon
                        size={18}
                        strokeWidth={1.25}
                        className="fuwari-text-50"
                      />
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="anime-btn-ripple rounded-lg h-11 w-11 flex items-center justify-center active:scale-90 fuwari-text-75 hover:text-(--anime-sakura) transition-all duration-200"
                  aria-label={m.nav_login()}
                >
                  <UserIcon size={18} strokeWidth={1.25} />
                </Link>
              )}
            </div>
            <button
              className="anime-btn-ripple rounded-lg w-11 h-11 flex items-center justify-center active:scale-90 md:hidden fuwari-text-75 hover:text-(--anime-sakura) transition-all duration-200"
              onClick={onMenuClick}
              aria-label={m.common_open_menu()}
              type="button"
            >
              <Menu size={18} strokeWidth={1.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
