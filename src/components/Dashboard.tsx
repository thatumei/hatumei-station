import { User, Material, Shift, Screen, UserRole, Notice } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  Lightbulb,
  Clock,
  Bell,
  UserCircle,
  QrCode
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DashboardProps {
  currentUser: User;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  materials: Material[];
  shifts: Shift[];
  users: User[];
  notices: Notice[];
}

export function Dashboard({ 
  currentUser, 
  onNavigate, 
  onLogout, 
  materials,
  shifts,
  users,
  notices
}: DashboardProps) {
  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: "職員",
      instructor: "指導員",
      student: "生徒",
      parent: "保護者"
    };
    return labels[role];
  };

  const canAccessMaterials = true;
  const canAccessShifts = ["admin", "instructor"].includes(currentUser.role);
  const canAccessAccounts = currentUser.role === "admin";
  const canAccessAttendance = ["admin", "instructor"].includes(currentUser.role);

  const userMaterials = materials.filter(m => 
    m.targetAudience.includes(currentUser.role)
  );

  const upcomingShifts = shifts
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const userNotices = notices
    .filter(n => n.targetAudience.includes(currentUser.role))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">発明ステーション</h1>
                <p className="text-sm text-gray-600">豊田少年少女発明クラブ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <UserCircle className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="text-sm">{currentUser.name}</p>
                      <p className="text-xs text-gray-600">{getRoleLabel(currentUser.role)}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate("settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    設定
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    ログアウト
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl mb-2">ようこそ、{currentUser.name}さん</h2>
          <p className="text-gray-600">今日も発明活動を楽しみましょう！</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">利用可能な教材</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{userMaterials.length}</div>
              <p className="text-xs text-muted-foreground">
                あなたが閲覧できる教材数
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">今後のスケジュール</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{upcomingShifts.length}</div>
              <p className="text-xs text-muted-foreground">
                予定されている活動
              </p>
            </CardContent>
          </Card>

          {canAccessAccounts && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">登録ユーザー</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  システム登録者数
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {canAccessMaterials && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("materials")}>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>教材管理</CardTitle>
                <CardDescription>
                  {currentUser.role === "admin" || currentUser.role === "instructor" 
                    ? "教材の閲覧・追加・編集"
                    : "教材の閲覧"}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {canAccessShifts && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("shifts")}>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>シフト管理</CardTitle>
                <CardDescription>
                  指導員のスケジュール管理
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {canAccessAccounts && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("accounts")}>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>アカウント管理</CardTitle>
                <CardDescription>
                  ユーザーアカウントの作成・管理
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {canAccessAttendance && (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("attendance")}>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>出席管理</CardTitle>
                <CardDescription>
                  QRコードで出席を記録
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("notices")}>
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>お知らせ</CardTitle>
              <CardDescription>
                重要な情報をチェック
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate("settings")}>
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <CardTitle>設定</CardTitle>
              <CardDescription>
                アカウント設定・パスワード変更
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>お知らせ</CardTitle>
              <CardDescription>最新のお知らせ</CardDescription>
            </CardHeader>
            <CardContent>
              {userNotices.length > 0 ? (
                <div className="space-y-4">
                  {userNotices.map((notice) => (
                    <div key={notice.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{notice.title}</p>
                        <p className="text-xs text-gray-600">{new Date(notice.createdAt).toLocaleDateString('ja-JP')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">お知らせがありません</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近の教材</CardTitle>
              <CardDescription>最近追加された教材</CardDescription>
            </CardHeader>
            <CardContent>
              {userMaterials.length > 0 ? (
                <div className="space-y-4">
                  {userMaterials.slice(0, 3).map((material) => (
                    <div key={material.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{material.title}</p>
                        <p className="text-xs text-gray-600">{material.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">教材がありません</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>今後のスケジュール</CardTitle>
              <CardDescription>予定されている活動</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingShifts.length > 0 ? (
                <div className="space-y-4">
                  {upcomingShifts.map((shift) => (
                    <div key={shift.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{shift.activity}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(shift.date).toLocaleDateString('ja-JP')} {shift.startTime} - {shift.endTime}
                        </p>
                        <p className="text-xs text-gray-600 truncate">担当: {shift.instructorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">予定がありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
