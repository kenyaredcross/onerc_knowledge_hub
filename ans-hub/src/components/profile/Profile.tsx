import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "../../contexts/UserContext";
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Languages,
  Users,
  Award,
  Shield,
  Camera,
  X,
} from "lucide-react";
import { useFrappeFileUpload, useFrappeGetCall, useFrappePostCall, useFrappeUpdateDoc } from "frappe-react-sdk";
import toast from "react-hot-toast";

export default function Profile() {
  const { userData, isLoading: userLoading } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    mobile_no: "",
    location: "",
    bio: "",
  });

  const [orgData, setOrgData] = useState({
    national_society: "",
    position: "",
  });

  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { upload: uploadFile } = useFrappeFileUpload();

  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();
  const { call: updateOrgCall, loading: orgLoading } = useFrappePostCall(
    "onerc_knowledge_hub.api.user.update_lh_user_organisation"
  );
  const { call: updateBannerCall } = useFrappePostCall(
    "onerc_knowledge_hub.api.user.update_banner_image"
  );

  const { data: societiesData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.register.get_national_societies"
  );
  const { data: designationsData } = useFrappeGetCall(
    "onerc_knowledge_hub.api.register.get_designations"
  );
  const nationalSocieties: any[] = societiesData?.message || [];
  const designations: any[] = designationsData?.message || [];

  // Initialize form data when userData is available
  useEffect(() => {
    if (userData) {
      setFormData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        mobile_no: userData.mobile_no || "",
        location: userData.location || "",
        bio: userData.bio || "",
      });
      const lhu = (userData as any).lh_user;
      if (lhu) {
        setOrgData({
          national_society: lhu.national_society || "",
          position: lhu.position || "",
        });
        setBannerUrl(lhu.banner_image || "");
      }
    }
  }, [userData]);

  const handleSave = async () => {
    try {
      await updateDoc("User", userData.name, formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleSaveOrg = async () => {
    try {
      await updateOrgCall(orgData);
      toast.success("Organisation details updated!");
      setIsEditingOrg(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update organisation details");
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const res = await uploadFile(file, { isPrivate: false, folder: "Home" });
      if (res?.file_url) {
        await updateBannerCall({ banner_image: res.file_url });
        setBannerUrl(res.file_url);
        toast.success("Banner updated!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload banner");
    } finally {
      setBannerUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const handleBannerRemove = async () => {
    try {
      await updateBannerCall({ banner_image: "" });
      setBannerUrl("");
      toast.success("Banner removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove banner");
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="h-12 w-12 animate-spin border-4 border-blue-600/30 border-t-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <AlertCircle className="h-12 w-12 text-red-600 mb-3" />
        <p className="text-gray-900 font-display font-medium">Failed to load user data</p>
      </div>
    );
  }

  const lhUser = (userData as any).lh_user;
  const initials = `${(userData as any).first_name?.[0] || ""}${(userData as any).last_name?.[0] || ""}`.toUpperCase();
  const fullName = `${(userData as any).first_name || ""} ${(userData as any).last_name || ""}`.trim();

  return (
    <div className="min-h-full bg-white p-6 space-y-6 font-display">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-blue-600 text-white shadow-lg">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600">Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-gray-300 shadow-sm overflow-hidden">
        {/* Profile Header / Banner */}
        <div
          className="px-8 py-16 relative overflow-hidden"
          style={{
            backgroundImage: `url(${bannerUrl || '/assets/onerc_knowledge_hub/profile-cover.jpeg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/45 to-black/55" />

          {/* Banner controls — always visible */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={bannerUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-colors disabled:opacity-50"
            >
              {bannerUploading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Camera className="h-3.5 w-3.5" />}
              {bannerUploading ? "Uploading…" : bannerUrl ? "Replace banner" : "Upload banner"}
            </button>
            {bannerUrl && (
              <button
                type="button"
                onClick={handleBannerRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-red-600/80 text-white text-xs font-semibold rounded-lg backdrop-blur-sm transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleBannerUpload}
          />

          <div className="relative z-10 flex items-center gap-6">
            <div className="flex h-28 w-28 items-center justify-center bg-white text-blue-600 font-display text-4xl font-bold shadow-xl">
              {initials}
            </div>
            <div className="text-white">
              <h2 className="font-display text-4xl font-bold mb-2">{fullName}</h2>
              <div className="flex items-center gap-2 text-gray-100">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-display">{(userData as any).email}</span>
              </div>
              {lhUser && (
                <div className="flex items-center gap-3 mt-3">
                  {lhUser.status === "Approved" && (
                    <div className="flex items-center gap-2 bg-green-600/90 px-3 py-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-display font-semibold">Approved</span>
                    </div>
                  )}
                  {lhUser.is_steering_group && (
                    <div className="flex items-center gap-2 bg-red-600/90 px-3 py-1">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-display font-semibold">Steering Group</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8 space-y-8">

          {/* Organisation Section — always visible */}
          <div className="space-y-6">
            <div className="border-b border-gray-300 pb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Organisation
              </h3>
              {lhUser && (!isEditingOrg ? (
                <button
                  onClick={() => setIsEditingOrg(true)}
                  className="px-4 py-1.5 bg-blue-600 text-white text-xs font-display font-semibold hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditingOrg(false); setOrgData({ national_society: lhUser.national_society || "", position: lhUser.position || "" }); }}
                    disabled={orgLoading}
                    className="px-4 py-1.5 bg-gray-300 text-gray-900 text-xs font-display font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOrg}
                    disabled={orgLoading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-display font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {orgLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                    Save
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* National Society */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  National Society
                </label>
                {isEditingOrg ? (
                  <select
                    value={orgData.national_society}
                    onChange={(e) => setOrgData({ ...orgData, national_society: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display bg-white text-sm"
                  >
                    <option value="">Select National Society…</option>
                    {nationalSocieties.map((s: any) => (
                      <option key={s.name} value={s.name}>{s.national_society_name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="font-display font-medium text-gray-900">
                      {lhUser?.national_society_name || lhUser?.national_society || orgData.national_society || "Not set"}
                    </span>
                  </div>
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Position / Role
                </label>
                {isEditingOrg ? (
                  <select
                    value={orgData.position}
                    onChange={(e) => setOrgData({ ...orgData, position: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display bg-white text-sm"
                  >
                    <option value="">Select Position…</option>
                    {designations.map((d: any) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                    <Briefcase className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="font-display font-medium text-gray-900">{lhUser?.position || orgData.position || "Not set"}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Localisation Hub User Details */}
          {lhUser && (
            <div className="space-y-6">
              <div className="border-b border-gray-300 pb-4">
                <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Localisation Hub Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* National Society */}
                {lhUser.national_society && (
                  <div className="bg-gray-50 p-4 border-l-4 border-blue-600">
                    <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      National Society
                    </label>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="font-display font-medium text-gray-900">{lhUser.national_society_name || lhUser.national_society}</span>
                    </div>
                  </div>
                )}

                {/* Position */}
                {lhUser.position && (
                  <div className="bg-gray-50 p-4 border-l-4 border-blue-600">
                    <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Position
                    </label>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span className="font-display font-medium text-gray-900">{lhUser.position}</span>
                    </div>
                  </div>
                )}

                {/* Personnel Type */}
                {lhUser.personnel_type && (
                  <div className="bg-gray-50 p-4 border-l-4 border-blue-600">
                    <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Personnel Type
                    </label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-display font-medium text-gray-900">{lhUser.personnel_type}</span>
                    </div>
                  </div>
                )}

                {/* Primary Language */}
                {lhUser.primary_language && (
                  <div className="bg-gray-50 p-4 border-l-4 border-blue-600">
                    <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Primary Language
                    </label>
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-blue-600" />
                      <span className="font-display font-medium text-gray-900">{lhUser.primary_language}</span>
                    </div>
                  </div>
                )}

                {/* Contact Email */}
                {lhUser.prefered_contact_email && (
                  <div className="bg-gray-50 p-4 border-l-4 border-blue-600">
                    <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Contact Email
                    </label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="font-display font-medium text-gray-900 text-sm break-all">{lhUser.prefered_contact_email}</span>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {lhUser.phone_number && (
                  <div className="bg-gray-50 p-4 border-l-4 border-blue-600">
                    <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="font-display font-medium text-gray-900">{lhUser.phone_number}</span>
                    </div>
                  </div>
                )}

                {/* Expertise */}
                {lhUser.expertise && (
                  <div className="bg-gray-50 p-4 border-l-4 border-blue-600">
                    <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Expertise
                    </label>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span className="font-display font-medium text-gray-900">{lhUser.expertise}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {lhUser.bio && (
                <div className="bg-gray-50 p-6 border-l-4 border-red-600">
                  <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Biography
                  </label>
                  <p className="font-display text-gray-900 leading-relaxed">{lhUser.bio}</p>
                </div>
              )}

              {/* Other Languages */}
              {lhUser.other_languages && (
                <div className="bg-gray-50 p-6 border-l-4 border-blue-600">
                  <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Other Languages
                  </label>
                  <p className="font-display text-gray-900">{lhUser.other_languages}</p>
                </div>
              )}
            </div>
          )}

          {/* System User Details */}
          <div className="space-y-6">
            <div className="border-b border-gray-300 pb-4">
              <h3 className="font-display text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                System Account
              </h3>
            </div>

            {/* Edit Toggle Button */}
            <div className="flex justify-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-display font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-300 text-gray-900 text-sm font-display font-semibold hover:bg-gray-400 transition-colors"
                    disabled={updateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateLoading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-sm font-display font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-display text-gray-900">{(userData as any).first_name || "Not set"}</span>
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-display text-gray-900">{(userData as any).last_name || "Not set"}</span>
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="font-display text-gray-900">{(userData as any).email}</span>
                </div>
                <p className="text-xs text-gray-600 font-display mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display"
                    placeholder="+1234567890"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="font-display text-gray-900">{(userData as any).phone || "Not set"}</span>
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.mobile_no}
                    onChange={(e) => setFormData({ ...formData, mobile_no: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display"
                    placeholder="+1234567890"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="font-display text-gray-900">{(userData as any).mobile_no || "Not set"}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display"
                    placeholder="City, Country"
                  />
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                    <Globe className="h-4 w-4 text-gray-600" />
                    <span className="font-display text-gray-900">{(userData as any).location || "Not set"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-display font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-blue-600 font-display"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border border-gray-300 min-h-[100px]">
                  <p className="font-display text-gray-900 leading-relaxed">
                    {(userData as any).bio || "No bio added yet"}
                  </p>
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="border-t border-gray-300 pt-6">
              <h3 className="font-display text-lg font-bold text-gray-900 mb-4">
                Account Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                  <div className="text-xs font-display font-semibold text-gray-600 uppercase tracking-wider">User Type</div>
                  <div className="ml-auto font-display font-medium text-gray-900">{(userData as any).user_type || "System User"}</div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                  <div className="text-xs font-display font-semibold text-gray-600 uppercase tracking-wider">Joined</div>
                  <div className="ml-auto font-display font-medium text-gray-900">
                    {(userData as any).creation ? new Date((userData as any).creation).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    }) : "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-300">
                  <div className="text-xs font-display font-semibold text-gray-600 uppercase tracking-wider">Status</div>
                  <div className="ml-auto">
                    {(userData as any).enabled ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-display font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-display font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
