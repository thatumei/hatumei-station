import { User, Notice, Screen, UserRole } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Bell, AlertCircle, Calendar, User as UserIcon } from "lucide-react";

interface NoticeDetailProps {
  currentUser: User;
  notice: Notice;
  onNavigate: (screen: Screen, id?: string) => void;
}

export function NoticeDetail({ 
  currentUser, 
  notice, 
  onNavigate 
}: NoticeDetailProps) {
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("notices")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              お知らせ一覧へ戻る
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                notice.priority === "high" ? "bg-red-100" :
                notice.priority === "medium" ? "bg-blue-100" : "bg-gray-100"
              }`}>
                {notice.priority === "high" ? (
                  <AlertCircle className={`w-8 h-8 ${
                    notice.priority === "high" ? "text-red-600" :
                    notice.priority === "medium" ? "text-blue-600" : "text-gray-600"
                  }`} />
                ) : (
                  <Bell className={`w-8 h-8 ${
                    notice.priority === "high" ? "text-red-600" :
                    notice.priority === "medium" ? "text-blue-600" : "text-gray-600"
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <CardTitle className="text-2xl">{notice.title}</CardTitle>
                  <Badge className={`${getPriorityColor(notice.priority)} text-sm px-3 py-1`}>
                    優先度: {getPriorityLabel(notice.priority)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(notice.createdAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <UserIcon className="w-4 h-4" />
                    <span>投稿者: {notice.createdBy}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600">対象者:</span>
                    {notice.targetAudience.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3">お知らせ内容</h3>
                <CardDescription className="text-base whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </CardDescription>
              </div>

              {notice.priority === "high" && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-red-900">重要なお知らせ</p>
                      <p className="text-sm text-red-700 mt-1">
                        このお知らせは優先度が「高」に設定されています。内容をご確認ください。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
