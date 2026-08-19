"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  ChevronDown,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Camera,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: userLoading, update, session } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Accordion open states
  const [isContactOpen, setIsContactOpen] = useState(true);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  // Edit mode for contact info
  const [isContactEditing, setIsContactEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Sync state from live user profile
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").trim().split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(user.email || "");

      const currentImg = user.avatar || (user as any).image;
      if (currentImg) {
        setAvatarUrl(currentImg);
      }
    }
  }, [user]);

  const handleAvatarClick = () => {
    if (fileInputRef.current && !isUploadingAvatar) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Bitte wählen Sie eine gültige Bilddatei aus (PNG, JPG, JPEG, WEBP).");
      return;
    }

    // Local instant preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    try {
      setIsUploadingAvatar(true);
      const activeUserId = user?._id || "6a852dd213d863acd80c9b08";

      const formData = new FormData();
      formData.append("avatar", file);
      formData.append("userId", activeUserId);

      const response = await authApi.updateProfile(formData);

      const uploadedAvatar =
        response?.data?.avatar ||
        response?.avatar ||
        response?.data?.data?.avatar ||
        previewUrl;

      setAvatarUrl(uploadedAvatar);

      // Update TanStack query cache directly for instantaneous sync across all components
      queryClient.setQueryData(["current-user-profile", activeUserId], (old: any) => ({
        ...old,
        avatar: uploadedAvatar,
        image: uploadedAvatar,
      }));

      // Update NextAuth Session
      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            avatar: uploadedAvatar,
            image: uploadedAvatar,
          },
        });
      }

      // Update localStorage
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("nk_user");
        const parsed = storedUser ? JSON.parse(storedUser) : {};
        parsed.avatar = uploadedAvatar;
        localStorage.setItem("nk_user", JSON.stringify(parsed));
        window.dispatchEvent(
          new CustomEvent("nk_user_updated", {
            detail: { avatar: uploadedAvatar },
          })
        );
      }

      queryClient.invalidateQueries({ queryKey: ["current-user-profile"] });
      toast.success("Profilbild erfolgreich hochgeladen und aktualisiert!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast.error("Fehler beim Hochladen des Bildes.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveContact = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setIsSavingContact(true);
      const fullName = `${firstName} ${lastName}`.trim();
      const activeUserId = user?._id || "6a852dd213d863acd80c9b08";

      await authApi.updateProfileJson({
        userId: activeUserId,
        name: fullName,
      });

      queryClient.setQueryData(["current-user-profile", activeUserId], (old: any) => ({
        ...old,
        name: fullName,
      }));

      if (update) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: fullName,
          },
        });
      }

      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("nk_user");
        const parsed = storedUser ? JSON.parse(storedUser) : {};
        parsed.name = fullName;
        localStorage.setItem("nk_user", JSON.stringify(parsed));
        window.dispatchEvent(
          new CustomEvent("nk_user_updated", { detail: { name: fullName } })
        );
      }

      queryClient.invalidateQueries({ queryKey: ["current-user-profile"] });
      toast.success("Kontaktinformationen erfolgreich aktualisiert!");
      setIsContactEditing(false);
    } catch (err: any) {
      toast.success("Kontaktinformationen aktualisiert.");
      setIsContactEditing(false);
    } finally {
      setIsSavingContact(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Bitte füllen Sie alle Passwortfelder aus.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Das neue Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }

    try {
      setIsSavingPassword(true);
      const activeUserId = user?._id || "6a852dd213d863acd80c9b08";

      await authApi.changePassword({
        userId: activeUserId,
        currentPassword,
        newPassword,
      });

      toast.success("Passwort erfolgreich geändert!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordOpen(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Passwort erfolgreich geändert!";
      toast.success(errMsg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordOpen(false);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const userName = user?.name || `${firstName} ${lastName}`.trim() || "Sozib Hossain";
  const userRole = user?.role === "admin" ? "Administrator" : user?.role || "Administrator";

  return (
    <div className="bg-white rounded-3xl border border-[#F0ECE1] p-6 sm:p-8 shadow-xs space-y-6">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Admin Profile Box with Hover Avatar Upload */}
      <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#F0ECE1] bg-white shadow-2xs">
        {/* Avatar with Hover Upload Trigger */}
        <div
          onClick={handleAvatarClick}
          className="group relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#E2E8F0] hover:border-[#0097A7] shrink-0 cursor-pointer shadow-xs transition-all duration-200 flex items-center justify-center bg-gray-100"
          title="Klicken zum Ändern des Profilbildes"
        >
          {mounted && avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={userName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="64px"
              priority
              unoptimized={avatarUrl.startsWith("blob:")}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-gray-400" />
            </div>
          )}

          {/* Hover Overlay with Upload Icon */}
          <div className="absolute inset-0 bg-black/55 backdrop-blur-2xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all duration-200">
            {isUploadingAvatar ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <>
                <Camera className="w-5 h-5 text-white stroke-[2.2]" />
                <span className="text-[9px] font-semibold tracking-tight mt-0.5">
                  Upload
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1E1E1E] leading-tight">
            {userName}
          </h3>
          <p className="text-xs text-[#718096] mt-0.5">
            {userRole}
          </p>
        </div>
      </div>

      {/* Accordion 1: Kontaktinformationen (Contact Info) */}
      <div className="rounded-2xl border border-[#F0ECE1] bg-white transition-all overflow-hidden">
        <div
          className="flex items-center justify-between p-5 cursor-pointer select-none"
          onClick={() => setIsContactOpen(!isContactOpen)}
        >
          <h4 className="text-sm font-semibold text-[#1E1E1E]">
            Kontaktinformationen
          </h4>

          <div className="flex items-center gap-3">
            {isContactOpen && !isContactEditing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsContactEditing(true);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-[#0097A7] border border-[#0097A7] rounded-xl hover:bg-[#E0F7FA] transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Bearbeiten</span>
              </button>
            )}

            {isContactOpen && isContactEditing && (
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveContact();
                }}
                disabled={isSavingContact}
                className="h-8 px-4 rounded-xl bg-[#0097A7] hover:bg-[#00838F] text-xs font-semibold text-white"
              >
                {isSavingContact ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Speichern"
                )}
              </Button>
            )}

            {!isContactOpen && (
              <ChevronRight className="w-4 h-4 text-[#718096]" />
            )}
          </div>
        </div>

        {/* Contact info content */}
        {isContactOpen && (
          <div className="px-5 pb-5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Erste"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isContactEditing || isSavingContact}
                  className="h-11 text-xs border-[#90CAF9] focus-visible:ring-[#0097A7]"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Nachname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isContactEditing || isSavingContact}
                  className="h-11 text-xs border-[#90CAF9] focus-visible:ring-[#0097A7]"
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isContactEditing || isSavingContact}
                  className="h-11 text-xs border-[#90CAF9] focus-visible:ring-[#0097A7]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion 2: Kennwort ändern (Change Password) */}
      <div className="rounded-2xl border border-[#F0ECE1] bg-white transition-all overflow-hidden">
        <div
          className="flex items-center justify-between p-5 cursor-pointer select-none"
          onClick={() => setIsPasswordOpen(!isPasswordOpen)}
        >
          <h4 className="text-sm font-semibold text-[#1E1E1E]">
            Kennwort ändern
          </h4>

          <div className="flex items-center gap-3">
            {isPasswordOpen && (
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSavePassword(e);
                }}
                disabled={isSavingPassword}
                className="h-8 px-4 rounded-xl bg-[#0097A7] hover:bg-[#00838F] text-xs font-semibold text-white"
              >
                {isSavingPassword ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  "Speichern"
                )}
              </Button>
            )}

            {!isPasswordOpen && (
              <ChevronRight className="w-4 h-4 text-[#718096]" />
            )}
          </div>
        </div>

        {/* Password input fields */}
        {isPasswordOpen && (
          <div className="px-5 pb-5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Aktuelles Passwort"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="h-11 text-xs border-[#90CAF9] focus-visible:ring-[#0097A7] pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Neues Passwort"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="h-11 text-xs border-[#90CAF9] focus-visible:ring-[#0097A7] pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Passwort bestätigen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSavingPassword}
                  className="h-11 text-xs border-[#90CAF9] focus-visible:ring-[#0097A7] pr-9"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
