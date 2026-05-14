import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useFrappePostCall } from "frappe-react-sdk";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const { call: validateToken } = useFrappePostCall(
    "onerc_knowledge_hub.api.register.validate_reset_token"
  );
  const { call: resetPassword } = useFrappePostCall(
    "onerc_knowledge_hub.api.register.reset_password_with_token"
  );

  // Password validation
  const passwordRequirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "Contains number", test: (p: string) => /[0-9]/.test(p) },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.test(password));
  const doPasswordsMatch = password === confirmPassword && password.length > 0;

  // Validate token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      try {
        const result = await validateToken({ token });
        if (result?.valid) {
          setTokenValid(true);
          setUserEmail(result.email || "");
        } else {
          setTokenValid(false);
          toast.error(result?.message || "Invalid or expired reset link");
        }
      } catch (error: any) {
        setTokenValid(false);
        toast.error("Invalid or expired reset link");
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (!doPasswordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        token,
        new_password: password,
      });

      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/ans-hub/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show error state if token is invalid
  if (tokenValid === false) {
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

          {/* Error Card */}
          <div className="bg-white rounded border border-gray-200 shadow-sm p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Invalid Reset Link
            </h1>

            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Reset links are only valid for 1 hour.
            </p>

            <div className="space-y-3">
              <Link
                to="/ans-hub/forgot-password"
                className="block w-full py-3 px-4 bg-dash-red text-white rounded font-medium hover:bg-red-600 transition-all"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/ans-hub/login"
                className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-all"
              >
                Back to Sign In
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            © 2026 The Localisation Hub
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-dash-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating reset link...</p>
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
            Set New Password
          </h1>
          <p className="text-gray-600">
            Create a strong password for your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-dash-navy focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="space-y-2">
              {passwordRequirements.map((req, idx) => {
                const isPassing = req.test(password);
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    {isPassing ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={isPassing ? "text-green-700" : "text-gray-600"}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-dash-navy focus:border-transparent outline-none transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Passwords do not match</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isPasswordValid || !doPasswordsMatch || isLoading}
              className="w-full py-3 px-4 bg-dash-red text-white rounded font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link to="/ans-hub/login" className="text-dash-red font-medium hover:underline">
            Sign in
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          © 2026 The Localisation Hub
        </div>
      </div>
    </div>
  );
}
