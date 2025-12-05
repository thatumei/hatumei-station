import { useState, useRef, useEffect } from "react";
import { User, InventionNote, Screen } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Save, Pencil, Eraser, Circle, Square, Minus } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface InventionNoteDetailProps {
  currentUser: User;
  inventionNotes: InventionNote[];
  noteId: string | null;
  onUpdateInventionNotes: (notes: InventionNote[]) => void;
  onNavigate: (screen: Screen) => void;
}

type DrawingTool = "pencil" | "eraser" | "line" | "circle" | "rectangle";

interface DrawingElement {
  type: DrawingTool;
  points?: { x: number; y: number }[];
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color?: string;
  width?: number;
}

export function InventionNoteDetail({
  currentUser,
  inventionNotes,
  noteId,
  onUpdateInventionNotes,
  onNavigate,
}: InventionNoteDetailProps) {
  const isNew = noteId === "new";
  const existingNote = isNew
    ? null
    : inventionNotes.find((note) => note.id === noteId);

  const [title, setTitle] = useState(existingNote?.title || "");
  const [description, setDescription] = useState(existingNote?.description || "");
  const [materials, setMaterials] = useState(existingNote?.materials || "");
  const [dimensions, setDimensions] = useState(existingNote?.dimensions || "");
  const [currentTool, setCurrentTool] = useState<DrawingTool>("pencil");
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (existingNote && existingNote.drawingData) {
      try {
        const data = JSON.parse(existingNote.drawingData);
        setDrawingElements(data);
      } catch (e) {
        console.error("Failed to parse drawing data", e);
      }
    }
  }, [existingNote]);

  useEffect(() => {
    redrawCanvas();
  }, [drawingElements]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawingElements.forEach((element) => {
      ctx.strokeStyle = element.color || "#000000";
      ctx.lineWidth = element.width || 2;

      if (element.type === "pencil" || element.type === "eraser") {
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
      } else if (element.type === "line") {
        ctx.beginPath();
        ctx.moveTo(element.startX!, element.startY!);
        ctx.lineTo(element.endX!, element.endY!);
        ctx.stroke();
      } else if (element.type === "circle") {
        const radius = Math.sqrt(
          Math.pow(element.endX! - element.startX!, 2) +
            Math.pow(element.endY! - element.startY!, 2)
        );
        ctx.beginPath();
        ctx.arc(element.startX!, element.startY!, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (element.type === "rectangle") {
        ctx.strokeRect(
          element.startX!,
          element.startY!,
          element.endX! - element.startX!,
          element.endY! - element.startY!
        );
      }
    });
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint(point);

    if (currentTool === "pencil" || currentTool === "eraser") {
      const newElement: DrawingElement = {
        type: currentTool,
        points: [point],
        color: currentTool === "eraser" ? "#ffffff" : "#000000",
        width: currentTool === "eraser" ? 20 : 2,
      };
      setDrawingElements([...drawingElements, newElement]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const point = getCanvasCoordinates(e);

    if (currentTool === "pencil" || currentTool === "eraser") {
      setDrawingElements((prev) => {
        const newElements = [...prev];
        const lastElement = newElements[newElements.length - 1];
        if (lastElement && lastElement.points) {
          lastElement.points.push(point);
        }
        return newElements;
      });
      redrawCanvas();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const point = getCanvasCoordinates(e);

    if (currentTool !== "pencil" && currentTool !== "eraser") {
      const newElement: DrawingElement = {
        type: currentTool,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: point.x,
        endY: point.y,
        color: "#000000",
        width: 2,
      };
      setDrawingElements([...drawingElements, newElement]);
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleClearCanvas = () => {
    if (confirm("キャンバスをクリアしますか？")) {
      setDrawingElements([]);
    }
  };

  const handleSave = () => {
    if (!title) {
      toast.error("タイトルは必須です");
      return;
    }

    const drawingData = JSON.stringify(drawingElements);
    const now = new Date().toISOString().split("T")[0];

    if (isNew) {
      const newNote: InventionNote = {
        id: Date.now().toString(),
        studentId: currentUser.id,
        studentName: currentUser.name,
        title,
        description,
        drawingData,
        materials,
        dimensions,
        createdAt: now,
        updatedAt: now,
      };
      onUpdateInventionNotes([...inventionNotes, newNote]);
      toast.success("発明ノートを作成しました");
    } else if (existingNote) {
      const updatedNotes = inventionNotes.map((note) =>
        note.id === existingNote.id
          ? {
              ...note,
              title,
              description,
              drawingData,
              materials,
              dimensions,
              updatedAt: now,
            }
          : note
      );
      onUpdateInventionNotes(updatedNotes);
      toast.success("発明ノートを更新しました");
    }

    onNavigate("invention-notes");
  };

  const canEdit =
    currentUser.role === "student" &&
    (isNew || existingNote?.studentId === currentUser.id);

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
                onClick={() => onNavigate("invention-notes")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl">
                  {isNew ? "新しい発明ノート" : title || "発明ノート"}
                </h1>
                <p className="text-sm text-gray-600">
                  {existingNote?.studentName || currentUser.name}
                </p>
              </div>
            </div>
            {canEdit && (
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drawing Area */}
          <Card>
            <CardHeader>
              <CardTitle>設計図</CardTitle>
            </CardHeader>
            <CardContent>
              {canEdit && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button
                    variant={currentTool === "pencil" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("pencil")}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    鉛筆
                  </Button>
                  <Button
                    variant={currentTool === "eraser" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("eraser")}
                  >
                    <Eraser className="w-4 h-4 mr-2" />
                    消しゴム
                  </Button>
                  <Button
                    variant={currentTool === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("line")}
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    直線
                  </Button>
                  <Button
                    variant={currentTool === "circle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("circle")}
                  >
                    <Circle className="w-4 h-4 mr-2" />
                    円
                  </Button>
                  <Button
                    variant={currentTool === "rectangle" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentTool("rectangle")}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    四角
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleClearCanvas}>
                    クリア
                  </Button>
                </div>
              )}
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border border-gray-300 rounded-lg w-full cursor-crosshair"
                onMouseDown={canEdit ? handleMouseDown : undefined}
                onMouseMove={canEdit ? handleMouseMove : undefined}
                onMouseUp={canEdit ? handleMouseUp : undefined}
                style={{ touchAction: "none" }}
              />
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例: ロボットアーム"
                    disabled={!canEdit}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="発明の概要を入力"
                    rows={4}
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>詳細情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="materials">使用材料</Label>
                  <Textarea
                    id="materials"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="例: モーター、センサー、ブレッドボード"
                    rows={3}
                    disabled={!canEdit}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dimensions">寸法</Label>
                  <Input
                    id="dimensions"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="例: 10cm × 10cm × 10cm"
                    disabled={!canEdit}
                  />
                </div>
              </CardContent>
            </Card>

            {existingNote && (
              <Card>
                <CardHeader>
                  <CardTitle>履歴</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">作成日:</span>
                    <span>{existingNote.createdAt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">更新日:</span>
                    <span>{existingNote.updatedAt}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
