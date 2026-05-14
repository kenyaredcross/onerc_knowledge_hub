import { useState } from "react";
import { Link } from "react-router-dom";
import { useFrappePostCall } from "frappe-react-sdk";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { call: requestReset } = useFrappePostCall(
    "onerc_knowledge_hub.api.register.request_password_reset"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await requestReset({ email });
      setEmailSent(true);
      toast.success("Password reset instructions sent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-dash-red font-bold text-white text-xl">
                  +
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg text-gray-900">Localisation Hub</div>
                  </div>
              </div>
            </div>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded border border-gray-200 shadow-sm p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Check Your Email
            </h1>

            <p className="text-gray-600 mb-6">
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-left">
              <p className="text-sm text-blue-900">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc space-y-1">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes and check again</li>
              </ul>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-dash-red font-medium hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>

          {/* IFRC Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            © 2026 The Localisation Hub
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-dash-red font-bold text-white text-xl">
                +
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg text-gray-900">Localisation Hub</div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-dash-navy focus:border-transparent outline-none transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-dash-red text-white rounded font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/login" className="text-dash-red font-medium hover:underline">
            Sign in
          </Link>
        </div>

        {/* IFRC Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          © 2026 The Localisation Hub
        </div>
      </div>
    </div>
  );
}
