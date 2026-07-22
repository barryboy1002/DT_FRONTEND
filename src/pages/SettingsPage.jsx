import { useEffect, useState } from "react";
import { getMpesaSettings, updateMpesaSettings } from "../api/businessesApi";

function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [settings, setSettings] = useState(null);

    const [formData, setFormData] = useState({
        mpesa_enabled: false,
        mpesa_env: "sandbox",
        mpesa_shortcode: "",
        mpesa_consumer_key: "",
        mpesa_consumer_secret: "",
        mpesa_passkey: ""
    });

    useEffect(() => {
        async function load() {
            try {
                const res = await getMpesaSettings();
                const data = res.data;
                setSettings(data);
                setFormData((prev) => ({
                    ...prev,
                    mpesa_enabled: data.mpesa_enabled,
                    mpesa_env: data.mpesa_env || "sandbox",
                    mpesa_shortcode: data.mpesa_shortcode || ""
                }));
            } catch (err) {
                setError(err.userMessage || "Failed to load settings.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        setSuccessMsg("");
        setError("");
    }

    async function handleOptOut() {
        setSaving(true);
        setError("");
        setSuccessMsg("");
        try {
            const res = await updateMpesaSettings({ mpesa_enabled: false });
            setSettings((prev) => ({ ...prev, ...res.data }));
            setFormData((prev) => ({ ...prev, mpesa_enabled: false }));
            setSuccessMsg("M-Pesa payments disabled. You can re-enable anytime.");
        } catch (err) {
            setError(err.userMessage || "Failed to update settings.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMsg("");

        try {
            const payload = {
                mpesa_enabled: true,
                mpesa_env: formData.mpesa_env,
                mpesa_shortcode: formData.mpesa_shortcode.trim(),
                mpesa_consumer_key: formData.mpesa_consumer_key.trim() || undefined,
                mpesa_consumer_secret: formData.mpesa_consumer_secret.trim() || undefined,
                mpesa_passkey: formData.mpesa_passkey.trim() || undefined
            };
            const res = await updateMpesaSettings(payload);
            setSettings((prev) => ({ ...prev, ...res.data, has_consumer_key: true, has_consumer_secret: true, has_passkey: true }));
            setFormData((prev) => ({
                ...prev,
                mpesa_enabled: true,
                mpesa_consumer_key: "",
                mpesa_consumer_secret: "",
                mpesa_passkey: ""
            }));
            setSuccessMsg("M-Pesa settings saved. You can now accept M-Pesa payments.");
        } catch (err) {
            setError(err.userMessage || "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="p-8 text-gray-500">Loading settings…</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

            <div className="bg-white rounded-xl shadow p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">M-Pesa Payments</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Connect your Paybill or Till number to accept M-Pesa payments directly in Shack.
                            Don't have one yet? You can skip this — cash sales work fine without it.
                        </p>
                    </div>
                    {settings?.mpesa_enabled && (
                        <span className="shrink-0 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            Enabled
                        </span>
                    )}
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {successMsg}
                    </div>
                )}

                {settings?.mpesa_enabled ? (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Shortcode:</span> {settings.mpesa_shortcode}</p>
                            <p><span className="font-medium">Environment:</span> {settings.mpesa_env}</p>
                        </div>
                        <button
                            onClick={handleOptOut}
                            disabled={saving}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                        >
                            {saving ? "Disabling…" : "Disable M-Pesa"}
                        </button>
                        <details className="pt-2">
                            <summary className="text-sm text-blue-600 cursor-pointer">Update credentials</summary>
                            <div className="mt-4">
                                <MpesaForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} saving={saving} isUpdate />
                            </div>
                        </details>
                    </div>
                ) : (
                    <MpesaForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} saving={saving} />
                )}
            </div>
        </div>
    );
}

function MpesaForm({ formData, onChange, onSubmit, saving, isUpdate = false }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Environment</label>
                <select
                    name="mpesa_env"
                    value={formData.mpesa_env}
                    onChange={onChange}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="sandbox">Sandbox (testing)</option>
                    <option value="production">Production (live)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Paybill / Till Number (Shortcode)</label>
                <input
                    type="text"
                    name="mpesa_shortcode"
                    value={formData.mpesa_shortcode}
                    onChange={onChange}
                    required
                    placeholder="174379"
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Consumer Key</label>
                <input
                    type="text"
                    name="mpesa_consumer_key"
                    value={formData.mpesa_consumer_key}
                    onChange={onChange}
                    placeholder={isUpdate ? "Leave blank to keep current" : "From your Daraja app"}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Consumer Secret</label>
                <input
                    type="password"
                    name="mpesa_consumer_secret"
                    value={formData.mpesa_consumer_secret}
                    onChange={onChange}
                    placeholder={isUpdate ? "Leave blank to keep current" : "From your Daraja app"}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Passkey</label>
                <input
                    type="password"
                    name="mpesa_passkey"
                    value={formData.mpesa_passkey}
                    onChange={onChange}
                    placeholder={isUpdate ? "Leave blank to keep current" : "From Safaricom / your Daraja app"}
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
            >
                {saving ? "Saving…" : isUpdate ? "Update Credentials" : "Enable M-Pesa"}
            </button>
        </form>
    );
}

export default SettingsPage;
