import "../App.css";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash, Check } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { useMediaQuery } from "../hooks/use-media-query";

// API URL
const API_URL = import.meta.env.VITE_API_URL;

interface Todo {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  createdAt: string;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Error fetching todos: ${response.statusText}`);
      }
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      toast.error("Failed to fetch todos. Please try again."); // Sonner toast
    } finally {
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (newTitle.trim() === "") {
      toast.error("Title cannot be empty."); // Sonner toast
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error adding todo: ${response.statusText}`);
      }

      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setNewTitle("");
      setNewDescription("");
      setIsAddMenuOpen(false);

      toast.success("Todo added successfully!"); // Sonner toast
    } catch (error) {
      console.error("Failed to add todo:", error);
      toast.error("Failed to add todo. Please try again."); // Sonner toast
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`Error deleting todo: ${response.statusText}`);
      }

      setTodos(todos.filter((todo) => todo.id !== id));

      toast.success("Todo deleted successfully!"); // Sonner toast
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error("Failed to delete todo. Please try again."); // Sonner toast
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, done: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error updating todo status: ${response.statusText}`);
      }

      // const updatedTodo = await response.json();
      setTodos((todos) =>
        todos.map((todo) =>
          todo.id === id ? { ...todo, done: !currentStatus } : todo
        )
      );

      toast.success(`Todo marked as ${!currentStatus ? "done" : "undone"}.`); // Sonner toast
    } catch (error) {
      console.error("Failed to update todo status:", error);
      toast.error("Failed to update todo status. Please try again."); // Sonner toast
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  const saveEdit = async () => {
    if (editingId !== null) {
      try {
        const response = await fetch(API_URL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: editingId,
            title: editTitle,
            description: editDescription,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error updating todo: ${response.statusText}`);
        }

        // const updatedTodo = await response.json();
        setTodos((todos) =>
          todos.map((todo) =>
            todo.id === editingId
              ? { ...todo, title: editTitle, description: editDescription }
              : todo
          )
        );
        setEditingId(null);

        toast.success("Todo updated successfully!"); // Sonner toast
      } catch (error) {
        console.error("Failed to update todo:", error);
        toast.error("Failed to update todo. Please try again."); // Sonner toast
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <header className="mb-6 bg-white rounded-lg shadow">
          <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Todo List</h1>
          </div>
        </header>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 mx-auto border-b-2 border-gray-900 rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Loading your todos...</p>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full space-y-5 divide-y divide-gray-200 rounded-lg">
            {todos.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No todos yet. Add one to get started!
              </div>
            ) : (
              todos.map((todo) => (
                <Card key={todo.id} className="border-none">
                  <CardContent className="p-4">
                    {editingId === todo.id ? (
                      <div className="space-y-3">
                        <Input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="font-medium"
                        />
                        <Textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description (optional)"
                          className="text-sm text-gray-600"
                        />
                        <Button onClick={saveEdit} size="sm" className="mt-2">
                          <Check className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              checked={todo.done}
                              onCheckedChange={() =>
                                toggleComplete(todo.id, todo.done)
                              }
                              className="mt-1"
                            />
                            <div>
                              <h3
                                className={`font-medium ${
                                  todo.done ? "line-through text-gray-500" : ""
                                }`}
                              >
                                {todo.title}
                              </h3>
                              {todo.description && (
                                <p
                                  className={`text-sm mt-1 ${
                                    todo.done
                                      ? "line-through text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {todo.description}
                                </p>
                              )}
                              <p className="mt-2 text-xs text-gray-400">
                                Created: {formatDate(todo.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              onClick={() => startEditing(todo)}
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8"
                              disabled={todo.done}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => deleteTodo(todo.id)}
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {isMobile ? (
          <Sheet open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <SheetTrigger asChild>
              <Button
                className="fixed transform -translate-x-1/2 bg-black rounded-full shadow-lg bottom-6 left-1/2 w-14 h-14"
                size="icon"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Todo</SheetTitle>
              </SheetHeader>
              <div className="p-4 pt-0 space-y-4">
                <Input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <Button onClick={addTodo} className="w-full">
                  Add Todo
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <DialogTrigger asChild>
              <Button
                className="fixed transform -translate-x-1/2 bg-black rounded-full shadow-lg bottom-6 left-1/2 w-14 h-14"
                size="icon"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Todo</DialogTitle>
              </DialogHeader>
              <div className="p-4 pt-0 space-y-4">
                <Input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <Button onClick={addTodo} className="w-full">
                  Add Todo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
