'use client';
import { useEffect, useState, memo } from "react";
import { useAuth } from '@/context/AuthProvider';
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  MessageSquare,
  LayoutDashboard,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdvancedNotificationDropdown from "@/components/notification/notificationCard";
import useCurrentUser from "@/utils/useCurrentUser";
import AuthGuard from "@/components/authGuard/authGuard";

const DEFAULT_ICON_SIZE = 20;
const DEFAULT_ICON_STROKE_WIDTH = 2;

const sidebarVariants = {
  open: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300,
      damping: 30 
    }
  },
  closed: { 
    x: "-100%", 
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const overlayVariants = {
  open: { 
    opacity: 1, 
    backdropFilter: "blur(4px)",
    transition: { duration: 0.3 }
  },
  closed: { 
    opacity: 0, 
    backdropFilter: "blur(0px)",
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

function ManagerLayout({ children }) {
  const { user, loading: userLoading } = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-white overflow-hidden font-sans">
        {/* Mobile menu button */}
        <motion.button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          whileTap={{ scale: 0.95 }}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </motion.button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-40 shadow-xl"
              >
                <div className="p-5 pb-4 flex items-center justify-center border-b border-gray-200">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center space-x-2"
                  >
                    
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      AttendEase
                    </span>
                  </motion.div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/manager/dashboard" icon={<LayoutDashboard size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Dashboard
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/manager/add-attendance" icon={<Clock size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Mark Attendance
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/manager/leave-requests" icon={<AlertCircle size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Leave Requests
                    </SidebarLink>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarSubMenu
                      title="Tasks Management"
                      icon={<ClipboardList size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}
                      items={[
                        { href: "/manager/tasks/assign", label: "Assign Tasks" },
                        { href: "/manager/tasks/all", label: "View All Tasks" },
                      ]}
                      onLinkClick={() => setMobileMenuOpen(false)}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarSubMenu
                      title="Duty Handover"
                      icon={<Users size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}
                      items={[
                        { href: "/manager/duty/assign", label: "Assign Duty" },
                        { href: "/manager/duty/all-requests", label: "Handover Requests" },
                      ]}
                      onLinkClick={() => setMobileMenuOpen(false)}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <SidebarLink href="/manager/notifications" icon={<MessageSquare size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
                      Notifications
                    </SidebarLink>
                  </motion.div>
                </nav>

                <motion.div 
                  className="p-4 border-t border-gray-200 space-y-2"
                  variants={itemVariants}
                >
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 mr-3 text-gray-500" />
                    Close Menu
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                    Logout
                  </button>
                </motion.div>
              </motion.aside>

              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={overlayVariants}
                className="fixed inset-0  bg-opacity-50 z-30 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-40"
        >
          <div className="p-3 pb-4 flex items-center justify-center border-b border-gray-200">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold"
              >
                AE
              </motion.div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Manager Portal
              </span>
            </motion.div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            <SidebarLink href="/manager/dashboard" icon={<LayoutDashboard size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Dashboard
            </SidebarLink>

            <SidebarLink href="/manager/add-attendance" icon={<Clock size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Mark Attendance
            </SidebarLink>

            <SidebarLink href="/manager/leave-requests" icon={<AlertCircle size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Leave Requests
            </SidebarLink>

            <SidebarSubMenu
              title="Tasks Management"
              icon={<ClipboardList size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}
              items={[
                { href: "/manager/tasks/assign", label: "Assign Tasks" },
                { href: "/manager/tasks/all", label: "View All Tasks" },
              ]}
            />

            <SidebarSubMenu
              title="Duty Handover"
              icon={<Users size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}
              items={[
                { href: "/manager/duty/assign", label: "Assign Duty" },
                { href: "/manager/duty/all-requests", label: "Handover Requests" },
              ]}
            />

            <SidebarLink href="/manager/notifications" icon={<MessageSquare size={DEFAULT_ICON_SIZE} strokeWidth={DEFAULT_ICON_STROKE_WIDTH} />}>
              Notifications
            </SidebarLink>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Logout
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:ml-64 h-full overflow-hidden">
          <header className="bg-white border-b gap-5 border-gray-200 py-3 px-10 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div className="md:hidden">
              {!mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="md:flex  hidden  items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">AE</div>
                  <h1 className="text-lg font-bold text-gray-800">Manager Portal</h1>
                </motion.div>
              )}
            </div>
            <div className="flex-grow"></div>
            <div className="flex items-center space-x-4">
              {userLoading ? (
                <div className="animate-pulse flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-gray-200"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : user ? (
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-500 font-medium">Authentication required</p>
              )}
              <AdvancedNotificationDropdown/>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-50 p-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

const SidebarLink = memo(function SidebarLink({ href, children, icon }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={href}
        className={`flex items-center p-3 rounded-lg transition-all 
          ${isActive 
            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 font-medium shadow-sm"
            : "text-gray-700 hover:bg-gray-50"}`}
      >
        <span className={`mr-3 flex-shrink-0 transition-colors ${
          isActive ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
        }`}>
          {icon}
        </span>
        <span className="text-sm flex-grow">{children}</span>
      </Link>
    </motion.div>
  );
});

const SidebarSubMenu = memo(function SidebarSubMenu({ title, icon, items, onLinkClick }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveItem = items.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    if (hasActiveItem) {
      setIsOpen(true);
    }
  }, [hasActiveItem]);

  return (
    <div className="space-y-1">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors
          ${hasActiveItem 
            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-sm"
            : "text-gray-700 hover:bg-gray-50"}`}
        aria-expanded={isOpen}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center">
          <span className={`mr-3 flex-shrink-0 ${
            hasActiveItem ? "text-blue-500" : "text-gray-500"
          }`}>
            {icon}
          </span>
          <span className="text-sm flex-grow text-left">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: { 
                height: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: { 
                height: { duration: 0.2 },
                opacity: { duration: 0.1 }
              }
            }}
            className="ml-8 space-y-1 border-l-2 border-blue-100 overflow-hidden"
          >
            {items.map((item) => (
              <motion.div
                key={item.href}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`block p-2 pl-4 text-sm rounded-r-lg transition-colors
                    ${pathname.startsWith(item.href) 
                      ? "text-blue-600 font-medium bg-blue-50"
                      : "text-gray-600 hover:bg-gray-100"}`}
                  onClick={onLinkClick}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ManagerLayout;