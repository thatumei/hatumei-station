import { useState, useEffect, useRef } from "react";
import { User, Screen } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ArrowLeft,
  QrCode,
  Camera,
  UserCheck,
  Send,
  Trash2,
  X,
  Check,
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import jsQR from "jsqr";

interface AttendanceManagerProps {
  currentUser: User;
  users: User[];
  onNavigate: (screen: Screen) => void;
}

interface AttendanceRecord {
  userId: string;
  userName: string;
  timestamp: string;
}

type ViewMode = "scan" | "manual" | "review";

export function AttendanceManager({
  currentUser,
  users,
  onNavigate,
}: AttendanceManagerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("manual");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [scannedUserId, setScannedUserId] = useState<string>("");
  const [manualUserId, setManualUserId] = useState<string>("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load attendance records from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const storedRecords = localStorage.getItem(`inventionStation_attendance_${today}`);
    if (storedRecords) {
      setAttendanceRecords(JSON.parse(storedRecords));
    }
  }, []);

  // Save attendance records to localStorage
  const saveAttendanceRecords = (records: AttendanceRecord[]) => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`inventionStation_attendance_${today}`, JSON.stringify(records));
    setAttendanceRecords(records);
  };

  // Start camera and QR scanning
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setErrorMessage("カメラの起動に失敗しました。カメラの使用を許可してください。");
      setShowErrorDialog(true);
    }
  };

  // Stop camera and scanning
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // QR code scanning tick
  const tick = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext("2d");

      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          handleQrCodeScanned(code.data);
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(tick);
  };

  // Handle QR code scanned
  const handleQrCodeScanned = (data: string) => {
    stopScanning();
    setScannedUserId(data);
    setShowConfirmDialog(true);
  };

  // Confirm attendance
  const confirmAttendance = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    
    if (!user) {
      setErrorMessage("ユーザーが見つかりません。");
      setShowErrorDialog(true);
      setShowConfirmDialog(false);
      return;
    }

    // Check if already recorded
    const alreadyRecorded = attendanceRecords.some((r) => r.userId === userId);
    if (alreadyRecorded) {
      setErrorMessage(`${user.name}さんは既に出席済みです。`);
      setShowErrorDialog(true);
      setShowConfirmDialog(false);
      return;
    }

    const newRecord: AttendanceRecord = {
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };

    const updatedRecords = [...attendanceRecords, newRecord];
    saveAttendanceRecords(updatedRecords);
    
    setShowConfirmDialog(false);
    setShowSuccessDialog(true);
  };

  // Handle manual entry
  const handleManualEntry = () => {
    if (!manualUserId.trim()) {
      setErrorMessage("ユーザーIDを入力してください。");
      setShowErrorDialog(true);
      return;
    }

    const user = users.find((u) => u.id === manualUserId.trim());
    
    if (!user) {
      setErrorMessage("ユーザーが見つかりません。");
      setShowErrorDialog(true);
      return;
    }

    // Check if already recorded
    const alreadyRecorded = attendanceRecords.some((r) => r.userId === manualUserId.trim());
    if (alreadyRecorded) {
      setErrorMessage(`${user.name}さんは既に出席済みです。`);
      setShowErrorDialog(true);
      return;
    }

    const newRecord: AttendanceRecord = {
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };

    const updatedRecords = [...attendanceRecords, newRecord];
    saveAttendanceRecords(updatedRecords);
    
    setManualUserId("");
    setShowSuccessDialog(true);
  };

  // Delete attendance record
  const deleteRecord = (userId: string) => {
    const updatedRecords = attendanceRecords.filter((r) => r.userId !== userId);
    saveAttendanceRecords(updatedRecords);
  };

  // After success, return to current mode
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    setScannedUserId("");
    if (viewMode === "scan") {
      startScanning();
    }
  };

  const getUserInfo = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Auto-start scanning when entering scan mode
  useEffect(() => {
    if (viewMode === "scan" && !isScanning) {
      startScanning();
    } else if (viewMode !== "scan" && isScanning) {
      stopScanning();
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div>
                <h1 className="text-xl">出席管理</h1>
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode Selection */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={viewMode === "scan" ? "default" : "outline"}
            onClick={() => setViewMode("scan")}
            className="flex-1 min-w-[120px] whitespace-nowrap"
          >
            <Camera className="w-4 h-4 shrink-0 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">QR読込</span>
          </Button>
          <Button
            variant={viewMode === "manual" ? "default" : "outline"}
            onClick={() => setViewMode("manual")}
            className="flex-1 min-w-[120px] whitespace-nowrap"
          >
            <Edit className="w-4 h-4 shrink-0 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">手動入力</span>
          </Button>
          <Button
            variant={viewMode === "review" ? "default" : "outline"}
            onClick={() => setViewMode("review")}
            className="flex-1 min-w-[120px] whitespace-nowrap"
          >
            <Send className="w-4 h-4 shrink-0 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">確認・送信</span>
          </Button>
        </div>

        {/* Scan Mode */}
        {viewMode === "scan" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                QRコードをスキャン
              </CardTitle>
              <CardDescription>
                カメラをQRコードにかざしてください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden bg-black relative" style={{ minHeight: "300px" }}>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ maxHeight: "400px" }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                      <div className="text-center text-white">
                        <Camera className="w-16 h-16 mx-auto mb-4" />
                        <p>カメラを起動中...</p>
                      </div>
                    </div>
                  )}
                  
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-green-500 rounded-lg"></div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {isScanning
                      ? "QRコードをカメラにかざしてください..."
                      : "カメラを起動しています..."}
                  </p>
                  {isScanning && (
                    <Button onClick={stopScanning} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      スキャン停止
                    </Button>
                  )}
                </div>

                {/* Current attendance count */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-center">
                    <span className="text-2xl">{attendanceRecords.length}</span>
                    <span className="text-sm text-gray-600 ml-2">名が出席済み</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manual Mode */}
        {viewMode === "manual" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                手動入力
              </CardTitle>
              <CardDescription>
                ユーザーIDを手動で入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="manualUserId">ユーザーID</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="manualUserId"
                      value={manualUserId}
                      onChange={(e) => setManualUserId(e.target.value)}
                      placeholder="例: 3"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleManualEntry();
                        }
                      }}
                    />
                    <Button onClick={handleManualEntry}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      記録
                    </Button>
                  </div>
                </div>

                {/* Current attendance count */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-center">
                    <span className="text-2xl">{attendanceRecords.length}</span>
                    <span className="text-sm text-gray-600 ml-2">名が出席済み</span>
                  </p>
                </div>

                {/* User list for reference */}
                <div className="mt-6">
                  <h3 className="text-sm mb-2">登録ユーザー一覧</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {users
                      .filter((u) => u.role === "student")
                      .map((user) => {
                        const isRecorded = attendanceRecords.some(
                          (r) => r.userId === user.id
                        );
                        return (
                          <div
                            key={user.id}
                            className={`p-2 rounded border ${
                              isRecorded
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm">{user.name}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  ID: {user.id}
                                </span>
                              </div>
                              {isRecorded && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Mode */}
        {viewMode === "review" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                出席記録の確認と送信
              </CardTitle>
              <CardDescription>
                本日の出席記録を確認し、送信します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-center">
                    <span className="text-2xl">{attendanceRecords.length}</span>
                    <span className="text-sm text-gray-600 ml-2">名が出席</span>
                  </p>
                </div>

                {/* Records list */}
                <div className="space-y-2">
                  <h3 className="text-sm">出席者一覧</h3>
                  {attendanceRecords.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      出席記録がありません
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {attendanceRecords.map((record, index) => (
                        <div
                          key={record.userId}
                          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {index + 1}.
                            </span>
                            <div>
                              <p className="text-sm">{record.userName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(record.timestamp).toLocaleTimeString(
                                  "ja-JP"
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRecord(record.userId)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send button */}
                <div className="pt-4">
                  <Button
                    className="w-full"
                    disabled={attendanceRecords.length === 0}
                    onClick={() => {
                      alert(
                        "サーバー送信機能は今後実装されます。\n現在はローカルストレージに保存されています。"
                      );
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    出席記録を送信
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ※送信機能は今後実装予定です
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>出席確認</DialogTitle>
            <DialogDescription>
              以下のユーザーの出席を記録しますか？
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {scannedUserId && getUserInfo(scannedUserId) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-center">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                  <span className="text-lg block">
                    {getUserInfo(scannedUserId)?.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    ID: {scannedUserId}
                  </span>
                </p>
              </div>
            )}
            {scannedUserId && !getUserInfo(scannedUserId) && (
              <p className="text-center text-red-600">
                ユーザーが見つかりません
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setScannedUserId("");
                if (viewMode === "scan") {
                  startScanning();
                }
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => confirmAttendance(scannedUserId)}
              disabled={!getUserInfo(scannedUserId)}
            >
              <Check className="w-4 h-4 mr-2" />
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              出席を記録しました
            </AlertDialogTitle>
            <AlertDialogDescription>
              出席記録が正常に保存されました。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSuccessClose}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              エラー
            </AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}