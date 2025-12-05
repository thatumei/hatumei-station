import { useState } from "react";
import { User, Notice, Screen, UserRole } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { ArrowLeft, Plus, Bell, Pencil, Trash2, AlertCircle } from "lucide-react";

interface NoticeManagerProps {
  currentUser: User;
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  onNavigate: (screen: Screen, id?: string) => void;
}

export function NoticeManager({ 
  currentUser, 
  notices, 
  onUpdateNotices, 
  onNavigate 
}: NoticeManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: [] as UserRole[],
    priority: "medium" as "low" | "medium" | "high"
  });
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const canEdit = ["admin", "instructor"].includes(currentUser.role);

  const filteredNotices = notices.filter(n => {
    const hasAccess = n.targetAudience.includes(currentUser.role);
    const matchesFilter = filterPriority === "all" || n.priority === filterPriority;
    return hasAccess && matchesFilter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenDialog = (notice?: Notice) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData({
        title: notice.title,
        content: notice.content,
        targetAudience: notice.targetAudience,
        priority: notice.priority
      });
    } else {
      setEditingNotice(null);
      setFormData({
        title: "",
        content: "",
        targetAudience: [],
        priority: "medium"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNotice) {
      const updatedNotices = notices.map(n =>
        n.id === editingNotice.id
          ? { ...n, ...formData }
          : n
      );
      onUpdateNotices(updatedNotices);
    } else {
      const newNotice: Notice = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: currentUser.name
      };
      onUpdateNotices([...notices, newNotice]);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このお知らせを削除してもよろしいですか？")) {
      onUpdateNotices(notices.filter(n => n.id !== id));
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

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: "低",
      medium: "中",
      high: "高"
    };
    return labels[priority as keyof typeof labels];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors];
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
                <h1 className="text-xl">お知らせ</h1>
                <p className="text-sm text-gray-600">重要な情報をチェック</p>
              </div>
            </div>
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    お知らせを追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingNotice ? "お知らせを編集" : "新しいお知らせを追加"}
                    </DialogTitle>
                    <DialogDescription>
                      お知らせの情報を入力してください
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
                      <Label htmlFor="content">内容</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows={6}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">優先度</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: "low" | "medium" | "high") => 
                          setFormData({ ...formData, priority: value })
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="high">高</SelectItem>
                        </SelectContent>
                      </Select>
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
                        {editingNotice ? "更新" : "追加"}
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
          <Label htmlFor="filter">優先度で絞り込み</Label>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-full md:w-64 mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notices List */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <Card 
              key={notice.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate("notice-detail", notice.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notice.priority === "high" ? "bg-red-100" :
                      notice.priority === "medium" ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      {notice.priority === "high" ? (
                        <AlertCircle className={`w-6 h-6 ${
                          notice.priority === "high" ? "text-red-600" :
                          notice.priority === "medium" ? "text-blue-600" : "text-gray-600"
                        }`} />
                      ) : (
                        <Bell className={`w-6 h-6 ${
                          notice.priority === "high" ? "text-red-600" :
                          notice.priority === "medium" ? "text-blue-600" : "text-gray-600"
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{notice.title}</CardTitle>
                        <Badge className={getPriorityColor(notice.priority)}>
                          {getPriorityLabel(notice.priority)}
                        </Badge>
                      </div>
                      <CardDescription className="whitespace-pre-wrap line-clamp-3">
                        {notice.content}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {notice.targetAudience.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {getRoleLabel(role)}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notice.createdAt).toLocaleDateString('ja-JP')} - {notice.createdBy}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(notice)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notice.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {filteredNotices.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">お知らせがありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
