import { useState } from "react";
import { User, Shift, Screen } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { ArrowLeft, Calendar, Clock, Activity, Filter } from "lucide-react";

interface ScheduleListProps {
  currentUser: User;
  shifts: Shift[];
  users: User[];
  onNavigate: (screen: Screen, id?: string) => void;
}

export function ScheduleList({ 
  currentUser, 
  shifts, 
  users,
  onNavigate 
}: ScheduleListProps) {
  const [filterGrade, setFilterGrade] = useState<string>("all");
  const [filterClassroom, setFilterClassroom] = useState<string>("all");

  // 生徒・保護者の場合のみアクセス可能
  const canAccess = ["student", "parent"].includes(currentUser.role);

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>アクセス権限がありません</CardTitle>
            <CardDescription>この機能は生徒・保護者のみ利用できます</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate("dashboard")}>
              ダッシュボードに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 学年と教室のリストを取得
  const students = users.filter(u => u.role === "student");
  const grades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))) as string[];
  const classrooms = Array.from(new Set(students.map(s => s.classroom).filter(Boolean))) as string[];

  // 現在のユーザーの学年・教室を取得
  let userGrade = "";
  let userClassroom = "";
  
  if (currentUser.role === "student") {
    userGrade = currentUser.grade || "";
    userClassroom = currentUser.classroom || "";
  } else if (currentUser.role === "parent" && currentUser.childrenIds && currentUser.childrenIds.length > 0) {
    const child = users.find(u => u.id === currentUser.childrenIds![0]);
    if (child) {
      userGrade = child.grade || "";
      userClassroom = child.classroom || "";
    }
  }

  // 今後の予定のみフィルタリング
  const upcomingShifts = shifts
    .filter(s => {
      const shiftDate = new Date(s.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return shiftDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 学年・教室でフィルタリング
  const filteredShifts = upcomingShifts.filter(shift => {
    // すべての予定を表示する場合
    if (filterGrade === "all" && filterClassroom === "all") {
      return true;
    }
    
    // 特定の学年・教室でフィルタリング
    // ここでは全ての予定を表示しますが、将来的に予定に学年・教室情報を追加する場合に備えています
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
  };

  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
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
                <h1 className="text-xl">今後の予定</h1>
                <p className="text-sm text-gray-600">活動スケジュール一覧</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        {(userGrade || userClassroom) && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {userGrade}
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    {userClassroom}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {currentUser.role === "student" ? "あなた" : "お子様"}の所属クラス
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <CardTitle>フィルター</CardTitle>
            </div>
            <CardDescription>学年や教室で予定を絞り込むことができます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">学年</Label>
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger id="grade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classroom">教室</Label>
                <Select value={filterClassroom} onValueChange={setFilterClassroom}>
                  <SelectTrigger id="classroom">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom} value={classroom}>
                        {classroom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule List */}
        <div className="space-y-4">
          {filteredShifts.map((shift) => (
            <Card 
              key={shift.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate("shift-detail", shift.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="mb-2">{shift.activity}</CardTitle>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatFullDate(shift.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          担当: {shift.instructorName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    予定
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {filteredShifts.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">予定されている活動がありません</p>
          </div>
        )}
      </main>
    </div>
  );
}
