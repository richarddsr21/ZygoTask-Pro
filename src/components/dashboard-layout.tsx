"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Task, useTasks } from "@/contexts/tasks-context";
import { AddTaskModal } from "@/components/add-task-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  Calendar,
  User,
  LogOut,
  Filter,
  Edit,
  Trash2,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

type FilterType =
  | "all"
  | "due-today"
  | "high-priority"
  | "completed"
  | "pending"
  | "overdue";
type SortType = "created" | "due-date" | "priority" | "alphabetical";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { tasks, deleteTask, toggleTask, getTasksByGroup, groups } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todas as Tarefas");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("created");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null);

  const applyFilters = (taskList: Task[]) => {
    let filtered = taskList;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description &&
            task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply special filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (activeFilter) {
      case "due-today":
        filtered = filtered.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
        break;
      case "high-priority":
        filtered = filtered.filter((task) => task.priority === "high");
        break;
      case "completed":
        filtered = filtered.filter((task) => task.completed);
        break;
      case "pending":
        filtered = filtered.filter((task) => !task.completed);
        break;
      case "overdue":
        filtered = filtered.filter((task) => {
          if (!task.dueDate || task.completed) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < today;
        });
        break;
    }

    return filtered;
  };

  const applySorting = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      switch (sortBy) {
        case "due-date":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          );
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "created":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });
  };

  const allGroups = [
    { name: "Todas as Tarefas", count: tasks.length },
    ...groups.map((group) => ({
      name: group,
      count: tasks.filter((task) => task.group === group).length,
    })),
  ];

  const baseTaskList = getTasksByGroup(
    selectedGroup === "Todas as Tarefas" ? "All Tasks" : selectedGroup
  );
  const filteredTasks = applySorting(applyFilters(baseTaskList));

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter((t) => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    const dueToday = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(t.dueDate);
      return today.toDateString() === dueDate.toDateString();
    }).length;

    return { total, completed, pending, overdue, dueToday };
  };

  const stats = getTaskStats();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sem prazo";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Vence hoje";
    if (diffDays === 1) return "Vence amanhã";
    if (diffDays > 0) return `Vence em ${diffDays} dias`;
    return `Atrasada ${Math.abs(diffDays)} dias`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    setDeleteConfirm(null);
  };

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case "due-today":
        return "Vencem Hoje";
      case "high-priority":
        return "Alta Prioridade";
      case "completed":
        return "Concluídas";
      case "pending":
        return "Pendentes";
      case "overdue":
        return "Atrasadas";
      default:
        return "Todas as Tarefas";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-900">ZygoTask Pro</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80 bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-slate-200 min-h-[calc(100vh-73px)]">
          <div className="p-6">
            <AddTaskModal />

            <div className="space-y-6 mt-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Visão Geral
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total</span>
                    <Badge variant="secondary">{stats.total}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Concluídas</span>
                    <Badge className="bg-green-100 text-green-700">
                      {stats.completed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Pendentes</span>
                    <Badge className="bg-blue-100 text-blue-700">
                      {stats.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Atrasadas</span>
                    <Badge className="bg-red-100 text-red-700">
                      {stats.overdue}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Grupos de Tarefas
                </h3>
              </div>
              <div className="space-y-1">
                {allGroups.map((group) => (
                  <button
                    key={group.name}
                    onClick={() => {
                      setSelectedGroup(group.name);
                      setActiveFilter("all");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedGroup === group.name && activeFilter === "all"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">{group.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {group.count}
                    </Badge>
                  </button>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Filtros Rápidos
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveFilter("due-today");
                      setSelectedGroup("Todas as Tarefas");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeFilter === "due-today"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Vencem Hoje
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stats.dueToday}
                    </Badge>
                  </button>
                  <button
                    onClick={() => {
                      setActiveFilter("high-priority");
                      setSelectedGroup("Todas as Tarefas");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeFilter === "high-priority"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Alta Prioridade
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tasks.filter((t) => t.priority === "high").length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => {
                      setActiveFilter("overdue");
                      setSelectedGroup("Todas as Tarefas");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeFilter === "overdue"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Atrasadas
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stats.overdue}
                    </Badge>
                  </button>
                  <button
                    onClick={() => {
                      setActiveFilter("completed");
                      setSelectedGroup("Todas as Tarefas");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeFilter === "completed"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Concluídas
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {stats.completed}
                    </Badge>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  {activeFilter === "all"
                    ? selectedGroup
                    : getFilterLabel(activeFilter)}{" "}
                  ({filteredTasks.length})
                </h2>
                <p className="text-slate-600">
                  Gerencie suas tarefas e mantenha-se organizado
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Select
                  value={activeFilter}
                  onValueChange={(value: FilterType) => setActiveFilter(value)}
                >
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Tarefas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="due-today">Vencem Hoje</SelectItem>
                    <SelectItem value="overdue">Atrasadas</SelectItem>
                    <SelectItem value="high-priority">
                      Alta Prioridade
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value: SortType) => setSortBy(value)}
                >
                  <SelectTrigger className="w-40">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">
                      Adicionadas Recentemente
                    </SelectItem>
                    <SelectItem value="due-date">Data de Vencimento</SelectItem>
                    <SelectItem value="priority">Prioridade</SelectItem>
                    <SelectItem value="alphabetical">Alfabética</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(activeFilter !== "all" || searchQuery) && (
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-slate-600">Filtros ativos:</span>
                {activeFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {getFilterLabel(activeFilter)}
                    <button
                      onClick={() => setActiveFilter("all")}
                      className="ml-1 hover:text-slate-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Busca: {searchQuery}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-slate-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-700">
                <div className="col-span-1"></div>
                <div className="col-span-5">Tarefa</div>
                <div className="col-span-2">Data de Vencimento</div>
                <div className="col-span-2">Grupo</div>
                <div className="col-span-1">Prioridade</div>
                <div className="col-span-1"></div>
              </div>

              {/* Task Rows */}
              <div className="divide-y divide-slate-200">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${
                      task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-5 flex items-center">
                      <div>
                        <span
                          className={`font-medium ${
                            task.completed
                              ? "line-through text-slate-500"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span
                        className={`text-sm ${
                          task.dueDate &&
                          new Date(task.dueDate) < new Date() &&
                          !task.completed
                            ? "text-red-600 font-medium"
                            : "text-slate-600"
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <Badge variant="outline" className="text-xs">
                        {task.group}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <Badge
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingTask(task)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteConfirm(task)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">
                    {searchQuery || activeFilter !== "all"
                      ? "Nenhuma tarefa corresponde aos filtros atuais"
                      : "Nenhuma tarefa encontrada"}
                  </p>
                  {(searchQuery || activeFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 bg-transparent"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveFilter("all");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="sm:max-w-md">
            <AddTaskModal
              editTask={editingTask}
              onClose={() => setEditingTask(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {deleteConfirm && (
        <Dialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Excluir Tarefa</DialogTitle>
              <DialogDescription>
                {`Tem certeza de que deseja excluir "${deleteConfirm.title}"? Esta ação não pode ser desfeita.`}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="destructive"
                onClick={() => handleDeleteTask(deleteConfirm.id)}
                className="flex-1"
              >
                Excluir
              </Button>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
