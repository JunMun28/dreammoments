/**
 * Standardized API error class for consistent error handling across all API handlers.
 *
 * Usage:
 *   throw new ApiError("Not found", 404);
 *   throw ApiError.notFound("Invitation not found");
 *   throw ApiError.forbidden("Access denied");
 *   throw ApiError.badRequest("Invalid email");
 *   throw ApiError.rateLimit();
 *   throw ApiError.unavailable();
 */
export class ApiError extends Error {
	readonly status: number;
	readonly code: string;

	constructor(message: string, status = 400, code?: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code ?? statusToCode(status);
	}

	toJSON(): { error: string; code: string; status: number } {
		return { error: this.message, code: this.code, status: this.status };
	}

	static badRequest(message: string): ApiError {
		return new ApiError(message, 400, "BAD_REQUEST");
	}

	static unauthorized(message = "Authentication required"): ApiError {
		return new ApiError(message, 401, "UNAUTHORIZED");
	}

	static forbidden(message = "Access denied"): ApiError {
		return new ApiError(message, 403, "FORBIDDEN");
	}

	static notFound(message = "Resource not found"): ApiError {
		return new ApiError(message, 404, "NOT_FOUND");
	}

	static rateLimit(
		message = "Too many attempts. Please try again later.",
	): ApiError {
		return new ApiError(message, 429, "RATE_LIMITED");
	}

	static unavailable(
		message = "Service unavailable. Please try again later.",
	): ApiError {
		return new ApiError(message, 503, "UNAVAILABLE");
	}
}

function statusToCode(status: number): string {
	switch (status) {
		case 400:
			return "BAD_REQUEST";
		case 401:
			return "UNAUTHORIZED";
		case 403:
			return "FORBIDDEN";
		case 404:
			return "NOT_FOUND";
		case 429:
			return "RATE_LIMITED";
		case 503:
			return "UNAVAILABLE";
		default:
			return "INTERNAL_ERROR";
	}
}

/**
 * Helper to convert ApiError to the { error: string } format
 * used by existing client code. This allows gradual migration:
 * handlers can throw ApiError, and the framework or a wrapper
 * can catch and convert to the expected response format.
 */
export function toErrorResponse(err: unknown): { error: string } {
	if (err instanceof ApiError) {
		return { error: err.message };
	}
	if (err instanceof Error) {
		return { error: err.message };
	}
	return { error: "An unexpected error occurred" };
}
