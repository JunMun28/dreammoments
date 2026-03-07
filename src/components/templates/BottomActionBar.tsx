import { Gift, Heart, MessageCircle, Volume2, VolumeX } from "lucide-react";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import "./bottom-action-bar.css";

interface BottomActionBarProps {
	isPlaying?: boolean;
	onMusicToggle?: () => void;
	onGiftClick?: () => void;
	onMessageClick?: () => void;
	onLikeClick?: () => void;
	likeCount?: number;
	primaryColor?: string;
	className?: string;
}

interface FloatingHeart {
	id: number;
	x: number;
	y: number;
}

let heartIdCounter = 0;

export default function BottomActionBar({
	isPlaying,
	onMusicToggle,
	onGiftClick,
	onMessageClick,
	onLikeClick,
	likeCount,
	primaryColor,
	className,
}: BottomActionBarProps) {
	const [hearts, setHearts] = useState<FloatingHeart[]>([]);
	const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
	const componentId = useId();

	useEffect(() => {
		const timers = timersRef.current;
		return () => {
			for (const t of timers) clearTimeout(t);
			timers.clear();
		};
	}, []);

	const handleLikeClick = useCallback(() => {
		onLikeClick?.();

		const count = 4 + Math.floor(Math.random() * 2); // 4–5 hearts
		const newHearts: FloatingHeart[] = [];
		for (let i = 0; i < count; i++) {
			newHearts.push({
				id: ++heartIdCounter,
				x: (Math.random() - 0.5) * 30,
				y: -(40 + Math.random() * 40),
			});
		}
		setHearts((prev) => [...prev, ...newHearts]);

		const ids = newHearts.map((h) => h.id);
		const timer = setTimeout(() => {
			setHearts((prev) => prev.filter((h) => !ids.includes(h.id)));
			timersRef.current.delete(timer);
		}, 850);
		timersRef.current.add(timer);
	}, [onLikeClick]);

	const barStyle = primaryColor
		? ({ "--bar-primary": primaryColor } as CSSProperties)
		: undefined;

	const MusicIcon = isPlaying ? Volume2 : VolumeX;

	return (
		<div
			className={cn("bottom-action-bar", className)}
			style={barStyle}
			role="toolbar"
			aria-label="Invitation actions"
		>
			<button
				type="button"
				className="bottom-action-bar__btn"
				onClick={onMusicToggle}
				aria-label={isPlaying ? "Pause music" : "Play music"}
			>
				<MusicIcon size={22} />
			</button>

			<button
				type="button"
				className="bottom-action-bar__btn"
				onClick={onGiftClick}
				aria-label="Send gift"
			>
				<Gift size={22} />
			</button>

			<button
				type="button"
				className="bottom-action-bar__btn"
				onClick={onMessageClick}
				aria-label="Leave a message"
			>
				<MessageCircle size={22} />
			</button>

			<button
				type="button"
				className="bottom-action-bar__btn"
				onClick={handleLikeClick}
				aria-label="Like"
			>
				<Heart size={22} />
				{likeCount != null && (
					<span className="bottom-action-bar__like-count">{likeCount}</span>
				)}
				{hearts.length > 0 && (
					<span className="bottom-action-bar__hearts" aria-hidden="true">
						{hearts.map((h) => (
							<Heart
								key={`${componentId}-heart-${h.id}`}
								size={14}
								fill="currentColor"
								className="bottom-action-bar__float-heart"
								style={
									{
										left: `${h.x}px`,
										"--float-y": `${h.y}px`,
										color: primaryColor || "var(--bar-primary)",
									} as CSSProperties
								}
							/>
						))}
					</span>
				)}
			</button>
		</div>
	);
}
