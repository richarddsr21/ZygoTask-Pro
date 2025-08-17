"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTasks, type Task } from "@/contexts/tasks-context";
import { Plus } from "lucide-react";

interface AddTaskModalProps {
  editTask?: Task | null;
  onClose?: () => void;

  trigger?: React.ReactNode;
}

export function AddTaskModal({
  editTask,
  onClose,
  trigger,
}: AddTaskModalProps) {
  const { addTask, updateTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: editTask?.title || "",
    description: editTask?.description || "",
    dueDate: editTask?.dueDate || "",
    group: editTask?.group || "Trabalho",
    priority: editTask?.priority || ("medium" as const),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate || null,
      group: formData.group,
      priority: formData.priority,
      completed: editTask?.completed || false,
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
      onClose?.();
    } else {
      addTask(taskData);
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        group: "Trabalho",
        priority: "medium",
      });
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && !editTask) {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        group: "Trabalho",
        priority: "medium",
      });
    }
  };

  const DialogComponent: React.ElementType = editTask ? "div" : Dialog;

  return (
    <DialogComponent
      {...(!editTask && { open, onOpenChange: handleOpenChange })}
    >
      {!editTask && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Tarefa
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editTask ? "Editar Tarefa" : "Adicionar Nova Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {editTask
              ? "Atualize os detalhes da sua tarefa"
              : "Crie uma nova tarefa para se manter organizado"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa</Label>
            <Input
              id="title"
              placeholder="Digite o título da tarefa"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione uma descrição da tarefa"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group">Grupo</Label>
              <Select
                value={formData.group}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, group: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trabalho">Trabalho</SelectItem>
                  <SelectItem value="Pessoal">Pessoal</SelectItem>
                  <SelectItem value="Compras">Compras</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento (Opcional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="focus:border-blue-500 focus:ring-blue-500 max-md:max-w-40 md:max-w-36"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {editTask ? "Atualizar Tarefa" : "Adicionar Tarefa"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => (editTask ? onClose?.() : setOpen(false))}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </DialogComponent>
  );
}
