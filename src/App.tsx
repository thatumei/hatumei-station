import { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";
import { MaterialsManager } from "./components/MaterialsManager";
import { ShiftManager } from "./components/ShiftManager";
import { AccountManager } from "./components/AccountManager";
import { UserSettings } from "./components/UserSettings";
import { NoticeManager } from "./components/NoticeManager";
import { AttendanceManager } from "./components/AttendanceManager";
import { MaterialDetail } from "./components/MaterialDetail";
import { NoticeDetail } from "./components/NoticeDetail";
import { ShiftDetail } from "./components/ShiftDetail";
import { ScheduleList } from "./components/ScheduleList";
import { AppLinksManager } from "./components/AppLinksManager";
import { InventionNotesManager } from "./components/InventionNotesManager";
import { InventionNoteDetail } from "./components/InventionNoteDetail";
import { Toaster } from "./components/ui/sonner";

export type UserRole = "admin" | "instructor" | "student" | "parent";

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  childrenIds?: string[]; // For parents
  grade?: string; // For students - 学年
  classroom?: string; // For students - 教室
}

export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAudience: UserRole[];
  fileUrl?: string;
  createdAt: string;
  githubRepo?: string; // GitHub repository name under thatumei user
}

export interface Shift {
  id: string;
  instructorId: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetAudience: UserRole[];
  priority: "low" | "medium" | "high";
  createdAt: string;
  createdBy: string;
}

export interface AppLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  description: string;
  category: string;
}

export interface InventionNote {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  drawingData: string; // JSON string of drawing data
  materials: string;
  dimensions: string;
  createdAt: string;
  updatedAt: string;
}

