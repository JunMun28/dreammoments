import { confirmUploadFn, getUploadUrlFn } from "@/api/storage";

// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional stripping of control characters for security
const CONTROL_CHARS = /[\x00-\x1f]/g;

function sanitizeFilename(name: string): string {
	const basename = name.split(/[\\/]/).pop() || "upload";
	return basename.replace(CONTROL_CHARS, "").replace(/\.\./g, "") || "upload";
}

export async function uploadImage(file: File, token?: string) {
	if (
		file.type === "image/jpeg" ||
		file.type === "image/png" ||
		file.type === "image/webp"
	) {
		const signed = await getUploadUrlFn({
			data: {
				token,
				filename: sanitizeFilename(file.name),
				contentType: file.type,
			},
		});

		if (signed.available) {
			const response = await fetch(signed.uploadEndpoint, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			});
			if (!response.ok) {
				throw new Error(`Upload failed with status ${response.status}`);
			}

			const confirmed = await confirmUploadFn({
				data: {
					token,
					key: signed.key,
				},
			});

			if ("error" in confirmed) {
				throw new Error(confirmed.error);
			}

			return {
				url: confirmed.url,
				storage: "r2" as const,
			};
		}
	}

	const dataUrl = await readFileAsDataUrl(file);
	return { url: dataUrl, storage: "local" as const };
}

function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
