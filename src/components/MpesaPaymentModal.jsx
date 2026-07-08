import { useEffect, useRef, useState } from "react";
import { Smartphone, Loader2, CheckCircle2, XCircle, X } from "lucide-react";
import { initiateMpesaPayment, getMpesaStatus } from "../api/mpesaApi";
import { getSale } from "../api/salesApi";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes

// stage: 'requesting' | 'waiting' | 'success' | 'failed' | 'cancelled' | 'timeout' | 'error'
function MpesaPaymentModal({ items, phone, customerName, onSuccess, onClose }) {
    const [stage, setStage] = useState("requesting");
    const [errorMsg, setErrorMsg] = useState("");
    const [sale, setSale] = useState(null);
    const pollCountRef = useRef(0);
    const pollTimerRef = useRef(null);
    const closedRef = useRef(false);

    useEffect(() => {
        closedRef.current = false;
        startPayment();
        return () => {
            closedRef.current = true;
            if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function startPayment() {
        setStage("requesting");
        setErrorMsg("");
        try {
            const res = await initiateMpesaPayment({
                items,
                phone,
                customer_name: customerName || undefined
            });
            if (closedRef.current) return;
            setStage("waiting");
            pollCountRef.current = 0;
            pollStatus(res.data.transaction_id);
        } catch (err) {
            if (closedRef.current) return;
            setStage("error");
            setErrorMsg(err.userMessage || err.response?.data?.error || "Failed to start M-Pesa payment.");
        }
    }

    async function pollStatus(transactionId) {
        if (closedRef.current) return;

        try {
            const res = await getMpesaStatus(transactionId);
            const status = res.data.status;

            if (closedRef.current) return;

            if (status === "success") {
                // Fetch the full sale record now that it exists
                const saleRes = await getSale(res.data.sale_id);
                setSale(saleRes.data);
                setStage("success");
                return;
            }

            if (status === "failed") {
                setStage("failed");
                setErrorMsg(res.data.result_desc || "Payment failed.");
                return;
            }

            if (status === "cancelled") {
                setStage("cancelled");
                return;
            }

            // still pending/processing — keep polling
            pollCountRef.current += 1;
            if (pollCountRef.current >= MAX_POLLS) {
                setStage("timeout");
                return;
            }
            pollTimerRef.current = setTimeout(() => pollStatus(transactionId), POLL_INTERVAL_MS);
        } catch (err) {
            if (closedRef.current) return;
            setStage("error");
            setErrorMsg(err.userMessage || "Lost connection while checking payment status.");
        }
    }

    const handleClose = () => {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        onClose();
    };

    const handleDone = () => {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        onSuccess(sale);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                {(stage !== "requesting" && stage !== "waiting") && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

                {(stage === "requesting" || stage === "waiting") && (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="relative mb-4">
                            <Smartphone className="h-12 w-12 text-blue-600" />
                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin absolute -bottom-1 -right-1 bg-white rounded-full" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">
                            {stage === "requesting" ? "Sending payment request…" : "Check your phone"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2">
                            {stage === "requesting"
                                ? "Sending the M-Pesa prompt to " + phone
                                : `Ask the customer to enter their M-Pesa PIN on ${phone} to complete payment.`}
                        </p>
                    </div>
                )}

                {stage === "success" && (
                    <div className="flex flex-col items-center text-center py-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
                        <h3 className="font-bold text-lg text-gray-900">Payment received</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Receipt: <span className="font-mono font-bold text-green-700">{sale?.receipt_number}</span>
                        </p>
                        <button
                            onClick={handleDone}
                            className="mt-6 w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                        >
                            Done
                        </button>
                    </div>
                )}

                {(stage === "failed" || stage === "error") && (
                    <div className="flex flex-col items-center text-center py-4">
                        <XCircle className="h-12 w-12 text-red-600 mb-4" />
                        <h3 className="font-bold text-lg text-gray-900">Payment failed</h3>
                        <p className="text-sm text-gray-500 mt-2">{errorMsg || "Something went wrong."}</p>
                        <div className="flex gap-3 mt-6 w-full">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startPayment}
                                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {stage === "cancelled" && (
                    <div className="flex flex-col items-center text-center py-4">
                        <XCircle className="h-12 w-12 text-amber-500 mb-4" />
                        <h3 className="font-bold text-lg text-gray-900">Payment cancelled</h3>
                        <p className="text-sm text-gray-500 mt-2">The customer cancelled the M-Pesa prompt.</p>
                        <div className="flex gap-3 mt-6 w-full">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={startPayment}
                                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {stage === "timeout" && (
                    <div className="flex flex-col items-center text-center py-4">
                        <Smartphone className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="font-bold text-lg text-gray-900">Still waiting…</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            This is taking longer than usual. If the customer already paid, it may still confirm shortly —
                            check the Sales page in a moment. Otherwise, try again.
                        </p>
                        <div className="flex gap-3 mt-6 w-full">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={startPayment}
                                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MpesaPaymentModal;
