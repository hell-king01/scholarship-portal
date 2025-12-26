import { Link, useLocation } from 'react-router-dom';
import { Home, Search, FileText, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/scholarships', icon: Search, label: 'Search' },
  { path: '/applications', icon: FileText, label: 'Track' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'scale-110' : ''}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
