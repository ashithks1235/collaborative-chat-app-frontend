import { useState } from "react";

export const useKanbanState = (initialColumns = []) => {
  const [columns, setColumns] = useState(initialColumns);

  const moveTaskLocally = (
    taskId,
    sourceColumnId,
    targetColumnId,
    newIndex
  ) => {
    setColumns(prev => {
      const newColumns = structuredClone(prev);

      const sourceColumn = newColumns.find(c => c._id === sourceColumnId);
      const targetColumn = newColumns.find(c => c._id === targetColumnId);

      const taskIndex = sourceColumn.tasks.findIndex(
        t => t._id === taskId
      );

      const [task] = sourceColumn.tasks.splice(taskIndex, 1);
      targetColumn.tasks.splice(newIndex, 0, task);

      return newColumns;
    });
  };

  return { columns, setColumns, moveTaskLocally };
};
