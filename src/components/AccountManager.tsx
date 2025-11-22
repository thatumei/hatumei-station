import { useState } from "react";
import { User, Screen, UserRole } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Plus, Users as UsersIcon, Pencil, Trash2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

interface AccountManagerProps {
  currentUser: User;
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  onNavigate: (screen: Screen) => void;
}

export function AccountManager({ 
  currentUser, 
  users, 
  onUpdateUsers, 
  onNavigate 
}: AccountManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "student" as UserRole,
    childrenIds: [] as string[],
    grade: "",
    classroom: ""
  });
  const [bulkData, setBulkData] = useState("");
  const [error, setError] = useState("");

  const canManage = currentUser.role === "admin";

  const handleNavigateBack = () => {
    setIsDialogOpen(false);
    setIsBulkDialogOpen(false);
    onNavigate("dashboard");
  };

  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>アクセス権限がありません</CardTitle>
            <CardDescription>この機能は職員のみ利用できます</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleNavigateBack}>
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: "職員",
      instructor: "指導員",
      student: "生徒",
      parent: "保護者"
    };
    return labels[role];
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      instructor: "bg-blue-100 text-blue-800",
      student: "bg-green-100 text-green-800",
      parent: "bg-orange-100 text-orange-800"
    };
    return colors[role];
  };

  const handleOpenDialog = (user?: User) => {
    setError("");
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: user.password,
        name: user.name,
        role: user.role,
        childrenIds: user.childrenIds || [],
        grade: user.grade || "",
        classroom: user.classroom || ""
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        name: "",
        role: "student",
        childrenIds: [],
        grade: "",
        classroom: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate username uniqueness
    const existingUser = users.find(u => 
      u.username === formData.username && u.id !== editingUser?.id
    );
    if (existingUser) {
      setError("このユーザーIDは既に使用されています");
      return;
    }

    if (editingUser) {
      const updatedUsers = users.map(u =>
        u.id === editingUser.id
          ? { ...u, ...formData }
          : u
      );
      onUpdateUsers(updatedUsers);
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...formData
      };
      onUpdateUsers([...users, newUser]);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser.id) {
      alert("自分のアカウントは削除できません");
      return;
    }
    if (confirm("このアカウントを削除してもよろしいですか？")) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const lines = bulkData.trim().split('\n');
      const newUsers: User[] = [];
      const errors: string[] = [];

      lines.forEach((line, index) => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length < 4) {
          errors.push(`行${index + 1}: データが不足しています`);
          return;
        }

        const [username, password, name, role] = parts;
        
        if (!['admin', 'instructor', 'student', 'parent'].includes(role)) {
          errors.push(`行${index + 1}: 無効な役割です (${role})`);
          return;
        }

        if (users.find(u => u.username === username) || newUsers.find(u => u.username === username)) {
          errors.push(`行${index + 1}: ユーザーID ${username} は既に存在します`);
          return;
        }

        newUsers.push({
          id: `${Date.now()}_${index}`,
          username,
          password,
          name,
          role: role as UserRole,
          childrenIds: []
        });
      });

      if (errors.length > 0) {
        setError(errors.join('\n'));
        return;
      }

      onUpdateUsers([...users, ...newUsers]);
      setIsBulkDialogOpen(false);
      setBulkData("");
    } catch (err) {
      setError("データの処理中にエラーが発生しました");
    }
  };

  const students = users.filter(u => u.role === "student");

  const usersByRole = {
    admin: users.filter(u => u.role === "admin"),
    instructor: users.filter(u => u.role === "instructor"),
    student: students,
    parent: users.filter(u => u.role === "parent")
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleNavigateBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div>
                <h1 className="text-xl">アカウント管理</h1>
                <p className="text-sm text-gray-600">ユーザーアカウントの作成・管理</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => { setBulkData(""); setError(""); }}>
                    <Upload className="w-4 h-4 mr-2" />
                    一括追加
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle>アカウントを一括追加</DialogTitle>
                    <DialogDescription>
                      1行に1アカウント、カンマ区切りで入力してください
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBulkSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>フォーマット: ユーザーID, パスワード, 氏名, 役割</Label>
                      <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                        <p>役割: admin (職員), instructor (指導員), student (生徒), parent (保護者)</p>
                        <p className="mt-2">例:</p>
                        <p>student002, pass123, 生徒 二郎, student</p>
                        <p>student003, pass123, 生徒 三郎, student</p>
                        <p>instructor002, pass123, 指導員 次郎, instructor</p>
                      </div>
                      <Textarea
                        value={bulkData}
                        onChange={(e) => setBulkData(e.target.value)}
                        rows={12}
                        placeholder="student002, pass123, 生徒 二郎, student&#10;student003, pass123, 生徒 三郎, student&#10;instructor002, pass123, 指導員 次郎, instructor"
                        required
                      />
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        追加
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBulkDialogOpen(false)}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    アカウントを作成
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "アカウントを編集" : "新しいアカウントを作成"}
                  </DialogTitle>
                  <DialogDescription>
                    アカウント情報を入力してください
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">ユーザーID</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="例: student001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="パスワードを入力"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">氏名</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="例: 生徒 太郎"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">役割</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">生徒</SelectItem>
                        <SelectItem value="parent">保護者</SelectItem>
                        <SelectItem value="instructor">指導員</SelectItem>
                        <SelectItem value="admin">職員</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.role === "student" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="grade">学年</Label>
                          <Input
                            id="grade"
                            value={formData.grade}
                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            placeholder="例: 1年"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="classroom">教室</Label>
                          <Input
                            id="classroom"
                            value={formData.classroom}
                            onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                            placeholder="例: A教室"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {formData.role === "parent" && (
                    <div className="space-y-2">
                      <Label htmlFor="children">お子様（生徒）</Label>
                      <Select
                        value={formData.childrenIds[0] || "none"}
                        onValueChange={(value) => setFormData({ ...formData, childrenIds: value === "none" ? [] : [value] })}
                      >
                        <SelectTrigger id="children">
                          <SelectValue placeholder="お子様を選択" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">選択なし</SelectItem>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingUser ? "更新" : "作成"}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(usersByRole).map(([role, roleUsers]) => (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{getRoleLabel(role as UserRole)}</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{roleUsers.length}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User List by Role */}
        <div className="space-y-8">
          {(Object.entries(usersByRole) as [UserRole, User[]][]).map(([role, roleUsers]) => (
            <Card key={role}>
              <CardHeader>
                <CardTitle>{getRoleLabel(role)}一覧</CardTitle>
                <CardDescription>{roleUsers.length}名</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roleUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <UsersIcon className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm">{user.name}</p>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">ID: {user.username}</p>
                          {user.grade && user.classroom && (
                            <p className="text-xs text-gray-600">
                              {user.grade} / {user.classroom}
                            </p>
                          )}
                          {user.childrenIds && user.childrenIds.length > 0 && (
                            <p className="text-xs text-gray-600">
                              お子様: {users.find(u => u.id === user.childrenIds![0])?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {roleUsers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      登録されている{getRoleLabel(role)}はいません
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}