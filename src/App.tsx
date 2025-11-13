import { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";
import { MaterialsManager } from "./components/MaterialsManager";
import { ShiftManager } from "./components/ShiftManager";
import { AccountManager } from "./components/AccountManager";
import { UserSettings } from "./components/UserSettings";
import { NoticeManager } from "./components/NoticeManager";

export type UserRole = "admin" | "instructor" | "student" | "parent";

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  childrenIds?: string[]; // For parents
}

export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAudience: UserRole[];
  fileUrl?: string;
  createdAt: string;
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

export type Screen = "dashboard" | "materials" | "shifts" | "accounts" | "settings" | "notices";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Initialize with sample data
  useEffect(() => {
    const storedUsers = localStorage.getItem("inventionStation_users");
    const storedMaterials = localStorage.getItem("inventionStation_materials");
    const storedShifts = localStorage.getItem("inventionStation_shifts");
    const storedNotices = localStorage.getItem("inventionStation_notices");

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
          name: "生徒 一郎"
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
          description: "基本的なロボット製作の手順とポイント",
          category: "ロボティクス",
          targetAudience: ["student", "instructor"],
          createdAt: "2025-01-15"
        },
        {
          id: "2",
          title: "電子回路入門",
          description: "電子回路の基本を学ぶ教材",
          category: "電子工作",
          targetAudience: ["student", "instructor"],
          createdAt: "2025-01-20"
        },
        {
          id: "3",
          title: "指導マニュアル - 安全管理",
          description: "活動時の安全管理に関する指導員向けマニュアル",
          category: "指導資料",
          targetAudience: ["instructor", "admin"],
          createdAt: "2025-01-10"
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
          date: "2025-11-15",
          startTime: "14:00",
          endTime: "17:00",
          activity: "ロボット工作"
        },
        {
          id: "2",
          instructorId: "2",
          instructorName: "指導員 花子",
          date: "2025-11-20",
          startTime: "14:00",
          endTime: "17:00",
          activity: "電子回路制作"
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
          title: "発明クラブ活動再開のお知らせ",
          content: "11月15日より通常活動を再開いたします。皆様のご参加をお待ちしております。",
          targetAudience: ["admin", "instructor", "student", "parent"],
          priority: "high",
          createdAt: "2025-11-01",
          createdBy: "管理者 太郎"
        },
        {
          id: "2",
          title: "新しい教材が追加されました",
          content: "ロボティクスと電子工作の新しい教材をご用意しました。ぜひご活用ください。",
          targetAudience: ["student", "instructor"],
          priority: "medium",
          createdAt: "2025-11-05",
          createdBy: "管理者 太郎"
        }
      ];
      localStorage.setItem("inventionStation_notices", JSON.stringify(initialNotices));
      setNotices(initialNotices);
    } else {
      setNotices(JSON.parse(storedNotices));
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

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentScreen === "dashboard" && (
        <Dashboard
          currentUser={currentUser}
          onNavigate={setCurrentScreen}
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
          onNavigate={setCurrentScreen}
        />
      )}
      {currentScreen === "shifts" && (
        <ShiftManager
          currentUser={currentUser}
          shifts={shifts}
          users={users}
          onUpdateShifts={updateShifts}
          onNavigate={setCurrentScreen}
        />
      )}
      {currentScreen === "accounts" && (
        <AccountManager
          currentUser={currentUser}
          users={users}
          onUpdateUsers={updateUsers}
          onNavigate={setCurrentScreen}
        />
      )}
      {currentScreen === "settings" && (
        <UserSettings
          currentUser={currentUser}
          users={users}
          onUpdateUsers={updateUsers}
          onNavigate={setCurrentScreen}
        />
      )}
      {currentScreen === "notices" && (
        <NoticeManager
          currentUser={currentUser}
          notices={notices}
          onUpdateNotices={updateNotices}
          onNavigate={setCurrentScreen}
        />
      )}
    </div>
  );
}
