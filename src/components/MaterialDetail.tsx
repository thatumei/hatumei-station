import { User, Material, Screen, UserRole } from "../App";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, BookOpen, Calendar, Github, Download } from "lucide-react";

interface MaterialDetailProps {
  currentUser: User;
  material: Material;
  onNavigate: (screen: Screen, id?: string) => void;
}

export function MaterialDetail({ 
  currentUser, 
  material, 
  onNavigate 
}: MaterialDetailProps) {
  const getRoleLabel = (role: UserRole) => {
    const labels = {
      admin: "職員",
      instructor: "指導員",
      student: "生徒",
      parent: "保護者"
    };
    return labels[role];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => onNavigate("materials")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              教材一覧へ戻る
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <CardTitle className="text-2xl">{material.title}</CardTitle>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {material.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>作成日: {new Date(material.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">対象者:</span>
                  {material.targetAudience.map((role) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {getRoleLabel(role)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3">説明</h3>
                <CardDescription className="text-base whitespace-pre-wrap">
                  {material.description}
                </CardDescription>
              </div>

              {material.fileUrl && (
                <div>
                  <h3 className="mb-3">ファイル</h3>
                  <Button variant="outline" asChild>
                    <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                      ファイルを開く
                    </a>
                  </Button>
                </div>
              )}

              {material.githubRepo && (
                <div>
                  <h3 className="mb-3">GitHubリポジトリ</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                      <Github className="w-5 h-5" />
                      <span className="text-sm font-mono">thatumei/{material.githubRepo}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <a
                          href={`https://github.com/thatumei/${material.githubRepo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHubで開く
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a
                          href={`https://github.com/thatumei/${material.githubRepo}/archive/refs/heads/main.zip`}
                          download
                        >
                          <Download className="w-4 h-4 mr-2" />
                          ZIPをダウンロード
                        </a>
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src={`https://github.com/thatumei/${material.githubRepo}/blob/main/README.md`}
                        className="w-full h-96"
                        title="GitHub Repository Preview"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="mb-2">この教材について</h3>
                <p className="text-sm text-gray-600">
                  この教材は{material.targetAudience.map(role => getRoleLabel(role)).join('、')}を対象としています。
                  {material.category}カテゴリーに分類されており、{new Date(material.createdAt).toLocaleDateString('ja-JP')}に作成されました。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}