import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PriorityBadge } from '../components/Badge';
import { formatDate } from '../utils/helpers';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'border-gray-300' },
  { id: 'in-progress', title: 'In Progress', color: 'border-blue-400' },
  { id: 'review', title: 'Review', color: 'border-yellow-400' },
  { id: 'completed', title: 'Completed', color: 'border-green-400' },
];

const Kanban = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(searchParams.get('project') || '');
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then((res) => {
      setProjects(res.data.data);
      if (!selectedProject && res.data.data.length > 0) {
        setSelectedProject(res.data.data[0]._id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProject) { setLoading(false); return; }
    setLoading(true);
    api.get(`/tasks/kanban/${selectedProject}`).then((res) => {
      setColumns(res.data.data);
    }).finally(() => setLoading(false));
  }, [selectedProject]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = { ...columns };
    const sourceCol = [...(newColumns[source.droppableId] || [])];
    const destCol = source.droppableId === destination.droppableId ? sourceCol : [...(newColumns[destination.droppableId] || [])];

    const [moved] = sourceCol.splice(source.index, 1);
    moved.status = destination.droppableId;
    destCol.splice(destination.index, 0, moved);

    newColumns[source.droppableId] = source.droppableId === destination.droppableId ? destCol : sourceCol;
    newColumns[destination.droppableId] = destCol;
    setColumns(newColumns);

    const updates = [];
    Object.entries(newColumns).forEach(([status, tasks]) => {
      tasks.forEach((task, index) => updates.push({ id: task._id, status, order: index }));
    });

    try {
      await api.put(`/tasks/kanban/${selectedProject}/bulk`, { updates });
    } catch {
      toast.error('Failed to update task');
      api.get(`/tasks/kanban/${selectedProject}`).then((res) => setColumns(res.data.data));
    }
  };

  if (loading && !selectedProject) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select className="input-field w-64" value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
          <option value="">Select Project</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      {!selectedProject ? (
        <div className="card text-center py-12 text-gray-500">Select a project to view Kanban board</div>
      ) : loading ? (
        <LoadingSpinner />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className={`bg-gray-100 dark:bg-gray-900 rounded-xl p-3 border-t-4 ${col.color}`}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-sm">{col.title}</h3>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{(columns[col.id] || []).length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`min-h-[200px] space-y-2 transition ${snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/10 rounded-lg' : ''}`}>
                      {(columns[col.id] || []).map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`card p-3 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                            >
                              <p className="font-medium text-sm mb-2">{task.title}</p>
                              <div className="flex items-center justify-between">
                                <PriorityBadge priority={task.priority} />
                                {task.dueDate && <span className="text-[10px] text-gray-400">{formatDate(task.dueDate)}</span>}
                              </div>
                              {task.assignedTo && (
                                <div className="flex items-center gap-1 mt-2">
                                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-[8px] font-bold text-primary-600">
                                    {task.assignedTo.firstName?.[0]}
                                  </div>
                                  <span className="text-[10px] text-gray-500">{task.assignedTo.firstName}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default Kanban;
