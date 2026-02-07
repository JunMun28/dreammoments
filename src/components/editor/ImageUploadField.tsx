import { LoadingSpinner } from "../ui/LoadingSpinner";

type ImageUploadFieldProps = {
	fieldPath: string;
	label: string;
	value: string;
	isUploading: boolean;
	onUpload: (fieldPath: string, file: File) => void;
	onRemove: (fieldPath: string) => void;
};

export function ImageUploadField({
	fieldPath,
	label,
	value,
	isUploading,
	onUpload,
	onRemove,
}: ImageUploadFieldProps) {
	return (
		<div className="space-y-2">
			<p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]">
				{label}
			</p>
			<div className="relative">
				<input
					type="file"
					accept="image/*"
					name={fieldPath}
					aria-label={label}
					disabled={isUploading}
					onChange={(event) => {
						const file = event.target.files?.[0];
						if (file) onUpload(fieldPath, file);
					}}
					className="w-full rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface-muted)] px-4 py-3 text-base text-[color:var(--dm-ink)] disabled:cursor-not-allowed disabled:opacity-50"
				/>
				{isUploading && (
					<div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[color:var(--dm-surface)]/80">
						<div className="flex items-center gap-2">
							<LoadingSpinner size="sm" />
							<span className="text-xs text-[color:var(--dm-muted)]">
								Uploading...
							</span>
						</div>
					</div>
				)}
			</div>
			{value && (
				<img
					src={value}
					alt="Uploaded"
					width={320}
					height={128}
					className="h-32 w-full rounded-2xl object-cover"
					loading="lazy"
				/>
			)}
			{value ? (
				<button
					type="button"
					className="min-h-11 rounded-full border border-[color:var(--dm-border)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-muted)]"
					onClick={() => onRemove(fieldPath)}
					disabled={isUploading}
				>
					Remove Image
				</button>
			) : null}
		</div>
	);
}

export default ImageUploadField;
