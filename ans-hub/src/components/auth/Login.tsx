import { useFrappeAuth, useFrappePostCall } from "frappe-react-sdk";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Auth from "./Auth";

export default function LoginForm() {
  const { login, currentUser } = useFrappeAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);
  const { call: registerUser } = useFrappePostCall("onerc_knowledge_hub.api.register.register_localisation_hub_user");
  const { call: checkStatus } = useFrappePostCall("onerc_knowledge_hub.api.register.check_registration_status");

  const handleSignIn = async (credentials: { email: string; password: string }) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await login({
        username: credentials.email,
        password: credentials.password,
      });
      toast.success("Welcome back! Logged in successfully");
      // Use window.location.href to force full page reload after login
      window.location.href = "/ans-hub";
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (userData: {
    first_name: string;
    last_name: string;
    preferred_contact_email: string;
    phone_number: string;
    position: string;
    national_society: string;
    primary_language: string;
    gender: string;
  }) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // First, check if this email is already registered
      const statusCheck = await checkStatus({ email: userData.preferred_contact_email });

      if (statusCheck?.found) {
        // Email already exists - redirect to pending approval page with their status
        const status = statusCheck.status;

        if (status === "Pending") {
          toast.info("Your registration is already pending approval. Redirecting to status page...");
          navigate(`/pending-approval?email=${encodeURIComponent(userData.preferred_contact_email)}`);
        } else if (status === "Approved" && !statusCheck.user_enabled) {
          toast.info("Your application has been approved! Redirecting to set password...");
          navigate(`/set-password?key=${statusCheck.name}`);
        } else if (status === "Approved" && statusCheck.user_enabled) {
          toast.info("Your account is already active. Please sign in.");
          // Don't navigate, just show the error - user can click sign in
        } else if (status === "Rejected") {
          toast.error("Your previous application was rejected. Please contact support for assistance.");
        }

        setIsLoading(false);
        return;
      }

      // Email doesn't exist - proceed with registration
      const registrationData: any = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        preferred_contact_email: userData.preferred_contact_email,
        phone_number: userData.phone_number,
        national_society: userData.national_society,
        primary_language: userData.primary_language,
        position: userData.position, // Now a valid Designation from dropdown
      };

      const response = await registerUser(registrationData);

      toast.success("Registration submitted successfully! Your account is pending approval.");
      navigate(`/pending-approval?email=${encodeURIComponent(userData.preferred_contact_email)}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return <Auth onSignIn={handleSignIn} onSignUp={handleSignUp} />;
}
