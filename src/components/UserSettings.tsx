import { useState } from "react";
import { User, Screen } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, User as UserIcon, Lock } from "lucide-react";

interface UserSettingsProps {
  currentUser: User;
  users: User[];
  onUpdateUsers: (users: User[]) => void;
  onNavigate: (screen: Screen, id?: string) => void;
}

export function UserSettings({ 
  currentUser, 
  users, 
  onUpdateUsers, 
  onNavigate 
}: UserSettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (currentPassword !== currentUser.password) {
      setMessage({ type: "error", text: "現在のパスワードが正しくありません" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "新しいパスワードは6文字以上で入力してください" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "新しいパスワードが一致しません" });
      return;
    }

    const updatedUsers = users.map(u =>
      u.id === currentUser.id
        ? { ...u, password: newPassword }
        : u
    );

    onUpdateUsers(updatedUsers);
    setMessage({ type: "success", text: "パスワードを変更しました" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: "職員",
      instructor: "指導員",
      student: "生徒",
      parent: "保護者"
    };
    return labels[role as keyof typeof labels] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <div>
              <h1 className="text-xl">設定</h1>
              <p className="text-sm text-gray-600">アカウント設定・パスワード変更</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                アカウント情報
              </CardTitle>
              <CardDescription>
                現在ログインしているアカウントの情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">氏名</Label>
                  <p className="text-sm mt-1">{currentUser.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">ユーザーID</Label>
                  <p className="text-sm mt-1">{currentUser.username}</p>
                </div>
                <div>
                  <Label className="text-gray-600">役割</Label>
                  <p className="text-sm mt-1">{getRoleLabel(currentUser.role)}</p>
                </div>
                {currentUser.childrenIds && currentUser.childrenIds.length > 0 && (
                  <div>
                    <Label className="text-gray-600">お子様</Label>
                    <p className="text-sm mt-1">
                      {users.find(u => u.id === currentUser.childrenIds![0])?.name || "未設定"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                パスワード変更
              </CardTitle>
              <CardDescription>
                セキュリティのため定期的にパスワードを変更してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">現在のパスワード</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新しいパスワード</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-600">6文字以上で入力してください</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {message && (
                  <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit">パスワードを変更</Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Info */}
          <Card>
            <CardHeader>
              <CardTitle>ヘルプ</CardTitle>
              <CardDescription>お困りの際は</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>アカウント情報の変更が必要な場合は、職員にお問い合わせください。</p>
                <p>パスワードを忘れた場合も、職員が再設定いたします。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
