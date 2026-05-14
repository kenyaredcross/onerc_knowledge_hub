import { useState, useEffect } from "react";
import { useFrappePostCall, useFrappeGetCall } from "frappe-react-sdk";
import { toast } from "react-toastify";
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
} from "lucide-react";

export default function UsersManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { call: getAllUsers } = useFrappePostCall("onerc_knowledge_hub.api.register.get_all_hub_users");
  const { call: approveUser } = useFrappePostCall("onerc_knowledge_hub.api.register.approve_localisation_hub_user");
  const { call: rejectUser } = useFrappePostCall("onerc_knowledge_hub.api.register.reject_localisation_hub_user");
  const { call: resendActivationEmail } = useFrappePostCall("onerc_knowledge_hub.api.user_management.resend_activation_email");
  const { call: sendPasswordResetEmail } = useFrappePostCall("onerc_knowledge_hub.api.user_management.send_password_reset_email");

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
    if (!confirm("Are you sure you want to approve this user? This will create a user account and send an activation email.")) {
      return;
    }

    try {
      await approveUser({ name: userName });
      toast.success("User approved successfully! Activation email sent.");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve user");
    }
  };

  const handleReject = async (userName: string) => {
    if (!confirm("Are you sure you want to reject this user application?")) {
      return;
    }

    try {
      await rejectUser({ name: userName });
      toast.success("User application rejected");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject user");
    }
  };

  const handleResendActivation = async (userName: string, email: string) => {
    if (!confirm(`Resend activation email to ${email}?`)) {
      return;
    }

    try {
      const result = await resendActivationEmail({ localisation_hub_user: userName });
      toast.success(result?.message || "Activation email sent successfully!");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to send activation email");
    }
  };

  const handlePasswordReset = async (userName: string, email: string) => {
    if (!confirm(`Send password reset email to ${email}?`)) {
      return;
    }

    try {
      const result = await sendPasswordResetEmail({ localisation_hub_user: userName });
      toast.success(result?.message || "Password reset email sent successfully!");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    }
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
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
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
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(user.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                        {user.status === "Approved" && !user.user_enabled && (
                          <button
                            onClick={() => handleResendActivation(user.name, user.prefered_contact_email)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                            title="Resend activation email"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Resend Activation
                          </button>
                        )}
                        {user.status === "Approved" && user.user_enabled && (
                          <button
                            onClick={() => handlePasswordReset(user.name, user.prefered_contact_email)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors"
                            title="Send password reset email"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Reset Password
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
    </div>
  );
}
