import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Home, Search, FileText, User, Bell, Menu,
  Upload, Calculator, Shield, Users, LogIn, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationsPanel } from './NotificationsPanel';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { role, authenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/auth?mode=signin');
    window.location.reload(); // Force reload to clear state
  };

  // Main navigation items (always visible)
  const mainNavItems = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/scholarships', icon: Search, label: 'Scholarships' },
    { path: '/applications', icon: FileText, label: 'Applications' },
    { path: '/eligibility', icon: Calculator, label: 'Eligibility' },
    { path: '/onboarding', icon: Upload, label: 'OCR Upload' },
  ];

  // Profile and settings
  const profileItems = [
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  // Role-based items
  const adminItems = role === 'admin' ? [
    { path: '/admin', icon: Shield, label: 'Admin Dashboard' },
  ] : [];

  const mentorItems = role === 'mentor' ? [
    { path: '/mentor', icon: Users, label: 'Mentor Dashboard' },
  ] : [];

  // Combine all navigation items
  const allNavItems = [
    ...mainNavItems,
    ...profileItems,
    ...adminItems,
    ...mentorItems,
  ];

  const NavLink = ({ item, onClick }: { item: typeof allNavItems[0]; onClick?: () => void }) => (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        isActive(item.path)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <item.icon className="h-5 w-5" />
      {item.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">
              ScholarMatch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            
            {authenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            )}

            {/* Desktop: User Menu */}
            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {profileItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {adminItems.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {adminItems.map((item) => (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  {mentorItems.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {mentorItems.map((item) => (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link to={item.path} className="flex items-center gap-2 cursor-pointer">
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2"
                onClick={() => navigate('/auth?mode=signin')}
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden lg:inline">Sign In</span>
              </Button>
            )}

            {/* Mobile: Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  {allNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      item={item}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                  {authenticated ? (
                    <>
                      <div className="pt-4 border-t border-border mt-4">
                        <button
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all"
                        >
                          <LogOut className="h-5 w-5" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-4 border-t border-border mt-4">
                      <Link
                        to="/auth?mode=signin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 w-full transition-all"
                      >
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </Link>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {notificationsOpen && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setNotificationsOpen(false)}
            />
            <NotificationsPanel onClose={() => setNotificationsOpen(false)} />
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
