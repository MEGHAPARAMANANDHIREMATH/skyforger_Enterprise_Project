import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiFolder, FiCheckSquare, FiLayers, FiClock } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { CardSkeleton } from '../components/Skeleton';
import { StatusBadge } from '../components/Badge';
import { formatDateTime, capitalize } from '../utils/helpers';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user, isEmployee } = useAuth();
  const [data, setData] = useState(null);
  const [empData, setEmpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, empRes] = await Promise.all([
          api.get('/dashboard/stats'),
          isEmployee ? api.get('/dashboard/employee') : Promise.resolve(null),
        ]);
        setData(statsRes.data.data);
        if (empRes) setEmpData(empRes.data.data);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isEmployee]);

  if (loading) return <CardSkeleton count={4} />;

  const stats = data?.stats || {};

  const statusChart = {
    labels: data?.tasksByStatus?.map((s) => capitalize(s._id)) || [],
    datasets: [{ data: data?.tasksByStatus?.map((s) => s.count) || [], backgroundColor: ['#9ca3af', '#3b82f6', '#eab308', '#22c55e'], borderWidth: 0 }],
  };

  const monthlyChart = {
    labels: data?.monthlyTasks?.map((m) => m._id) || [],
    datasets: [
      { label: 'Created', data: data?.monthlyTasks?.map((m) => m.created) || [], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.4 },
      { label: 'Completed', data: data?.monthlyTasks?.map((m) => m.completed) || [], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.4 },
    ],
  };

  const productivityChart = {
    labels: data?.employeeProductivity?.map((e) => `${e.firstName} ${e.lastName}`) || [],
    datasets: [{ label: 'Productivity %', data: data?.employeeProductivity?.map((e) => e.productivityScore) || [], backgroundColor: '#6366f1', borderRadius: 6 }],
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-gray-500">Here's what's happening in your organization today.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats.totalEmployees || 0} icon={FiUsers} color="bg-blue-500" index={0} />
        <StatCard title="Active Projects" value={stats.activeProjects || 0} icon={FiFolder} color="bg-green-500" index={1} />
        <StatCard title="Completed Projects" value={stats.completedProjects || 0} icon={FiLayers} color="bg-purple-500" index={2} />
        <StatCard title="Pending Tasks" value={stats.pendingTasks || 0} icon={FiCheckSquare} color="bg-orange-500" index={3} />
      </div>

      {isEmployee && empData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center"><p className="text-sm text-gray-500">My Completed</p><p className="text-2xl font-bold text-green-600">{empData.stats.completed}</p></div>
          <div className="card text-center"><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold text-blue-600">{empData.stats.inProgress}</p></div>
          <div className="card text-center"><p className="text-sm text-gray-500">Productivity</p><p className="text-2xl font-bold text-primary-600">{empData.stats.productivityScore}%</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Tasks by Status</h3>
          <div className="h-64 flex items-center justify-center">
            {data?.tasksByStatus?.length > 0 ? <Doughnut data={statusChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /> : <p className="text-gray-500">No data</p>}
          </div>
        </div>
        <div className="card lg:col-span-2">
          <h3 className="font-semibold mb-4">Monthly Task Activity</h3>
          <div className="h-64">
            {data?.monthlyTasks?.length > 0 ? <Line data={monthlyChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} /> : <p className="text-gray-500 text-center pt-20">No data</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Top Performers</h3>
          <div className="h-64">
            {data?.employeeProductivity?.length > 0 ? <Bar data={productivityChart} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} /> : <p className="text-gray-500 text-center pt-20">No data</p>}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activities</h3>
            <Link to="/tasks" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data?.recentActivities?.map((task) => (
              <Link key={task._id} to={`/tasks/${task._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg"><FiClock size={14} className="text-primary-600" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.project?.name} · {formatDateTime(task.updatedAt)}</p>
                </div>
                <StatusBadge status={task.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Project Progress</h3>
        <div className="space-y-4">
          {data?.projectProgress?.map((p) => (
            <div key={p._id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{p.name}</span>
                <span className="text-gray-500">{p.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
