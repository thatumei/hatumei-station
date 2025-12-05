import { useState } from "react";
import { User, Material, Screen, UserRole } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ArrowLeft, Plus, BookOpen, Pencil, Trash2 } from "lucide-react";

interface MaterialsManagerProps {
  currentUser: User;
  materials: Material[];
  onUpdateMaterials: (materials: Material[]) => void;
  onNavigate: (screen: Screen, id?: string) => void;
}

export function MaterialsManager({ 
  currentUser, 
  materials, 
  onUpdateMaterials, 
  onNavigate 
}: MaterialsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    targetAudience: [] as UserRole[]
  });
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const canEdit = ["admin", "instructor"].includes(currentUser.role);

  const filteredMaterials = materials.filter(m => {
    const hasAccess = m.targetAudience.includes(currentUser.role);
    const matchesFilter = filterCategory === "all" || m.category === filterCategory;
    return hasAccess && matchesFilter;
  });

  const categories = Array.from(new Set(materials.map(m => m.category)));

  const handleOpenDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        title: material.title,
        description: material.description,
        category: material.category,
        targetAudience: material.targetAudience
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        targetAudience: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMaterial) {
      const updatedMaterials = materials.map(m =>
        m.id === editingMaterial.id
          ? { ...m, ...formData }
          : m
      );
      onUpdateMaterials(updatedMaterials);
    } else {
      const newMaterial: Material = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onUpdateMaterials([...materials, newMaterial]);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("この教材を削除してもよろしいですか？")) {
      onUpdateMaterials(materials.filter(m => m.id !== id));
    }
  };

  const toggleTargetAudience = (role: UserRole) => {
    if (formData.targetAudience.includes(role)) {
      setFormData({
        ...formData,
        targetAudience: formData.targetAudience.filter(r => r !== role)
      });
    } else {
      setFormData({
        ...formData,
        targetAudience: [...formData.targetAudience, role]
      });
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: "職員",
      instructor: "指導員",
      student: "生徒",
      parent: "保護者"
    };
    return labels[role];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div>
                <h1 className="text-xl">教材管理</h1>
                <p className="text-sm text-gray-600">教材の閲覧と管理</p>
              </div>
            </div>
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    教材を追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingMaterial ? "教材を編集" : "新しい教材を追加"}
                    </DialogTitle>
                    <DialogDescription>
                      教材の情報を入力してください
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">タイトル</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">説明</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">カテゴリー</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="例: ロボティクス、電子工作"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>対象者</Label>
                      <div className="flex flex-wrap gap-2">
                        {(["student", "instructor", "parent", "admin"] as UserRole[]).map((role) => (
                          <Button
                            key={role}
                            type="button"
                            variant={formData.targetAudience.includes(role) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTargetAudience(role)}
                          >
                            {getRoleLabel(role)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingMaterial ? "更新" : "追加"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter */}
        <div className="mb-6">
          <Label htmlFor="filter">カテゴリーで絞り込み</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-64 mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card 
              key={material.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate("material-detail", material.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  {canEdit && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(material)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(material.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle>{material.title}</CardTitle>
                <CardDescription>{material.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <Badge variant="secondary">{material.category}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {material.targetAudience.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    作成日: {new Date(material.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">教材がありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
