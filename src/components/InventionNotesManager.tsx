import { useState } from "react";
import { User, InventionNote, Screen } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, FileText, Eye } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface InventionNotesManagerProps {
  currentUser: User;
  inventionNotes: InventionNote[];
  onUpdateInventionNotes: (notes: InventionNote[]) => void;
  onNavigate: (screen: Screen, id?: string) => void;
}

export function InventionNotesManager({
  currentUser,
  inventionNotes,
  onUpdateInventionNotes,
  onNavigate,
}: InventionNotesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<InventionNote | null>(null);

  // Filter notes based on role
  const userNotes =
    currentUser.role === "student"
      ? inventionNotes.filter((note) => note.studentId === currentUser.id)
      : currentUser.role === "parent"
      ? inventionNotes.filter((note) =>
          currentUser.childrenIds?.includes(note.studentId)
        )
      : inventionNotes;

  const canCreate = currentUser.role === "student";
  const canEdit = (note: InventionNote) =>
    currentUser.role === "student" && note.studentId === currentUser.id;

  const handleOpenDialog = (note?: InventionNote) => {
    if (note) {
      setEditingNote(note);
    } else {
      setEditingNote(null);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("この発明ノートを削除しますか？")) {
      onUpdateInventionNotes(inventionNotes.filter((note) => note.id !== id));
      toast.success("発明ノートを削除しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onNavigate("dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl">発明ノート</h1>
                <p className="text-sm text-gray-600">
                  アイデアを記録しよう
                </p>
              </div>
            </div>
            {canCreate && (
              <Button onClick={() => onNavigate("invention-note-detail", "new")}>
                <Plus className="w-4 h-4 mr-2" />
                新しいノートを作成
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  {canEdit(note) && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onNavigate("invention-note-detail", note.id)
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  {note.studentName} - {new Date(note.updatedAt).toLocaleDateString("ja-JP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {note.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onNavigate("invention-note-detail", note.id)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  詳細を見る
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {userNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">発明ノートがまだありません</p>
            {canCreate && (
              <Button
                className="mt-4"
                onClick={() => onNavigate("invention-note-detail", "new")}
              >
                <Plus className="w-4 h-4 mr-2" />
                最初のノートを作成
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
