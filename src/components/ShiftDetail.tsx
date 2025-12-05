import { User, Shift, Screen } from "../App";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, Calendar, Clock, User as UserIcon, Activity } from "lucide-react";

interface ShiftDetailProps {
  currentUser: User;
  shift: Shift;
  onNavigate: (screen: Screen, id?: string) => void;
}

export function ShiftDetail({ 
  currentUser, 
  shift, 
  onNavigate 
}: ShiftDetailProps) {
  const goBack = () => {
    if (["student", "parent"].includes(currentUser.role)) {
      onNavigate("schedule-list");
    } else {
      onNavigate("shifts");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
  };

  const isPastShift = new Date(shift.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {["student", "parent"].includes(currentUser.role) ? "予定一覧へ戻る" : "シフト管理へ戻る"}
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
                isPastShift ? "bg-gray-100" : "bg-green-100"
              }`}>
                <Activity className={`w-8 h-8 ${isPastShift ? "text-gray-600" : "text-green-600"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <CardTitle className="text-2xl">{shift.activity}</CardTitle>
                  {isPastShift ? (
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      終了
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                      予定
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">日程</p>
                      <p className="text-base">{formatDate(shift.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">時間</p>
                      <p className="text-base">{shift.startTime} - {shift.endTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <UserIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">担当指導員</p>
                      <p className="text-base">{shift.instructorName}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    活動内容
                  </h3>
                  <p className="text-base">{shift.activity}</p>
                </div>
              </div>

              {!isPastShift && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="mb-2">参加予定の方へ</h3>
                  <p className="text-sm text-gray-700">
                    この活動は{formatDate(shift.date)}に予定されています。
                    時間に遅れないようご参加ください。
                  </p>
                </div>
              )}

              {isPastShift && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h3 className="mb-2">終了した活動</h3>
                  <p className="text-sm text-gray-700">
                    この活動は既に終了しています。
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
