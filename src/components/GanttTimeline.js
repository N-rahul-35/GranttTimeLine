import React, { useState, useRef } from "react";
import { Plus, Download, ZoomIn, ZoomOut } from "lucide-react";
import TaskList from "./TaskList";
import TimelineGrid from "./TimelineGrid";

const GanttTimeline = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Task A",
      start: "2025-12-01",
      end: "2025-12-10",
      collapsed: false,
      subtasks: [
        { id: 11, name: "Subtask A1", start: "2025-12-01", end: "2025-12-05" },
        { id: 12, name: "Subtask A2", start: "2025-12-04", end: "2025-12-08" },
      ],
    },
    {
      id: 2,
      name: "Task B",
      start: "2025-12-06",
      end: "2025-12-15",
      collapsed: false,
      subtasks: [
        { id: 21, name: "Subtask B1", start: "2025-12-07", end: "2025-12-10" },
      ],
    },
  ]);

  const [zoom, setZoom] = useState(40);
  const [dragState, setDragState] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const getToday = () => new Date().toISOString().split("T")[0];

  const [newTaskData, setNewTaskData] = useState({
    name: "",
    start: getToday(),
    end: getToday(),
  });

  const [newSubtaskData, setNewSubtaskData] = useState({
    name: "",
    start: getToday(),
    end: getToday(),
  });

  const timelineRef = useRef(null);

  // Update task or subtask dates
  const updateTaskDates = (taskId, subtaskId, newStart, newEnd) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          if (subtaskId) {
            // Update subtask
            const updatedSubtasks = task.subtasks.map((sub) =>
              sub.id === subtaskId
                ? { ...sub, start: newStart, end: newEnd }
                : sub
            );

            // Recalculate parent boundaries
            const minStart = updatedSubtasks.reduce(
              (min, sub) =>
                new Date(sub.start) < new Date(min) ? sub.start : min,
              updatedSubtasks[0].start
            );
            const maxEnd = updatedSubtasks.reduce(
              (max, sub) => (new Date(sub.end) > new Date(max) ? sub.end : max),
              updatedSubtasks[0].end
            );

            return {
              ...task,
              subtasks: updatedSubtasks,
              start: minStart,
              end: maxEnd,
            };
          } else {
            // Update parent task and shift all children
            const offset =
              (new Date(newStart) - new Date(task.start)) /
              (1000 * 60 * 60 * 24);
            const updatedSubtasks = task.subtasks.map((sub) => {
              const subStart = new Date(sub.start);
              subStart.setDate(subStart.getDate() + offset);
              const subEnd = new Date(sub.end);
              subEnd.setDate(subEnd.getDate() + offset);
              return {
                ...sub,
                start: subStart.toISOString().split("T")[0],
                end: subEnd.toISOString().split("T")[0],
              };
            });

            return {
              ...task,
              start: newStart,
              end: newEnd,
              subtasks: updatedSubtasks,
            };
          }
        }
        return task;
      })
    );
  };

  // Add a new task - opens modal
  const addTask = () => {
    setNewTaskData({
      name: "",
      start: getToday(),
      end: getToday(),
    });
    setShowTaskModal(true);
  };

  // Handle task creation from modal
  const handleCreateTask = () => {
    if (!newTaskData.name || !newTaskData.start || !newTaskData.end) {
      alert("Please fill in all fields");
      return;
    }

    if (new Date(newTaskData.start) > new Date(newTaskData.end)) {
      alert("End date must be after start date");
      return;
    }

    const newId = Math.max(...tasks.map((t) => t.id), 0) + 1;
    setTasks([
      ...tasks,
      {
        id: newId,
        name: newTaskData.name,
        start: newTaskData.start,
        end: newTaskData.end,
        collapsed: false,
        subtasks: [],
      },
    ]);

    setNewTaskData({ name: "", start: getToday(), end: getToday() });
    setShowTaskModal(false);
  };

  // Add a new subtask with modal
  const addSubtask = (taskId) => {
    setSelectedTaskId(taskId);
    setNewSubtaskData({
      name: "",
      start: getToday(),
      end: getToday(),
    });

    setShowSubtaskModal(true);
  };

  const handleCreateSubtask = () => {
    if (!newSubtaskData.name || !newSubtaskData.start || !newSubtaskData.end) {
      alert("Please fill in all fields");
      return;
    }

    if (new Date(newSubtaskData.start) > new Date(newSubtaskData.end)) {
      alert("End date must be after start date");
      return;
    }

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === selectedTaskId) {
          const newSubId =
            Math.max(...task.subtasks.map((s) => s.id), task.id * 10) + 1;
          const newSubtask = {
            id: newSubId,
            name: newSubtaskData.name,
            start: newSubtaskData.start,
            end: newSubtaskData.end,
          };

          const updatedSubtasks = [...task.subtasks, newSubtask];

          // Recalculate parent task boundaries
          const minStart = updatedSubtasks.reduce(
            (min, sub) =>
              new Date(sub.start) < new Date(min) ? sub.start : min,
            updatedSubtasks[0].start
          );
          const maxEnd = updatedSubtasks.reduce(
            (max, sub) => (new Date(sub.end) > new Date(max) ? sub.end : max),
            updatedSubtasks[0].end
          );

          return {
            ...task,
            subtasks: updatedSubtasks,
            start: minStart,
            end: maxEnd,
          };
        }
        return task;
      })
    );

    setNewSubtaskData({ name: "", start: getToday(), end: getToday() });
    setShowSubtaskModal(false);
    setSelectedTaskId(null);
  };

  const deleteTask = (taskId) =>
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

  const deleteSubtask = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.filter(
            (s) => s.id !== subtaskId
          );
          if (updatedSubtasks.length === 0) return { ...task, subtasks: [] };
          const minStart = updatedSubtasks.reduce(
            (min, sub) =>
              new Date(sub.start) < new Date(min) ? sub.start : min,
            updatedSubtasks[0].start
          );
          const maxEnd = updatedSubtasks.reduce(
            (max, sub) => (new Date(sub.end) > new Date(max) ? sub.end : max),
            updatedSubtasks[0].end
          );
          return {
            ...task,
            subtasks: updatedSubtasks,
            start: minStart,
            end: maxEnd,
          };
        }
        return task;
      })
    );
  };

  const toggleCollapse = (taskId) =>
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, collapsed: !task.collapsed } : task
      )
    );

  const exportJSON = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gantt-tasks.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-full">
          <h1 className="text-2xl font-bold text-gray-800">Gantt Timeline</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(Math.max(20, zoom - 10))}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={() => setZoom(Math.min(80, zoom + 10))}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded transition"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={addTask}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
            >
              <Plus size={20} />
              Add Task
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              <Download size={20} />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add New Task
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={newTaskData.name}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newTaskData.start}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, start: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={newTaskData.end}
                  onChange={(e) =>
                    setNewTaskData({ ...newTaskData, end: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateTask}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
              >
                Create Task
              </button>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setNewTaskData({ name: "", start: "", end: "" });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtask Modal */}
      {showSubtaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add New Subtask
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtask Name
                </label>
                <input
                  type="text"
                  value={newSubtaskData.name}
                  onChange={(e) =>
                    setNewSubtaskData({
                      ...newSubtaskData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter subtask name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newSubtaskData.start}
                  onChange={(e) =>
                    setNewSubtaskData({
                      ...newSubtaskData,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={newSubtaskData.end}
                  onChange={(e) =>
                    setNewSubtaskData({
                      ...newSubtaskData,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateSubtask}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
              >
                Create Subtask
              </button>
              <button
                onClick={() => {
                  setShowSubtaskModal(false);
                  setNewSubtaskData({ name: "", start: "", end: "" });
                  setSelectedTaskId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <TaskList
          tasks={tasks}
          onAddSubtask={addSubtask}
          onDeleteTask={deleteTask}
          onDeleteSubtask={deleteSubtask}
          onToggleCollapse={toggleCollapse}
        />

        <div className="flex-1 overflow-auto">
          <TimelineGrid
            tasks={tasks}
            zoom={zoom}
            dragState={dragState}
            setDragState={setDragState}
            updateTaskDates={updateTaskDates}
            timelineRef={timelineRef}
          />
        </div>
      </div>
    </div>
  );
};

export default GanttTimeline;
