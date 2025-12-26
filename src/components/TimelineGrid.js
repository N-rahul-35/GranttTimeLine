import React, { useEffect, useMemo } from "react";
import TaskBar from "./TaskBar";

const TimelineGrid = ({
  tasks,
  zoom,
  dragState,
  setDragState,
  updateTaskDates,
  timelineRef,
}) => {
  const dayWidth = zoom;
  const rowHeight = 50;

  // Calculate date range across all tasks/subtasks - memoized to recalculate when tasks change
  const dateRange = useMemo(() => {
    const allDates = [];
    tasks.forEach((task) => {
      allDates.push(new Date(task.start), new Date(task.end));
      task.subtasks.forEach((sub) =>
        allDates.push(new Date(sub.start), new Date(sub.end))
      );
    });

    if (allDates.length === 0) {
      return { start: new Date("2025-01-01"), end: new Date("2025-01-31") };
    }

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    minDate.setDate(minDate.getDate() - 3); // padding start
    maxDate.setDate(maxDate.getDate() + 10); // padding end

    return { start: minDate, end: maxDate };
  }, [tasks]);

  const totalDays = Math.ceil(
    (dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)
  );

  const dateToX = (dateStr) => {
    const date = new Date(dateStr);
    const days = (date - dateRange.start) / (1000 * 60 * 60 * 24);
    return days * dayWidth;
  };

  // Drag handlers
  const handleMouseMove = (e) => {
    if (!dragState) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaDays = Math.round(deltaX / dayWidth);

    const task = tasks.find((t) => t.id === dragState.taskId);
    if (!task) return;

    const item = dragState.subtaskId
      ? task.subtasks.find((s) => s.id === dragState.subtaskId)
      : task;

    if (!item) return;

    if (dragState.action === "move") {
      const newStart = new Date(dragState.originalStart);
      newStart.setDate(newStart.getDate() + deltaDays);
      const newEnd = new Date(dragState.originalEnd);
      newEnd.setDate(newEnd.getDate() + deltaDays);

      updateTaskDates(
        dragState.taskId,
        dragState.subtaskId,
        newStart.toISOString().split("T")[0],
        newEnd.toISOString().split("T")[0]
      );
    } else if (dragState.action === "resize-start") {
      const newStart = new Date(dragState.originalStart);
      newStart.setDate(newStart.getDate() + deltaDays);
      if (newStart < new Date(item.end)) {
        updateTaskDates(
          dragState.taskId,
          dragState.subtaskId,
          newStart.toISOString().split("T")[0],
          item.end
        );
      }
    } else if (dragState.action === "resize-end") {
      const newEnd = new Date(dragState.originalEnd);
      newEnd.setDate(newEnd.getDate() + deltaDays);
      if (newEnd > new Date(item.start)) {
        updateTaskDates(
          dragState.taskId,
          dragState.subtaskId,
          item.start,
          newEnd.toISOString().split("T")[0]
        );
      }
    }
  };

  const handleMouseUp = () => setDragState(null);

  useEffect(() => {
    if (dragState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, tasks]);

  // Render timeline header
  const renderTimelineHeader = () => {
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(dateRange.start);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return (
      <div className="flex border-b border-gray-300 bg-gray-50 sticky top-0 z-20">
        {days.map((date, idx) => (
          <div
            key={idx}
            className="border-r border-gray-200 flex-shrink-0 text-center py-2"
            style={{ width: dayWidth }}
          >
            <div className="text-xs font-semibold">{date.getDate()}</div>
            <div className="text-xs text-gray-1000">
              {date.toLocaleDateString("en-US", { month: "short" })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto" ref={timelineRef}>
      <div style={{ minWidth: totalDays * dayWidth }}>
        {renderTimelineHeader()}

        <div className="relative">
          {tasks.map((task, taskIndex) => (
            <div key={task.id}>
              {/* Parent Task Row */}
              <div
                className="relative border-b border-gray-100"
                style={{ height: rowHeight }}
              >
                <TaskBar
                  item={task}
                  taskId={task.id}
                  subtaskId={null}
                  isSubtask={false}
                  dateToX={dateToX}
                  rowHeight={rowHeight}
                  setDragState={setDragState}
                />
              </div>

              {/* Subtask Rows */}
              {!task.collapsed &&
                task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="relative border-b border-gray-100 bg-gray-50"
                    style={{ height: rowHeight }}
                  >
                    <TaskBar
                      item={subtask}
                      taskId={task.id}
                      subtaskId={subtask.id}
                      isSubtask={true}
                      dateToX={dateToX}
                      rowHeight={rowHeight}
                      setDragState={setDragState}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineGrid;
