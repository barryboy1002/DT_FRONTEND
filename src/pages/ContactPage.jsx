import { Mail, Phone } from "lucide-react";

function ContactPage() {
    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold text-slate-900">Get in Touch</h1>
                <p className="text-slate-500">
                    Questions, feedback, or need help setting up your shop? Reach out directly.
                </p>
            </div>

            <div className="space-y-4">
                <a
                    href="mailto:odorobarry@gmail.com"
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-medium text-slate-900">odorobarry@gmail.com</p>
                    </div>
                </a>

                <a
                    href="tel:+254724946955"
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="font-medium text-slate-900">0724 946 955</p>
                    </div>
                </a>
            </div>

            <p className="text-center text-sm text-slate-400">
                DukaTrack is actively being built — your feedback helps shape what comes next.
            </p>
        </div>
    );
}

export default ContactPage;
