import { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { capitalize } from '../utils/helpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <CardSkeleton count={2} />;

  const priorityChart = {
    labels: data?.tasksByPriority?.map((p) => capitalize(p._id)) || [],
    datasets: [{ data: data?.tasksByPriority?.map((p) => p.count) || [], backgroundColor: ['#9ca3af', '#3b82f6', '#f97316', '#ef4444'] }],
  };

  const monthlyChart = {
    labels: data?.monthlyTasks?.map((m) => m._id) || [],
    datasets: [
      { label: 'Created', data: data?.monthlyTasks?.map((m) => m.created) || [], backgroundColor: '#6366f1', borderRadius: 4 },
      { label: 'Completed', data: data?.monthlyTasks?.map((m) => m.completed) || [], backgroundColor: '#22c55e', borderRadius: 4 },
    ],
  };

  const productivityChart = {
    labels: data?.employeeProductivity?.map((e) => `${e.firstName} ${e.lastName}`) || [],
    datasets: [
      { label: 'Productivity Score', data: data?.employeeProductivity?.map((e) => e.productivityScore) || [], backgroundColor: '#8b5cf6', borderRadius: 6 },
      { label: 'Tasks Completed', data: data?.employeeProductivity?.map((e) => e.tasksCompleted) || [], backgroundColor: '#06b6d4', borderRadius: 6 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Employees', value: data?.stats?.totalEmployees },
          { label: 'Active Projects', value: data?.stats?.activeProjects },
          { label: 'Pending Tasks', value: data?.stats?.pendingTasks },
          { label: 'Completed Tasks', value: data?.stats?.completedTasks },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{s.value || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Tasks by Priority</h3>
          <div className="h-72 flex items-center justify-center">
            <Doughnut data={priorityChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Monthly Task Trends</h3>
          <div className="h-72">
            <Bar data={monthlyChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Employee Productivity Comparison</h3>
        <div className="h-80">
          <Bar data={productivityChart} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }} />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Project Progress Overview</h3>
        <div className="space-y-4">
          {data?.projectProgress?.map((p) => (
            <div key={p._id}>
              <div className="flex justify-between text-sm mb-1"><span>{p.name}</span><span className="capitalize">{p.status} · {p.progress}%</span></div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-2.5 rounded-full" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
