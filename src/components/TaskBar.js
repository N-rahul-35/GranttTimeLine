import React from "react";

const TaskBar = ({
  item,
  taskId,
  subtaskId,
  isSubtask,
  dateToX,
  rowHeight,
  setDragState,
}) => {
  const taskHeight = 32;
  const x = dateToX(item.start);
  const width = dateToX(item.end) - x;

  const bgColor = isSubtask ? "bg-blue-500" : "bg-indigo-600";
  const hoverColor = isSubtask ? "hover:bg-blue-600" : "hover:bg-indigo-700";

  const handleMouseDown = (e, action) => {
    e.stopPropagation();
    setDragState({
      taskId,
      subtaskId,
      action,
      startX: e.clientX,
      originalStart: item.start,
      originalEnd: item.end,
    });
  };

  return (
    <div
      className={`absolute ${bgColor} ${hoverColor} rounded-lg cursor-move flex items-center justify-between px-2 text-white text-sm font-medium transition-colors shadow-md`}
      style={{
        left: x,
        width: Math.max(width, 50), // minimum width
        height: taskHeight,
        top: (rowHeight - taskHeight) / 2,
      }}
      onMouseDown={(e) => handleMouseDown(e, "move")}
      title={item.name} // tooltip for long names
    >
      {/* Left Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-50 transition rounded-l"
        onMouseDown={(e) => handleMouseDown(e, "resize-start")}
      />

      {/* Task Label */}
      <span className="truncate px-2">{item.name}</span>

      {/* Right Resize Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-50 transition rounded-r"
        onMouseDown={(e) => handleMouseDown(e, "resize-end")}
      />
    </div>
  );
};

export default TaskBar;
