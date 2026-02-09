import { Gift, QrCode } from "lucide-react";
import { generateQrDataUrl } from "@/lib/qr";
import { cn } from "@/lib/utils";

type PaymentMethod = "duitnow" | "paynow" | "tng";

interface AngpowQRCodeProps {
	paymentUrl: string;
	paymentMethod: PaymentMethod;
	recipientName?: string;
	className?: string;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
	duitnow: "DuitNow",
	paynow: "PayNow",
	tng: "Touch 'n Go",
};

export default function AngpowQRCode({
	paymentUrl,
	paymentMethod,
	recipientName,
	className,
}: AngpowQRCodeProps) {
	const qrDataUrl = generateQrDataUrl(paymentUrl, 6, 3);

	return (
		<div
			className={cn(
				"mx-auto max-w-sm rounded-3xl border-2 border-[#D4AF37]/40 p-6 text-center",
				"bg-gradient-to-b from-[#B22222] to-[#8B0000]",
				"shadow-[0_8px_32px_rgba(139,0,0,0.25)]",
				className,
			)}
			role="region"
			aria-label="Digital red packet"
		>
			{/* Gold decorative top border */}
			<div
				className="mx-auto mb-4 h-px w-3/4"
				style={{
					background:
						"linear-gradient(90deg, transparent, #D4AF37, transparent)",
				}}
				aria-hidden="true"
			/>

			{/* Header */}
			<div className="flex items-center justify-center gap-2">
				<Gift className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
				<p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
					Digital Red Packet
				</p>
			</div>

			{recipientName && (
				<p className="mt-2 text-sm text-[#FFD700]/80">To: {recipientName}</p>
			)}

			{/* QR Code */}
			<div className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3 shadow-inner">
				<img
					src={qrDataUrl}
					alt={`QR code for ${PAYMENT_LABELS[paymentMethod]} payment`}
					width={180}
					height={180}
					className="h-auto w-full"
				/>
			</div>

			{/* Payment method label */}
			<div className="mt-4 flex items-center justify-center gap-2">
				<QrCode className="h-4 w-4 text-[#FFD700]/70" aria-hidden="true" />
				<p className="text-xs uppercase tracking-[0.2em] text-[#FFD700]/70">
					{PAYMENT_LABELS[paymentMethod]}
				</p>
			</div>

			{/* Instruction */}
			<p className="mt-3 text-xs text-white/70">Scan to send your blessing</p>

			{/* Gold decorative bottom border */}
			<div
				className="mx-auto mt-4 h-px w-3/4"
				style={{
					background:
						"linear-gradient(90deg, transparent, #D4AF37, transparent)",
				}}
				aria-hidden="true"
			/>
		</div>
	);
}
