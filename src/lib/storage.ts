const uploadUrl = import.meta.env.VITE_R2_UPLOAD_URL as string | undefined;
const publicBaseUrl = import.meta.env.VITE_R2_PUBLIC_BASE_URL as
	| string
	| undefined;

// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional stripping of control characters for security
const CONTROL_CHARS = /[\x00-\x1f]/g;

function sanitizeFilename(name: string): string {
	const basename = name.split(/[\\/]/).pop() || "upload";
	return basename.replace(CONTROL_CHARS, "").replace(/\.\./g, "") || "upload";
}

export async function uploadImage(file: File) {
	if (uploadUrl && publicBaseUrl) {
		const key = `${Date.now()}-${sanitizeFilename(file.name)}`;
		await fetch(`${uploadUrl}/${key}`, {
			method: "PUT",
			body: file,
			headers: { "Content-Type": file.type },
		});
		return {
			url: `${publicBaseUrl}/${key}`,
			storage: "r2" as const,
		};
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
