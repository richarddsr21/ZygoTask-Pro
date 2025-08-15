"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string | null;
  group: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  getTasksByGroup: (group: string) => Task[];
  groups: string[];
  addGroup: (groupName: string) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customGroups, setCustomGroups] = useState<string[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("zygotask-tasks");
    const savedGroups = localStorage.getItem("zygotask-custom-groups");

    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      return;
    }

    if (savedGroups) {
      setCustomGroups(JSON.parse(savedGroups));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("zygotask-tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      "zygotask-custom-groups",
      JSON.stringify(customGroups)
    );
  }, [customGroups]);

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getTasksByGroup = (group: string) => {
    if (group === "All Tasks" || group === "Todas as Tarefas") return tasks;
    return tasks.filter((task) => task.group === group);
  };

  const taskGroups = Array.from(new Set(tasks.map((task) => task.group)));
  const groups = Array.from(new Set([...taskGroups, ...customGroups]));

  const addGroup = (groupName: string) => {
    if (!groups.includes(groupName) && groupName.trim()) {
      setCustomGroups((prev) => [...prev, groupName.trim()]);
    }
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        getTasksByGroup,
        groups,
        addGroup,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
