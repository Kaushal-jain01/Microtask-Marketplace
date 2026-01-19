import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarLinks = user?.role === 'worker'
    ? [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Claimed Tasks', path: '/dashboard/claimed' },
        { label: 'Completed Tasks', path: '/dashboard/completed' },
        { label: 'History', path: '/dashboard/history' },
      ]
    : [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Posted Tasks', path: '/dashboard/posted' },
        { label: 'History', path: '/dashboard/history' },
      ];

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        {/* Sidebar */}
        <div className="col-2 bg-light p-3 d-flex flex-column border-end">
          <h5 className="mb-4 fw-bold">Dashboard</h5>

          {sidebarLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`mb-2 text-decoration-none ${
                location.pathname === link.path
                  ? 'fw-bold text-primary'
                  : 'text-dark'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            className="btn btn-outline-danger mt-auto"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="col-10 p-4 overflow-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
