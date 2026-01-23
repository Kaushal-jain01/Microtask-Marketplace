import { NavLink, Outlet, useLocation, matchPath } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle,
  History,
  LogOut,
  User
} from 'lucide-react';
import '../styles/DashboardLayout.css';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const workerLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Claimed Tasks', path: '/dashboard/claimed', icon: ClipboardList },
    { label: 'Completed Tasks', path: '/dashboard/completed', icon: CheckCircle },
    { label: 'History', path: '/dashboard/history', icon: History },
  ];

  const businessLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Posted Tasks', path: '/dashboard/posted', icon: ClipboardList },
    { label: 'History', path: '/dashboard/history', icon: History },
  ];

  const links = user?.role === 'worker' ? workerLinks : businessLinks;

  // Add all route labels here, including dynamic ones
  const routeTitles = [
    ...links,
    { path: '/tasks/create', label: 'Create Task' },
    { path: '/tasks/detail/:id', label: 'Task Details' },
  ];

  // Find label based on current location
  const pageTitle =
    routeTitles.find(route =>
      matchPath({ path: route.path, end: true }, location.pathname)
    )?.label || 'Dashboard';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">TaskFlow</div>

        <nav className="sidebar-nav">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              className={({ isActive }) =>
                isActive ? 'sidebar-link active' : 'sidebar-link'
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main section */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="topbar">
          <h2 className="page-title">{pageTitle}</h2>

          <div className="profile-section">
            <div className="profile">
              <User size={18} />
              <div className="profile-info">
                <span className="name">{user?.username || 'User'}</span>
                <span className="role">{user?.role}</span>
              </div>
            </div>

            <button className="logout-btn" onClick={logout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