export type Screen = 
  | "dashboard" 
  | "materials" 
  | "shifts" 
  | "accounts" 
  | "settings" 
  | "notices" 
  | "attendance"
  | "material-detail"
  | "notice-detail"
  | "shift-detail"
  | "schedule-list"
  | "app-links"
  | "invention-notes"
  | "invention-note-detail";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [appLinks, setAppLinks] = useState<AppLink[]>([]);
  const [inventionNotes, setInventionNotes] = useState<InventionNote[]>([]);

  // Initialize with sample data
  useEffect(() => {
    const storedUsers = localStorage.getItem("inventionStation_users");
    const storedMaterials = localStorage.getItem("inventionStation_materials");
    const storedShifts = localStorage.getItem("inventionStation_shifts");
    const storedNotices = localStorage.getItem("inventionStation_notices");
    const storedAppLinks = localStorage.getItem("inventionStation_appLinks");
    const storedInventionNotes = localStorage.getItem("inventionStation_inventionNotes");

    if (!storedUsers) {
      const initialUsers: User[] = [
        {
          id: "1",
          username: "admin001",
          password: "admin123",
          role: "admin",
          name: "管理者 太郎"
        },
        {
          id: "2",
          username: "instructor001",
          password: "inst123",
          role: "instructor",
          name: "指導員 花子"
        },
        {
          id: "3",
          username: "student001",
          password: "student123",
          role: "student",
          name: "生徒 一郎",
          grade: "1年",
          classroom: "A教室"
        },
        {
          id: "4",
          username: "parent001",
          password: "parent123",
          role: "parent",
          name: "保護者 次郎",
          childrenIds: ["3"]
        }
      ];
      localStorage.setItem("inventionStation_users", JSON.stringify(initialUsers));
      setUsers(initialUsers);
    } else {
      setUsers(JSON.parse(storedUsers));
    }

    if (!storedMaterials) {
      const initialMaterials: Material[] = [
        {
          id: "1",
          title: "ロボット工作基礎",
          description: "基本的なロボット製作の手順とポイント。モーターの使い方、センサーの接続方法など、初心者でもわかりやすく解説しています。",
          category: "ロボティクス",
          targetAudience: ["student", "instructor"],
          createdAt: "2025-11-15"
        },
        {
          id: "2",
          title: "電子回路入門",
          description: "電子回路の基本を学ぶ教材。LEDの点灯、抵抗の計算、ブレッドボードの使い方など、実践的な内容を含みます。",
          category: "電子工作",
          targetAudience: ["student", "instructor"],
          createdAt: "2025-11-20"
        },
        {
          id: "3",
          title: "指導マニュアル - 安全管理",
          description: "活動時の安全管理に関する指導員向けマニュアル。工具の取り扱い、作業環境の整備、緊急時の対応などを網羅しています。",
          category: "指導資料",
          targetAudience: ["instructor", "admin"],
          createdAt: "2025-11-10"
        },
        {
          id: "4",
          title: "プログラミング基礎（Scratch）",
          description: "Scratchを使った初めてのプログラミング。ゲームやアニメーション作りを通して、プログラミングの基礎を楽しく学べます。",
          category: "プログラミング",
          targetAudience: ["student", "instructor", "parent"],
          createdAt: "2025-12-01"
        }
      ];
      localStorage.setItem("inventionStation_materials", JSON.stringify(initialMaterials));
      setMaterials(initialMaterials);
    } else {
      setMaterials(JSON.parse(storedMaterials));
    }

    if (!storedShifts) {
      const initialShifts: Shift[] = [
        {
          id: "1",
          instructorId: "2",
          instructorName: "指導員 花子",
          date: "2025-12-15",
          startTime: "14:00",
          endTime: "17:00",
          activity: "ロボット工作"
        },
        {
          id: "2",
          instructorId: "2",
          instructorName: "指導員 花子",
          date: "2025-12-20",
          startTime: "14:00",
          endTime: "17:00",
          activity: "電子回路制作"
        },
        {
          id: "3",
          instructorId: "2",
          instructorName: "指導員 花子",
          date: "2025-12-25",
          startTime: "10:00",
          endTime: "12:00",
          activity: "年末発表会準備"
        }
      ];
      localStorage.setItem("inventionStation_shifts", JSON.stringify(initialShifts));
      setShifts(initialShifts);
    } else {
      setShifts(JSON.parse(storedShifts));
    }

    if (!storedNotices) {
      const initialNotices: Notice[] = [
        {
          id: "1",
          title: "発明クラブ活動のお知らせ",
          content: "12月の活動スケジュールが確定しました。ロボット工作、電子回路制作、年末発表会の準備など、充実した内容となっております。皆様のご参加をお待ちしております。",
          targetAudience: ["admin", "instructor", "student", "parent"],
          priority: "high",
          createdAt: "2025-12-01",
          createdBy: "管理者 太郎"
        },
        {
          id: "2",
          title: "新しい教材が追加されました",
          content: "ロボティクスと電子工作の新しい教材をご用意しました。初心者向けから上級者向けまで、幅広いレベルに対応しています。ぜひご活用ください。",
          targetAudience: ["student", "instructor"],
          priority: "medium",
          createdAt: "2025-12-02",
          createdBy: "管理者 太郎"
        },
        {
          id: "3",
          title: "保護者の方へ - 年末発表会について",
          content: "12月25日（水）に年末発表会を開催します。お子様の作品発表がありますので、ぜひご参加ください。",
          targetAudience: ["parent"],
          priority: "medium",
          createdAt: "2025-12-03",
          createdBy: "管理者 太郎"
        }
      ];
      localStorage.setItem("inventionStation_notices", JSON.stringify(initialNotices));
      setNotices(initialNotices);
    } else {
      setNotices(JSON.parse(storedNotices));
    }

    if (!storedAppLinks) {
      const initialAppLinks: AppLink[] = [
        {
          id: "1",
          title: "GitHub",
          url: "https://github.com/thatumei",
          icon: "github",
          description: "thatumeiのGitHubリポジトリ",
          category: "リンク"
        },
        {
          id: "2",
          title: "Google Classroom",
          url: "https://classroom.google.com/",
          icon: "google-classroom",
          description: "Google Classroomへのリンク",
          category: "リンク"
        }
      ];
      localStorage.setItem("inventionStation_appLinks", JSON.stringify(initialAppLinks));
      setAppLinks(initialAppLinks);
    } else {
      setAppLinks(JSON.parse(storedAppLinks));
    }

    if (!storedInventionNotes) {
      const initialInventionNotes: InventionNote[] = [
        {
          id: "1",
          studentId: "3",
          studentName: "生徒 一郎",
          title: "ロボットアーム",
          description: "シンプルなロボットアームを作りました。",
          drawingData: '{"type":"line","points":[[10,10],[20,20]]}',
          materials: "モーター、センサー、ブレッドボード",
          dimensions: "10cm x 10cm x 10cm",
          createdAt: "2025-12-10",
          updatedAt: "2025-12-10"
        }
      ];
      localStorage.setItem("inventionStation_inventionNotes", JSON.stringify(initialInventionNotes));
      setInventionNotes(initialInventionNotes);
    } else {
      setInventionNotes(JSON.parse(storedInventionNotes));
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      setCurrentScreen("dashboard");
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen("dashboard");
    setSelectedId(null);
  };

  const handleNavigateWithId = (screen: Screen, id?: string) => {
    setCurrentScreen(screen);
    setSelectedId(id || null);
  };

  const updateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem("inventionStation_users", JSON.stringify(newUsers));
  };

  const updateMaterials = (newMaterials: Material[]) => {
    setMaterials(newMaterials);
    localStorage.setItem("inventionStation_materials", JSON.stringify(newMaterials));
  };

  const updateShifts = (newShifts: Shift[]) => {
    setShifts(newShifts);
    localStorage.setItem("inventionStation_shifts", JSON.stringify(newShifts));
  };

  const updateNotices = (newNotices: Notice[]) => {
    setNotices(newNotices);
    localStorage.setItem("inventionStation_notices", JSON.stringify(newNotices));
  };

  const updateAppLinks = (newAppLinks: AppLink[]) => {
    setAppLinks(newAppLinks);
    localStorage.setItem("inventionStation_appLinks", JSON.stringify(newAppLinks));
  };

  const updateInventionNotes = (newInventionNotes: InventionNote[]) => {
    setInventionNotes(newInventionNotes);
    localStorage.setItem("inventionStation_inventionNotes", JSON.stringify(newInventionNotes));
  };

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === "dashboard" && (
        <Dashboard
          currentUser={currentUser}
          onNavigate={handleNavigateWithId}
          onLogout={handleLogout}
          materials={materials}
          shifts={shifts}
          users={users}
          notices={notices}
        />
      )}
      {currentScreen === "materials" && (
        <MaterialsManager
          currentUser={currentUser}
          materials={materials}
          onUpdateMaterials={updateMaterials}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "material-detail" && selectedId && (
        <MaterialDetail
          currentUser={currentUser}
          material={materials.find(m => m.id === selectedId)!}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "shifts" && (
        <ShiftManager
          currentUser={currentUser}
          shifts={shifts}
          users={users}
          onUpdateShifts={updateShifts}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "shift-detail" && selectedId && (
        <ShiftDetail
          currentUser={currentUser}
          shift={shifts.find(s => s.id === selectedId)!}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "schedule-list" && (
        <ScheduleList
          currentUser={currentUser}
          shifts={shifts}
          users={users}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "accounts" && (
        <AccountManager
          currentUser={currentUser}
          users={users}
          onUpdateUsers={updateUsers}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "settings" && (
        <UserSettings
          currentUser={currentUser}
          users={users}
          onUpdateUsers={updateUsers}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "notices" && (
        <NoticeManager
          currentUser={currentUser}
          notices={notices}
          onUpdateNotices={updateNotices}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "notice-detail" && selectedId && (
        <NoticeDetail
          currentUser={currentUser}
          notice={notices.find(n => n.id === selectedId)!}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "attendance" && (
        <AttendanceManager
          currentUser={currentUser}
          users={users}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "app-links" && (
        <AppLinksManager
          currentUser={currentUser}
          appLinks={appLinks}
          onUpdateAppLinks={updateAppLinks}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "invention-notes" && (
        <InventionNotesManager
          currentUser={currentUser}
          inventionNotes={inventionNotes}
          onUpdateInventionNotes={updateInventionNotes}
          onNavigate={handleNavigateWithId}
        />
      )}
      {currentScreen === "invention-note-detail" && selectedId && (
        <InventionNoteDetail
          currentUser={currentUser}
          inventionNotes={inventionNotes}
          noteId={selectedId}
          onUpdateInventionNotes={updateInventionNotes}
          onNavigate={handleNavigateWithId}
        />
      )}
      <Toaster />
    </div>
  );
}