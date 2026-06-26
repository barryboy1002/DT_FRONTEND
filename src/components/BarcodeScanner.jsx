import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";

function BarcodeScanner({ onScan, onClose }) {
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState("");
    const html5QrCodeRef = useRef(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        startScanner();
        
        return () => {
            isMountedRef.current = false;
            cleanupScanner();
        };
    }, []);

    const startScanner = async () => {
        try {
            setError("");
            const html5QrCode = new Html5Qrcode("barcode-reader");
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 }
                },
                async (decodedText) => {
                    // Stop scanner immediately when barcode is detected
                    await cleanupScanner();
                    if (isMountedRef.current) {
                        onScan(decodedText);
                    }
                },
                (errorMessage) => {
                    // Ignore scanning errors (happens continuously while scanning)
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Scanner error:", err);
            setError("Failed to start camera. Please check permissions.");
        }
    };

    const cleanupScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                const state = html5QrCodeRef.current.getState();
                if (state === 2) { // Html5QrcodeScannerState.SCANNING
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current.clear();
                html5QrCodeRef.current = null;
                setIsScanning(false);
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
    };

    const handleClose = async () => {
        await cleanupScanner();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <span>Scan Barcode</span>
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="p-6">
                    {error ? (
                        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    ) : (
                        <>
                            <div id="barcode-reader" className="w-full rounded-lg overflow-hidden"></div>
                            <p className="text-sm text-gray-500 mt-4 text-center">
                                Position the barcode within the frame to scan
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BarcodeScanner;
