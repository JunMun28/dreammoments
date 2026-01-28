import { Loader2, Music, Pause, Play, Trash2, Upload } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  formatDuration,
  getTrackById,
  getTrackDisplayTitle,
  musicLibrary,
  type MusicCategory,
  type MusicTrack,
} from "@/lib/music-library";

type CategoryFilter = "all" | MusicCategory | "uploaded";

/**
 * Uploaded music track (user's custom music)
 */
interface UploadedTrack {
  id: string;
  title: string;
  url: string;
  duration?: number;
}

interface MusicPanelProps {
  /** Currently selected track ID */
  selectedTrackId?: string | null;
  /** Currently selected custom music URL (for uploaded music) */
  selectedMusicUrl?: string | null;
  /** Invitation ID for uploads */
  invitationId?: string;
  /** Callback when a track is selected or removed */
  onTrackSelect?: (track: MusicTrack | null) => void;
  /** Callback when custom music URL is selected */
  onCustomMusicSelect?: (url: string | null, title?: string) => void;
}

/**
 * Music panel for selecting background audio for invitations.
 * Features category tabs, track list with preview, upload support, and current music display.
 */
export function MusicPanel({
  selectedTrackId,
  selectedMusicUrl,
  invitationId,
  onTrackSelect,
  onCustomMusicSelect,
}: MusicPanelProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [uploadedTracks, setUploadedTracks] = useState<UploadedTrack[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get the selected track details
  const selectedTrack = selectedTrackId
    ? getTrackById(selectedTrackId)
    : undefined;

  // Check if custom music is selected (uploaded track)
  const isCustomMusicSelected = !selectedTrack && selectedMusicUrl;

  // Filter tracks by category
  const filteredTracks = useMemo(() => {
    if (activeCategory === "uploaded") {
      return []; // Uploaded tracks are shown separately
    }
    if (activeCategory === "all") {
      return musicLibrary;
    }
    return musicLibrary.filter((track) => track.category === activeCategory);
  }, [activeCategory]);

  // Category tabs for SG/MY Chinese weddings
  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "romantic", label: "Romantic" },
    { id: "chinese-classics", label: "经典" },
    { id: "chinese-modern", label: "华语" },
    { id: "instrumental", label: "Instrumental" },
    { id: "contemporary", label: "Contemporary" },
    { id: "uploaded", label: "Uploaded" },
  ];

  const handleCategoryChange = (category: CategoryFilter) => {
    setActiveCategory(category);
  };

  const handlePlayPreview = (track: MusicTrack | UploadedTrack) => {
    if (playingTrackId === track.id) {
      // Stop playing
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      // Start playing new track
      if (audioRef.current) {
        audioRef.current.src =
          "previewUrl" in track ? track.previewUrl || track.url : track.url;
        audioRef.current.play().catch(() => {
          // Audio playback failed - likely blocked by browser
        });
      }
      setPlayingTrackId(track.id);
    }
  };

  const handleSelectTrack = (track: MusicTrack) => {
    onTrackSelect?.(track);
    onCustomMusicSelect?.(null); // Clear custom music when selecting library track
  };

  const handleSelectUploadedTrack = (track: UploadedTrack) => {
    onCustomMusicSelect?.(track.url, track.title);
    onTrackSelect?.(null); // Clear library track when selecting uploaded track
  };

  const handleRemoveTrack = () => {
    onTrackSelect?.(null);
    onCustomMusicSelect?.(null);
  };

  // Handle file upload
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !invitationId) return;

      setUploadError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("audio", file);
        formData.append("invitationId", invitationId);
        formData.append("filename", file.name);

        const response = await fetch("/api/upload-music", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Upload failed");
        }

        // Add to uploaded tracks
        const newTrack: UploadedTrack = {
          id: `uploaded-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          url: result.musicUrl,
        };
        setUploadedTracks((prev) => [...prev, newTrack]);

        // Auto-select the uploaded track
        handleSelectUploadedTrack(newTrack);

        // Switch to uploaded category
        setActiveCategory("uploaded");
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Upload failed",
        );
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [invitationId],
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Get current music display info
  const currentMusicDisplay = useMemo(() => {
    if (selectedTrack) {
      return {
        title: getTrackDisplayTitle(selectedTrack),
        subtitle: `${selectedTrack.artist} - ${formatDuration(selectedTrack.duration)}`,
      };
    }
    if (isCustomMusicSelected) {
      // Find in uploaded tracks or use URL
      const uploadedTrack = uploadedTracks.find(
        (t) => t.url === selectedMusicUrl,
      );
      return {
        title: uploadedTrack?.title || "Custom Music",
        subtitle: "Uploaded track",
      };
    }
    return null;
  }, [selectedTrack, isCustomMusicSelected, selectedMusicUrl, uploadedTracks]);

  return (
    <div className="flex h-full flex-col">
      {/* Hidden audio element for previews */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingTrackId(null)}
        className="hidden"
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Current Music Section */}
      {currentMusicDisplay && (
        <div
          data-testid="current-music-section"
          className="border-b border-stone-200 p-4"
        >
          <Label className="mb-2 text-sm font-medium text-stone-700">
            Current Music
          </Label>
          <div className="flex items-center justify-between rounded-lg bg-stone-100 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-900 text-white">
                <Music className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium text-stone-900">
                  {currentMusicDisplay.title}
                </div>
                <div className="text-sm text-stone-500">
                  {currentMusicDisplay.subtitle}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveTrack}
              aria-label="Remove music"
              className="text-stone-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div
        role="tablist"
        className="flex gap-1 overflow-x-auto border-b border-stone-200 px-4 py-2"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {category.label}
            {category.id === "uploaded" && uploadedTracks.length > 0 && (
              <span className="ml-1 rounded-full bg-stone-600 px-1.5 text-xs text-white">
                {uploadedTracks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Track List */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Uploaded tracks view */}
        {activeCategory === "uploaded" && (
          <>
            {uploadedTracks.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                <Upload className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No uploaded music yet</p>
                <p className="text-xs mt-1">
                  Click the button below to upload your own music
                </p>
              </div>
            ) : (
              <ul className="space-y-2" role="list">
                {uploadedTracks.map((track) => (
                  <li
                    key={track.id}
                    data-testid="uploaded-track-item"
                    className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      selectedMusicUrl === track.url
                        ? "selected border-stone-900 bg-stone-50"
                        : "border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePlayPreview(track)}
                        aria-label={
                          playingTrackId === track.id
                            ? "Pause preview"
                            : "Play preview"
                        }
                        className="h-8 w-8"
                      >
                        {playingTrackId === track.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <div className="font-medium text-stone-900">
                          {track.title}
                        </div>
                        <div className="text-sm text-stone-500">
                          Uploaded track
                        </div>
                      </div>
                    </div>
                    <Button
                      variant={
                        selectedMusicUrl === track.url ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleSelectUploadedTrack(track)}
                      disabled={selectedMusicUrl === track.url}
                    >
                      {selectedMusicUrl === track.url ? "Selected" : "Use"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Library tracks view */}
        {activeCategory !== "uploaded" && (
          <ul className="space-y-2" role="list">
            {filteredTracks.map((track) => (
              <li
                key={track.id}
                data-testid="track-item"
                className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedTrackId === track.id
                    ? "selected border-stone-900 bg-stone-50"
                    : "border-stone-200 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlayPreview(track)}
                    aria-label={
                      playingTrackId === track.id
                        ? "Pause preview"
                        : "Play preview"
                    }
                    className="h-8 w-8"
                  >
                    {playingTrackId === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <div className="font-medium text-stone-900">
                      {getTrackDisplayTitle(track)}
                    </div>
                    <div className="text-sm text-stone-500">{track.artist}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-500">
                    {formatDuration(track.duration)}
                  </span>
                  <Button
                    variant={
                      selectedTrackId === track.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleSelectTrack(track)}
                    disabled={selectedTrackId === track.id}
                  >
                    {selectedTrackId === track.id ? "Selected" : "Use"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Upload Section */}
      <div className="border-t border-stone-200 p-4">
        {uploadError && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {uploadError}
          </div>
        )}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleUploadClick}
          disabled={isUploading || !invitationId}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Your Music
            </>
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-stone-500">
          MP3, WAV, OGG supported. Max 10MB.
        </p>
      </div>
    </div>
  );
}
