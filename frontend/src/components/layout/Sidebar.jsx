import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiUsers, FiFolder, FiCheckSquare,
  FiBarChart2, FiFileText, FiSettings, FiLogOut, FiLayers,
  FiGrid, FiUser,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/kanban', icon: FiGrid, label: 'Kanban Board', roles: ['admin', 'manager', 'employee'] },
    { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
    { to: '/projects', icon: FiFolder, label: 'Projects' },
    ...(isManager ? [{ to: '/employees', icon: FiUsers, label: 'Employees' }] : []),
    ...(isAdmin ? [
      { to: '/departments', icon: FiLayers, label: 'Departments' },
      { to: '/users', icon: FiUser, label: 'Users' },
    ] : []),
    ...(isManager ? [
      { to: '/reports', icon: FiFileText, label: 'Reports' },
      { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    ] : []),
    { to: '/profile', icon: FiSettings, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar-light dark:bg-sidebar-dark text-white transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center font-bold text-lg">EW</div>
              <div>
                <h1 className="font-bold text-sm leading-tight">Enterprise</h1>
                <p className="text-xs text-gray-400">Workforce Management</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition">
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
