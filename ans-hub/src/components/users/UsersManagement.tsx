import { useState, useEffect } from "react";
import { useFrappePostCall, useFrappeGetCall, useFrappeCreateDoc } from "frappe-react-sdk";
import toast from "react-hot-toast";
import {
  Users,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Globe,
  Search,
  Filter,
  UserCheck,
  UserX,
  RefreshCw,
  Send,
  KeyRound,
  UserPlus,
} from "lucide-react";
import { LinkField } from "../fields/LinkField";

export default function UsersManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    salutation: "",
    gender: "",
    company_email: "",
    prefered_contact_email: "",
    phone_number: "",
    national_society: "",
    position: "",
    personnel_type: "",
    primary_language: "",
    bio: "",
    is_steering_group: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { call: getAllUsers } = useFrappePostCall("onerc_knowledge_hub.api.register.get_all_hub_users");
  const { call: approveUser } = useFrappePostCall("onerc_knowledge_hub.api.register.approve_localisation_hub_user");
  const { call: rejectUser } = useFrappePostCall("onerc_knowledge_hub.api.register.reject_localisation_hub_user");
  const { call: resendActivationEmail } = useFrappePostCall("onerc_knowledge_hub.api.user_management.resend_activation_email");
  const { call: sendPasswordResetEmail } = useFrappePostCall("onerc_knowledge_hub.api.user_management.send_password_reset_email");
  const { createDoc } = useFrappeCreateDoc();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const result = await getAllUsers(params);
      // Handle Frappe's response format - data might be in result.message or result directly
      const usersData = Array.isArray(result) ? result : (result?.message || []);
      setUsers(usersData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load users");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const handleApprove = async (userName: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">Approve User?</p>
          <p className="text-sm text-gray-600 mt-1">
            This will create a user account and send an activation email.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setActionLoading(userName);
              try {
                const result = await approveUser({ name: userName });
                // Handle nested message structure: { message: { message: "..." } }
                const successMessage = typeof result === 'string'
                  ? result
                  : result?.message?.message || result?.message || "User approved successfully! Activation email sent.";
                toast.success(successMessage);
                fetchUsers();
              } catch (error: any) {
                const errorMessage = typeof error === 'string'
                  ? error
                  : error?.message?.message || error?.message || error?.exc || "Failed to approve user";
                toast.error(errorMessage);
              } finally {
                setActionLoading(null);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleReject = async (userName: string) => {
    let rejectionReason = "";

    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[320px]">
        <div>
          <p className="font-semibold text-gray-900">Reject User Application?</p>
          <p className="text-sm text-gray-600 mt-1">
            Please provide a reason for rejection.
          </p>
        </div>
        <textarea
          placeholder="Enter rejection reason..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
          rows={3}
          onChange={(e) => {
            rejectionReason = e.target.value;
          }}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!rejectionReason.trim()) {
                toast.error("Please provide a rejection reason");
                return;
              }
              toast.dismiss(t.id);
              setActionLoading(userName);
              try {
                const result = await rejectUser({ name: userName, reason: rejectionReason });
                // Handle nested message structure: { message: { message: "..." } }
                const successMessage = typeof result === 'string'
                  ? result
                  : result?.message?.message || result?.message || "User application rejected";
                toast.success(successMessage);
                fetchUsers();
              } catch (error: any) {
                const errorMessage = typeof error === 'string'
                  ? error
                  : error?.message?.message || error?.message || error?.exc || "Failed to reject user";
                toast.error(errorMessage);
              } finally {
                setActionLoading(null);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleResendActivation = async (userName: string, email: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">Resend Activation Email?</p>
          <p className="text-sm text-gray-600 mt-1">
            Send activation email to <span className="font-medium">{email}</span>
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setActionLoading(userName);
              try {
                const result = await resendActivationEmail({ localisation_hub_user: userName });
                // Handle frappe-react-sdk response wrapping
                const message = typeof result?.message === 'object' ? result?.message?.message : result?.message;
                toast.success(message || "Activation email sent successfully!");
                fetchUsers();
              } catch (error: any) {
                toast.error(error.message || "Failed to send activation email");
              } finally {
                setActionLoading(null);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handlePasswordReset = async (userName: string, email: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">Send Password Reset?</p>
          <p className="text-sm text-gray-600 mt-1">
            Send password reset email to <span className="font-medium">{email}</span>
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setActionLoading(userName);
              try {
                const result = await sendPasswordResetEmail({ localisation_hub_user: userName });
                // Handle frappe-react-sdk response wrapping
                const message = typeof result?.message === 'object' ? result?.message?.message : result?.message;
                toast.success(message || "Password reset email sent successfully!");
                fetchUsers();
              } catch (error: any) {
                toast.error(error.message || "Failed to send password reset email");
              } finally {
                setActionLoading(null);
              }
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-dash-navy rounded-lg hover:bg-blue-900 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const doc: any = {
        doctype: "Localisation Hub User",
        first_name: formData.first_name,
        company_email: formData.company_email,
        national_society: formData.national_society,
        status: "Approved", // Auto-approve admin-created users
      };

      // Add optional fields
      if (formData.middle_name) doc.middle_name = formData.middle_name;
      if (formData.last_name) doc.last_name = formData.last_name;
      if (formData.salutation) doc.salutation = formData.salutation;
      if (formData.gender) doc.gender = formData.gender;
      if (formData.prefered_contact_email) doc.prefered_contact_email = formData.prefered_contact_email;
      if (formData.phone_number) doc.phone_number = formData.phone_number;
      if (formData.position) doc.position = formData.position;
      if (formData.personnel_type) doc.personnel_type = formData.personnel_type;
      if (formData.primary_language) doc.primary_language = formData.primary_language;
      if (formData.bio) doc.bio = formData.bio;
      if (formData.is_steering_group) doc.is_steering_group = formData.is_steering_group;

      await createDoc("Localisation Hub User", doc);

      toast.success("User created successfully!");

      // Reset form and close
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        salutation: "",
        gender: "",
        company_email: "",
        prefered_contact_email: "",
        phone_number: "",
        national_society: "",
        position: "",
        personnel_type: "",
        primary_language: "",
        bio: "",
        is_steering_group: 0,
      });
      setShowCreateForm(false);

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredUsers = Array.isArray(users) ? users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.prefered_contact_email?.toLowerCase().includes(searchLower) ||
      user.national_society?.toLowerCase().includes(searchLower)
    );
  }) : [];

  const stats = [
    {
      label: "Pending",
      count: Array.isArray(users) ? users.filter((u) => u.status === "Pending").length : 0,
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    {
      label: "Approved",
      count: Array.isArray(users) ? users.filter((u) => u.status === "Approved").length : 0,
      color: "bg-green-100 text-green-700",
      icon: Check,
    },
    {
      label: "Rejected",
      count: Array.isArray(users) ? users.filter((u) => u.status === "Rejected").length : 0,
      color: "bg-red-100 text-red-700",
      icon: X,
    },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-sm text-gray-500">Review and approve user registrations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-dash-red text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm font-medium"
          >
            <UserPlus className="h-4 w-4" />
            Create New User
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="font-display text-3xl font-bold text-gray-900">{stat.count}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Users className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.full_name}</div>
                          <div className="text-xs text-gray-500">{user.position || "No position"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {user.prefered_contact_email}
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {user.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        {user.national_society || "Not specified"}
                      </div>
                      {user.primary_language && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          {user.primary_language}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : user.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status === "Pending" && <Clock className="h-3 w-3" />}
                        {user.status === "Approved" && <Check className="h-3 w-3" />}
                        {user.status === "Rejected" && <X className="h-3 w-3" />}
                        {user.status}
                      </span>
                      {user.status === "Approved" && (
                        <div className="text-xs text-gray-500 mt-1">
                          {user.user_enabled ? "✓ Activated" : "⏳ Pending activation"}
                        </div>
                      )}
                      {user.status === "Rejected" && user.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                          <p className="font-medium text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-red-700">{user.rejection_reason}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.creation).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(user.name)}
                              disabled={actionLoading === user.name}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === user.name ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3.5 w-3.5" />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(user.name)}
                              disabled={actionLoading === user.name}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading === user.name ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3.5 w-3.5" />
                                  Reject
                                </>
                              )}
                            </button>
                          </>
                        )}
                        {user.status === "Approved" && !user.user_enabled && (
                          <button
                            onClick={() => handleResendActivation(user.name, user.prefered_contact_email)}
                            disabled={actionLoading === user.name}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Resend activation email"
                          >
                            {actionLoading === user.name ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                Resend Activation
                              </>
                            )}
                          </button>
                        )}
                        {user.status === "Approved" && user.user_enabled && (
                          <button
                            onClick={() => handlePasswordReset(user.name, user.prefered_contact_email)}
                            disabled={actionLoading === user.name}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-navy text-white text-sm font-medium rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send password reset email"
                          >
                            {actionLoading === user.name ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <KeyRound className="h-3.5 w-3.5" />
                                Reset Password
                              </>
                            )}
                          </button>
                        )}
                        {user.status === "Rejected" && (
                          <span className="text-xs text-gray-500">Application rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dash-red text-white">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
                  <p className="text-sm text-gray-500">Add a new Localisation Hub user</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LinkField
                    doctype="Salutation"
                    label="Salutation"
                    value={formData.salutation}
                    onChange={(val) => updateFormField("salutation", val)}
                    buttonClassName="h-12 rounded-xl border-gray-200 bg-gray-50"
                  />
                  <LinkField
                    doctype="Gender"
                    label="Gender"
                    value={formData.gender}
                    onChange={(val) => updateFormField("gender", val)}
                    buttonClassName="h-12 rounded-xl border-gray-200 bg-gray-50"
                  />
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => updateFormField("first_name", e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) => updateFormField("middle_name", e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => updateFormField("last_name", e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      Company Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.company_email}
                      onChange={(e) => updateFormField("company_email", e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">Preferred Contact Email</label>
                    <input
                      type="email"
                      value={formData.prefered_contact_email}
                      onChange={(e) => updateFormField("prefered_contact_email", e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => updateFormField("phone_number", e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    />
                  </div>
                </div>
              </div>

              {/* Organization Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Organization Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LinkField
                    doctype="National Society"
                    label="National Society"
                    value={formData.national_society}
                    onChange={(val) => updateFormField("national_society", val)}
                    required
                    buttonClassName="h-12 rounded-xl border-gray-200 bg-gray-50"
                  />
                  <LinkField
                    doctype="Designation"
                    label="Position"
                    value={formData.position}
                    onChange={(val) => updateFormField("position", val)}
                    buttonClassName="h-12 rounded-xl border-gray-200 bg-gray-50"
                  />
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">Personnel Type</label>
                    <select
                      value={formData.personnel_type}
                      onChange={(e) => updateFormField("personnel_type", e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10"
                    >
                      <option value="">Select Personnel Type</option>
                      <option value="Governance Leader">Governance Leader</option>
                      <option value="NS Staff">NS Staff</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Consortium Partner">Consortium Partner</option>
                    </select>
                  </div>
                  <LinkField
                    doctype="Language"
                    label="Primary Language"
                    value={formData.primary_language}
                    onChange={(val) => updateFormField("primary_language", val)}
                    buttonClassName="h-12 rounded-xl border-gray-200 bg-gray-50"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Additional Information</h3>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => updateFormField("bio", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-dash-red focus:bg-white focus:outline-none focus:ring-4 focus:ring-dash-red/10 resize-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_steering_group === 1}
                      onChange={(e) => updateFormField("is_steering_group", e.target.checked ? 1 : 0)}
                      className="h-5 w-5 rounded border-gray-300 text-dash-red focus:ring-dash-red focus:ring-offset-0"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-800">Steering Group Member</span>
                      <p className="text-xs text-gray-500">Mark this user as a member of the steering group</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl border border-gray-200 bg-white px-6 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-xl bg-dash-red px-6 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
