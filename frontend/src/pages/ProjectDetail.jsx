import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { capitalize, formatDate, PROJECT_STATUS_COLORS } from '../utils/helpers';

const ProjectDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${id}`).then((res) => setData(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="card text-center py-12">Project not found</div>;

  const { project, tasks } = data;

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><FiArrowLeft /> Back to Projects</Link>

      <div className="card">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-gray-500 mt-1">{project.description}</p>
            <div className="flex gap-2 mt-3">
              <span className={`badge ${PROJECT_STATUS_COLORS[project.status]}`}>{capitalize(project.status)}</span>
              <PriorityBadge priority={project.priority} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">{project.progress}%</p>
            <p className="text-sm text-gray-500">Complete</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4">
          <div className="bg-primary-600 h-3 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div><p className="text-xs text-gray-500">Start Date</p><p className="font-medium flex items-center gap-1"><FiCalendar size={14} />{formatDate(project.startDate)}</p></div>
          <div><p className="text-xs text-gray-500">End Date</p><p className="font-medium flex items-center gap-1"><FiCalendar size={14} />{formatDate(project.endDate)}</p></div>
          <div><p className="text-xs text-gray-500">Department</p><p className="font-medium">{project.department?.name || 'N/A'}</p></div>
          <div><p className="text-xs text-gray-500">Budget</p><p className="font-medium">${project.budget?.toLocaleString()}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Tasks ({tasks.length})</h3>
            <Link to={`/kanban?project=${id}`} className="text-sm text-primary-600 hover:underline">Open Kanban</Link>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <Link key={task._id} to={`/tasks/${task._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div><p className="font-medium text-sm">{task.title}</p><p className="text-xs text-gray-500">{task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned'}</p></div>
                <div className="flex gap-2"><StatusBadge status={task.status} /><PriorityBadge priority={task.priority} /></div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Team Members</h3>
          <div className="space-y-3">
            {project.teamMembers?.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">{m.firstName?.[0]}</div>
                <div><p className="text-sm font-medium">{m.firstName} {m.lastName}</p><p className="text-xs text-gray-500">{m.position}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
