import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../public/acchu_logo.png';
//import HeartbeatLoader  from './HeartbeatLoader';
import {
  LayoutDashboard,
  Database,
  Users,
  Bell,
  Syringe,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Heart,
  Search,
} from 'lucide-react';

interface User {
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
  children?: Array<{ name: string; href: string }>;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // Desktop collapse
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState<{ [key: string]: boolean }>({});
  const { user, logout } = useAuth() as AuthContextType;
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Masters', href: '/masters', icon: Database },
    { name: 'User Management', href: '/user-management', icon: Users },
    {
      name: 'Malaria',
      href: '/notifications',
      icon: Bell,
      hasSubmenu: true,
      children: [
        { name: 'Malaria Listing', href: '/malaria-listing' },
        { name: 'New Notification Entry', href: '/notifications'},
      ],
    },
    {
      name: 'Vaccination',
      icon: Syringe,
      hasSubmenu: true,
      children: [
        { name: 'Vaccination Reporting Form', href: '/vaccin-report' },
        { name: 'Vaccination Listing Search', href: '/vaccination-listing' },
      ],
    },
    {
      name: 'Reporting',
      icon: FileText,
      hasSubmenu: true,
      children: [
        { name: 'Vaccination Report', href: '/vaccination-report' },
        { name: 'Malaria Report', href: '/malaria-report' },
      ],
    },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help / Docs', href: '/help', icon: HelpCircle },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    navigation.forEach((item) => {
      if (item.hasSubmenu && item.children?.some(child => child.href && isActive(child.href))) {
        setSubmenuOpen(prev => ({ ...prev, [item.name]: true }));
      }
    });
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-10 via-blue-50 to-indigo-50 leg:from-slate-50 lg:via-blue-100 lg:to-indigo-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 ${
          collapsed ? 'w-20' : 'w-72'
        } bg-white/80 backdrop-blur-xl border-r border-slate-200/60 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between h-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative"
        >
          <div className="relative flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10">

            
            {/* <img src={logo} alt="logo" className="h-8 w-8 " /> */}
            </div>
            {!collapsed && (
              <div>
                <span className="text-xl font-bold text-white">AccuHealth</span>
              
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <Menu className={`h-5 w-5 transform`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
              className="lg:hidden text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-2 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href ? isActive(item.href) : false;
            const submenuVisible = submenuOpen[item.name];

            return (
              <div key={item.name} className="group relative">
                <Link
                  to={item.href ?? '#'}
                  onClick={() => {
                    if (item.hasSubmenu) {
                      setSubmenuOpen((prev) => ({
                        ...prev,
                        [item.name]: !prev[item.name],
                      }));
                    }
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div
                    className={`mr-4 p-2 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-white/20'
                        : 'bg-slate-100 group-hover:bg-white group-hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.name}</span>
                  )}
                  {item.hasSubmenu && !collapsed && (
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                        submenuVisible ? 'rotate-180' : ''
                      } ${active ? 'text-white/80' : 'text-slate-400'}`}
                    />
                  )}
                </Link>

                {/* Tooltip */}
                {collapsed && (
                  <div className="absolute left-full top-2 ml-2 px-2 py-1 rounded bg-slate-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}

                {/* Submenu */}
                {item.hasSubmenu && submenuVisible && !collapsed && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children?.map((child) => {
                      const childActive = child.href ? isActive(child.href) : false;
                      return (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={`block px-4 py-2 text-sm rounded-lg transition-all ${
                            childActive
                              ? 'bg-blue-100 text-blue-800 font-medium'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 mt-16 lg:mt-0 ml-5">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 px-6 flex items-center justify-between mt-10">
          <div className="flex items-center justify-between h-16 w-full">
            <div className="flex items-center mr-20">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {navigation.find(item => item.href && isActive(item.href))?.name || 'Dashboard'}
                </h1>
                <div className="text-sm text-slate-600 mt-1">
                  Welcome back, {user?.name || 'User'}
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center mr-6">
              {/* <div className="hidden md:flex items-center space-x-2 bg-slate-100/80 rounded-xl px-4 py-2.5 min-w-80">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patients, notifications..."
                  className="bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 flex-1"
                />
              </div> */}

              <div className="flex items-center space-x-4 ml-auto">
                <button className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                </button>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 rounded-xl px-4 py-2.5 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium">{user?.name || 'Admin User'}</div>
                      <div className="text-xs text-slate-500">{user?.role || 'Administrator'}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/60 py-2 z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="text-sm font-medium text-slate-900">{user?.name}</div>
                        <div className="text-xs text-slate-500">{user?.email}</div>
                      </div>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 flex-1 overflow-auto">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
