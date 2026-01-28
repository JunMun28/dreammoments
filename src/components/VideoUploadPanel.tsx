/**
 * Video upload panel for wedding invitations
 * Supports both video file upload and YouTube URL input
 */

import { Loader2, Trash2, Upload, Video, Youtube } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { extractYouTubeId } from "@/lib/schemas/video-schemas";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { VideoPlayer } from "./VideoPlayer";

type VideoSourceTab = "upload" | "youtube";

interface VideoUploadPanelProps {
  /** Invitation ID for uploads */
  invitationId: string;
  /** Current video URL */
  videoUrl?: string | null;
  /** Current video source type */
  videoSource?: "upload" | "youtube" | null;
  /** Callback when video is updated */
  onVideoChange?: (
    videoUrl: string | null,
    source: "upload" | "youtube" | null,
  ) => void;
  /** Accent color for styling */
  accentColor?: string;
  /** Whether the theme is dark */
  isDark?: boolean;
}

/**
 * Panel for uploading videos or adding YouTube URLs
 */
export function VideoUploadPanel({
  invitationId,
  videoUrl,
  videoSource,
  onVideoChange,
  accentColor = "#b76e79",
  isDark = false,
}: VideoUploadPanelProps) {
  const [activeTab, setActiveTab] = useState<VideoSourceTab>(
    videoSource === "youtube" ? "youtube" : "upload",
  );
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file upload
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("video", file);
        formData.append("invitationId", invitationId);
        formData.append("filename", file.name);

        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<{ videoUrl: string }>(
          (resolve, reject) => {
            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const progress = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(progress);
              }
            });

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                const result = JSON.parse(xhr.responseText);
                if (result.success) {
                  resolve(result);
                } else {
                  reject(new Error(result.error || "Upload failed"));
                }
              } else {
                try {
                  const error = JSON.parse(xhr.responseText);
                  reject(new Error(error.error || "Upload failed"));
                } catch {
                  reject(new Error("Upload failed"));
                }
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Network error during upload"));
            });
          },
        );

        xhr.open("POST", "/api/upload-video");
        xhr.send(formData);

        const result = await uploadPromise;
        onVideoChange?.(result.videoUrl, "upload");
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Upload failed",
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [invitationId, onVideoChange],
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle YouTube URL submission
  const handleYoutubeSubmit = useCallback(() => {
    setYoutubeError(null);

    if (!youtubeUrl.trim()) {
      setYoutubeError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      setYoutubeError(
        "Invalid YouTube URL. Please enter a valid YouTube video URL.",
      );
      return;
    }

    // Use the cleaned YouTube URL
    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    onVideoChange?.(cleanUrl, "youtube");
    setYoutubeUrl("");
  }, [youtubeUrl, onVideoChange]);

  // Handle remove video
  const handleRemoveVideo = useCallback(() => {
    onVideoChange?.(null, null);
  }, [onVideoChange]);

  const hasVideo = videoUrl && videoSource;

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Current video preview */}
      {hasVideo && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Current Video</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveVideo}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
          <VideoPlayer
            videoUrl={videoUrl}
            videoSource={videoSource}
            accentColor={accentColor}
            isDark={isDark}
            className="rounded-lg overflow-hidden"
          />
        </div>
      )}

      {/* Source tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            activeTab === "upload"
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100",
          )}
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("youtube")}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            activeTab === "youtube"
              ? "bg-stone-900 text-white"
              : "text-stone-600 hover:bg-stone-100",
          )}
        >
          <Youtube className="h-4 w-4" />
          YouTube
        </button>
      </div>

      {/* Upload section */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          {uploadError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {uploadError}
            </div>
          )}

          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {uploadProgress}%
              </div>
              <div className="h-2 w-full rounded-full bg-stone-200">
                <div
                  className="h-2 rounded-full bg-stone-900 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUploadClick}
              className={cn(
                "flex flex-col items-center justify-center w-full p-8 rounded-lg border-2 border-dashed transition-colors",
                "border-stone-300 hover:border-stone-400 hover:bg-stone-50",
              )}
            >
              <Video className="h-8 w-8 text-stone-400 mb-2" />
              <span className="text-sm font-medium text-stone-700">
                Click to upload video
              </span>
              <span className="text-xs text-stone-500 mt-1">
                MP4, WebM, MOV. Max 50MB.
              </span>
            </button>
          )}
        </div>
      )}

      {/* YouTube section */}
      {activeTab === "youtube" && (
        <div className="space-y-3">
          {youtubeError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {youtubeError}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleYoutubeSubmit();
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleYoutubeSubmit}>Add</Button>
          </div>
          <p className="text-xs text-stone-500">
            Example: https://www.youtube.com/watch?v=...
          </p>
        </div>
      )}
    </div>
  );
}
