import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
	id: string;
	type: ToastType;
	message: string;
}

interface ToastContextValue {
	addToast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return ctx;
}

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 5000;

const icons: Record<ToastType, React.ReactNode> = {
	success: <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />,
	error: <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />,
	info: <Info className="h-5 w-5 shrink-0" aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [dismissing, setDismissing] = useState<Set<string>>(new Set());
	const counterRef = useRef(0);
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
		new Map(),
	);

	const removeToast = useCallback((id: string) => {
		const timer = timersRef.current.get(id);
		if (timer) {
			clearTimeout(timer);
			timersRef.current.delete(id);
		}
		setDismissing((prev) => {
			const next = new Set(prev);
			next.add(id);
			return next;
		});
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
			setDismissing((prev) => {
				const next = new Set(prev);
				next.delete(id);
				return next;
			});
		}, 300);
	}, []);

	const addToast = useCallback(
		(toast: Omit<Toast, "id">) => {
			counterRef.current += 1;
			const id = `toast-${counterRef.current}`;
			setToasts((prev) => {
				const next = [{ ...toast, id }, ...prev];
				if (next.length > MAX_VISIBLE) {
					const overflow = next.slice(MAX_VISIBLE);
					for (const t of overflow) {
						const timer = timersRef.current.get(t.id);
						if (timer) {
							clearTimeout(timer);
							timersRef.current.delete(t.id);
						}
					}
					return next.slice(0, MAX_VISIBLE);
				}
				return next;
			});
			const timer = setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
			timersRef.current.set(id, timer);
		},
		[removeToast],
	);

	const visible = toasts.slice(0, MAX_VISIBLE);

	return (
		<ToastContext.Provider value={{ addToast }}>
			{children}
			<div className="dm-toast-container" aria-live="polite">
				{visible.map((toast) => (
					<div
						key={toast.id}
						className={`dm-toast dm-toast-${toast.type}${dismissing.has(toast.id) ? " dm-toast-dismiss" : ""}`}
						role={toast.type === "error" ? "alert" : "status"}
					>
						{icons[toast.type]}
						<p className="dm-toast-message">{toast.message}</p>
						<button
							type="button"
							className="dm-toast-close"
							onClick={() => removeToast(toast.id)}
							aria-label="Dismiss notification"
						>
							<X className="h-4 w-4" aria-hidden="true" />
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}
