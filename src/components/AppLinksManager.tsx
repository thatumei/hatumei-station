import { useState } from "react";
import { User, AppLink, Screen } from "../App";
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
import { ArrowLeft, Plus, Pencil, Trash2, ExternalLink, Github, Globe } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface AppLinksManagerProps {
  currentUser: User;
  appLinks: AppLink[];
  onUpdateAppLinks: (appLinks: AppLink[]) => void;
  onNavigate: (screen: Screen) => void;
}

export function AppLinksManager({
  currentUser,
  appLinks,
  onUpdateAppLinks,
  onNavigate,
}: AppLinksManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AppLink | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    icon: "globe",
    description: "",
    category: "リンク",
  });

  const canEdit = currentUser.role === "admin";

  const handleOpenDialog = (link?: AppLink) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        title: link.title,
        url: link.url,
        icon: link.icon,
        description: link.description,
        category: link.category,
      });
    } else {
      setEditingLink(null);
      setFormData({
        title: "",
        url: "",
        icon: "globe",
        description: "",
        category: "リンク",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.url) {
      toast.error("タイトルとURLは必須です");
      return;
    }

    if (editingLink) {
      const updatedLinks = appLinks.map((link) =>
        link.id === editingLink.id ? { ...link, ...formData } : link
      );
      onUpdateAppLinks(updatedLinks);
      toast.success("リンクを更新しました");
    } else {
      const newLink: AppLink = {
        id: Date.now().toString(),
        ...formData,
      };
      onUpdateAppLinks([...appLinks, newLink]);
      toast.success("リンクを追加しました");
    }

    setIsDialogOpen(false);
    setFormData({
      title: "",
      url: "",
      icon: "globe",
      description: "",
      category: "リンク",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("このリンクを削除しますか？")) {
      onUpdateAppLinks(appLinks.filter((link) => link.id !== id));
      toast.success("リンクを削除しました");
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "github":
        return <Github className="w-6 h-6" />;
      case "google-classroom":
        return <Globe className="w-6 h-6" />;
      default:
        return <Globe className="w-6 h-6" />;
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
                <h1 className="text-xl">アプリリンク</h1>
                <p className="text-sm text-gray-600">便利なリンク集</p>
              </div>
            </div>
            {canEdit && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    リンクを追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLink ? "リンクを編集" : "新しいリンクを追加"}
                    </DialogTitle>
                    <DialogDescription>
                      リンクの情報を入力してください
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">タイトル</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="例: GitHub"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) =>
                          setFormData({ ...formData, url: e.target.value })
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">説明</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="リンクの説明を入力"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="icon">アイコン</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        placeholder="globe, github, google-classroom"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">カテゴリ</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="例: リンク"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button onClick={handleSave}>保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appLinks.map((link) => (
            <Card key={link.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    {getIcon(link.icon)}
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(link)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  開く
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {appLinks.length === 0 && (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">リンクがまだありません</p>
            {canEdit && (
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                最初のリンクを追加
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
