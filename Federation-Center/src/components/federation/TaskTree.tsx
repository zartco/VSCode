"use client";

import React from "react";
import type { TaskNode } from "@/contracts/types";
import { useFederationStore } from "@/lib/store";

function TaskStatusDot({ status }: { status: TaskNode["status"] }) {
  const color =
    status === "running"
      ? "var(--accent-matrix)"
      : status === "completed"
        ? "var(--accent-green)"
        : status === "failed"
          ? "var(--accent-red)"
          : "var(--text-muted)";
  return (
    <span
      className="task-dot"
      style={{ background: color }}
      title={status}
      aria-label={status}
    />
  );
}

interface TaskRowProps {
  task: TaskNode;
  depth: number;
  allTasks: TaskNode[];
}

function TaskRow({ task, depth, allTasks }: TaskRowProps) {
  const children = allTasks.filter((t) => t.parentTaskId === task.id);

  return (
    <>
      <li
        className="task-row"
        style={
          {
            paddingLeft: `${12 + depth * 20}px`,
            "--depth-padding": `${12 + depth * 20}px`,
          } as React.CSSProperties
        }
      >
        <TaskStatusDot status={task.status} />
        <div className="task-row__body">
          <span className="task-row__desc">{task.description}</span>
          <span className={`task-row__status task-row__status--${task.status}`}>
            {task.status}
          </span>
        </div>
      </li>
      {children.map((child) => (
        <TaskRow
          key={child.id}
          task={child}
          depth={depth + 1}
          allTasks={allTasks}
        />
      ))}
    </>
  );
}

export function TaskTree() {
  const { tasks, selectedAgentId } = useFederationStore();

  const filtered = selectedAgentId
    ? tasks.filter((t) => t.agentId === selectedAgentId)
    : tasks;

  // Root tasks: no parentTaskId (or parent not in filtered set)
  const filteredIds = new Set(filtered.map((t) => t.id));
  const roots = filtered.filter(
    (t) => !t.parentTaskId || !filteredIds.has(t.parentTaskId)
  );

  return (
    <section className="task-tree">
      <h2 className="panel-title">
        Tasks{selectedAgentId ? "" : " — all agents"}
      </h2>
      {filtered.length === 0 ? (
        <p className="task-tree__empty">No tasks</p>
      ) : (
        <ul className="task-list">
          {roots.map((root) => (
            <TaskRow key={root.id} task={root} depth={0} allTasks={filtered} />
          ))}
        </ul>
      )}
    </section>
  );
}
