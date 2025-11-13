import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Lightbulb } from "lucide-react";

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("ユーザーIDとパスワードを入力してください");
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError("ユーザーIDまたはパスワードが正しくありません");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">発明ステーション</CardTitle>
            <CardDescription className="mt-2">豊田少年少女発明クラブ</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ユーザーID</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ユーザーIDを入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              ログイン
            </Button>
          </form>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">デモ用アカウント：</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>職員: admin001 / admin123</p>
              <p>指導員: instructor001 / inst123</p>
              <p>生徒: student001 / student123</p>
              <p>保護者: parent001 / parent123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
