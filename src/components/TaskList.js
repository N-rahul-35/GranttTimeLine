import React from "react";
import { Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react";

const TaskList = ({
  tasks,
  onAddSubtask,
  onDeleteTask,
  onDeleteSubtask,
  onToggleCollapse,
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
      {/* Header */}
      <div
        className="p-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm sticky top-0 z-10"
        style={{ height: 48 }}
      >
        Task Name
      </div>

      {/* Task Rows */}
      {tasks.map((task) => (
        <div key={task.id}>
          {/* Parent Task */}
          <div
            className="flex items-center justify-between px-3 border-b border-gray-100 hover:bg-gray-50 transition-shadow shadow-sm"
            style={{ height: 50 }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {task.subtasks.length > 0 && (
                <button
                  onClick={() => onToggleCollapse(task.id)}
                  className="p-1 hover:bg-gray-200 rounded transition"
                  aria-label="Toggle Subtasks"
                >
                  {task.collapsed ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              )}
              <span className="font-medium truncate">{task.name}</span>
            </div>

            <div className="flex gap-1">
              <button
                onClick={() => onAddSubtask(task.id)}
                className="p-1 hover:bg-gray-200 rounded transition"
                title="Add Subtask"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                title="Delete Task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Subtasks */}
          {!task.collapsed &&
            task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center justify-between px-3 pl-10 border-b border-gray-100 hover:bg-gray-50 transition-shadow"
                style={{ height: 44 }}
              >
                <span className="text-sm truncate flex-1 min-w-0">
                  {subtask.name}
                </span>
                <button
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  className="p-1 hover:bg-red-100 text-red-600 rounded transition"
                  title="Delete Subtask"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
