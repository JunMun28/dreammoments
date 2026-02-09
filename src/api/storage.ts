import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAuth } from "@/lib/server-auth";
import { parseInput } from "./validate";

// ── R2 configuration (server-only) ─────────────────────────────────

function getR2Config() {
	const accountId = process.env.R2_ACCOUNT_ID;
	const accessKeyId = process.env.R2_ACCESS_KEY_ID;
	const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
	const bucketName = process.env.R2_BUCKET_NAME;
	const publicUrl = process.env.R2_PUBLIC_URL;

	if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
		return null;
	}

	return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

// ── Get upload URL ──────────────────────────────────────────────────

const getUploadUrlSchema = z.object({
	token: z.string().min(1, "Token is required"),
	filename: z.string().min(1, "Filename is required"),
	contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

export const getUploadUrlFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: { token: string; filename: string; contentType: string }) =>
			parseInput(getUploadUrlSchema, data),
	)
	.handler(async ({ data }) => {
		await requireAuth(data.token);

		const r2 = getR2Config();
		if (!r2) {
			return { available: false as const };
		}

		// Generate a unique key for the object
		const sanitizedName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
		const key = `uploads/${Date.now()}-${sanitizedName}`;

		// Return the upload endpoint and key for direct PUT upload
		const uploadEndpoint = `https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucketName}/${key}`;

		return {
			available: true as const,
			uploadEndpoint,
			key,
			publicUrl: r2.publicUrl ? `${r2.publicUrl}/${key}` : null,
		};
	});

// ── Confirm upload ──────────────────────────────────────────────────

const confirmUploadSchema = z.object({
	token: z.string().min(1, "Token is required"),
	key: z.string().min(1, "Key is required"),
});

export const confirmUploadFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: { token: string; key: string }) =>
		parseInput(confirmUploadSchema, data),
	)
	.handler(async ({ data }) => {
		await requireAuth(data.token);

		const r2 = getR2Config();
		if (!r2) {
			return { error: "R2 storage not configured" };
		}

		const publicUrl = r2.publicUrl
			? `${r2.publicUrl}/${data.key}`
			: `https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucketName}/${data.key}`;

		return { url: publicUrl };
	});
