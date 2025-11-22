import { useState } from "react";
import { User, Shift, Screen } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";

interface ShiftManagerProps {
  currentUser: User;
  shifts: Shift[];
  users: User[];
  onUpdateShifts: (shifts: Shift[]) => void;
  onNavigate: (screen: Screen) => void;
}

export function ShiftManager({ 
  currentUser, 
  shifts, 
  users, 
  onUpdateShifts, 
  onNavigate 
}: ShiftManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start on Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [formData, setFormData] = useState({
    instructorId: "",
    date: "",
    startTime: "",
    endTime: "",
    activity: ""
  });

  const canEdit = currentUser.role === "admin";
  const instructors = users.filter(u => u.role === "instructor" || u.role === "admin");

  // Generate week dates
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeekStart);

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return shifts.filter(s => s.date === dateStr);
  };

  const handleOpenDialog = (shift?: Shift, presetDate?: string) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        instructorId: shift.instructorId,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        activity: shift.activity
      });
    } else {
      setEditingShift(null);
      setFormData({
        instructorId: "",
        date: presetDate || "",
        startTime: "",
        endTime: "",
        activity: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const instructor = instructors.find(u => u.id === formData.instructorId);
    if (!instructor) return;

    if (editingShift) {
      const updatedShifts = shifts.map(s =>
        s.id === editingShift.id
          ? {
              ...s,
              ...formData,
              instructorName: instructor.name
            }
          : s
      );
      onUpdateShifts(updatedShifts);
    } else {
      const newShift: Shift = {
        id: Date.now().toString(),
        ...formData,
        instructorName: instructor.name
      };
      onUpdateShifts([...shifts, newShift]);
    }
    
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("このシフトを削除してもよろしいですか？")) {
      onUpdateShifts(shifts.filter(s => s.id !== id));
    }
  };

  const getDayLabel = (date: Date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[date.getDay()];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
                <h1 className="text-xl">シフト管理</h1>
                <p className="text-sm text-gray-600">指導員のスケジュール管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center min-w-[200px]">
              <p className="text-sm">
                {currentWeekStart.getFullYear()}年 {currentWeekStart.getMonth() + 1}月
              </p>
              <p className="text-xs text-gray-600">
                {currentWeekStart.getDate()}日 - {weekDates[6].getDate()}日
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              今週
            </Button>
          </div>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  シフトを追加
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingShift ? "シフトを編集" : "新しいシフトを追加"}
                  </DialogTitle>
                  <DialogDescription>
                    シフトの情報を入力してください
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructor">指導員</Label>
                    <Select
                      value={formData.instructorId}
                      onValueChange={(value) => setFormData({ ...formData, instructorId: value })}
                    >
                      <SelectTrigger id="instructor">
                        <SelectValue placeholder="指導員を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">日付</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">開始時刻</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">終了時刻</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity">活動内容</Label>
                    <Input
                      id="activity"
                      value={formData.activity}
                      onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                      placeholder="例: ロボット工作、電子回路制作"
                      required
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingShift ? "更新" : "追加"}
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

        {/* Weekly View */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDates.map((date) => {
            const dayShifts = getShiftsForDate(date);
            const dateStr = date.toISOString().split('T')[0];
            
            return (
              <Card 
                key={dateStr} 
                className={isToday(date) ? "border-indigo-500 border-2" : ""}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-center">
                    {getDayLabel(date)}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {date.getMonth() + 1}/{date.getDate()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="p-2 bg-blue-50 rounded text-xs space-y-1 relative group"
                    >
                      <p className="truncate">{shift.activity}</p>
                      <p className="text-gray-600 truncate">{shift.instructorName}</p>
                      <p className="text-gray-600">
                        {shift.startTime}-{shift.endTime}
                      </p>
                      {canEdit && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 bg-white"
                            onClick={() => handleOpenDialog(shift)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 bg-white"
                            onClick={() => handleDelete(shift.id)}
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {canEdit && dayShifts.length < 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => handleOpenDialog(undefined, dateStr)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      追加
                    </Button>
                  )}
                  {dayShifts.length === 0 && !canEdit && (
                    <p className="text-xs text-gray-400 text-center py-4">予定なし</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}