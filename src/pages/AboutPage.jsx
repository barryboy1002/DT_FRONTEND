import { Link } from "react-router-dom";
import { Store, Wifi, ShieldCheck } from "lucide-react";

function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
            <div className="text-center space-y-3">
                <h1 className="text-4xl font-bold text-slate-900">About Shack</h1>
                <p className="text-slate-500 text-lg">
                    Shop management built for the way local shops actually run.
                </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
                Shack helps shop owners keep track of stock, sales, purchases, and staff —
                without needing a computer science degree to set it up. Whether you run a single
                shop or a few branches, Shack keeps your numbers straight so you can focus on
                running the business.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 pt-4">
                <div className="text-center space-y-2">
                    <Store className="mx-auto h-8 w-8 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Built for dukas</h3>
                    <p className="text-sm text-slate-500">
                        Sales, stock, and purchases in one place, designed around how local shops actually work.
                    </p>
                </div>
                <div className="text-center space-y-2">
                    <Wifi className="mx-auto h-8 w-8 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">M-Pesa ready</h3>
                    <p className="text-sm text-slate-500">
                        Accept M-Pesa payments directly at checkout using your own Paybill or Till.
                    </p>
                </div>
                <div className="text-center space-y-2">
                    <ShieldCheck className="mx-auto h-8 w-8 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Your data, protected</h3>
                    <p className="text-sm text-slate-500">
                        Sensitive credentials are encrypted, and every business's data stays fully separate.
                    </p>
                </div>
            </div>

            <div className="text-center pt-4">
                <Link to="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                    Have questions? Get in touch →
                </Link>
            </div>
        </div>
    );
}

export default AboutPage;
