import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";

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

function getR2Client() {
	const config = getR2Config();
	if (!config) return null;

	const client = new S3Client({
		region: "auto",
		endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
	});

	return { client, config };
}

/** Generate a content-addressed key from a buffer */
export function contentHash(buffer: Buffer): string {
	return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

/** Upload a buffer to R2 and return the public URL */
export async function uploadToR2(
	key: string,
	buffer: Buffer,
	contentType: string,
): Promise<string> {
	const r2 = getR2Client();
	if (!r2) throw new Error("R2 storage not configured");

	await r2.client.send(
		new PutObjectCommand({
			Bucket: r2.config.bucketName,
			Key: key,
			Body: buffer,
			ContentType: contentType,
			CacheControl: "public, max-age=31536000, immutable",
		}),
	);

	return r2.config.publicUrl
		? `${r2.config.publicUrl}/${key}`
		: `https://${r2.config.accountId}.r2.cloudflarestorage.com/${r2.config.bucketName}/${key}`;
}

/** Delete an object from R2 by key */
export async function deleteFromR2(key: string): Promise<void> {
	const r2 = getR2Client();
	if (!r2) return;

	await r2.client.send(
		new DeleteObjectCommand({
			Bucket: r2.config.bucketName,
			Key: key,
		}),
	);
}

/** Extract the R2 key from a full public URL */
export function extractR2Key(url: string): string | null {
	const config = getR2Config();
	if (!config?.publicUrl) return null;

	if (url.startsWith(config.publicUrl)) {
		return url.slice(config.publicUrl.length + 1);
	}
	return null;
}
