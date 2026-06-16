"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { profileUpdateSchema, changePasswordSchema, onboardingSchema } from "@/lib/validations";
import type { ProfileUpdateInput, ChangePasswordInput, OnboardingInput } from "@/lib/validations";

/**
 * Server Action: toggleFollow
 * Toggles the follow relationship between the current user and a target user.
 *
 * @param targetUserId - MongoDB ObjectId of the user to follow/unfollow
 * @returns { following: boolean, followerCount: number } or { error: string }
 */
export async function toggleFollow(
  targetUserId: string
): Promise<{ following: boolean; followerCount: number } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in to follow users" };

  const followerId = session.user.id;

  if (followerId === targetUserId) {
    return { error: "You cannot follow yourself" };
  }

  const existingFollow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetUserId } },
  });

  let isNowFollowing: boolean;
  if (existingFollow) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId: targetUserId } },
    });
    isNowFollowing = false;
  } else {
    await prisma.follow.create({ data: { followerId, followingId: targetUserId } });
    isNowFollowing = true;
  }

  const followerCount = await prisma.follow.count({ where: { followingId: targetUserId } });

  // Revalidate the target user's profile page
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true },
  });
  if (targetUser) {
    revalidatePath(`/profile/${targetUser.username}`);
  }

  return { following: isNowFollowing, followerCount };
}

/**
 * Server Action: updateProfile
 * Updates the authenticated user's display name, username, bio, and image.
 *
 * @param data - Validated profile fields
 * @returns { error: string } on failure, { success: true } on success
 */
export async function updateProfile(
  data: ProfileUpdateInput
): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validation = profileUpdateSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Invalid data" };
  }

  const { name, username, bio, image } = validation.data;

  // Check if username is taken by someone else
  if (username !== session.user.username) {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return { error: "Username is already taken" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, username, bio: bio || null, image: image || null },
  });

  revalidatePath(`/profile/${username}`);
  revalidatePath("/settings");
  return { success: true };
}

/**
 * Server Action: changePassword
 * Changes the user's password after verifying the old password.
 *
 * @param data - { oldPassword, newPassword, confirmPassword }
 * @returns { error: string } on failure, { success: true } on success
 */
export async function changePassword(
  data: ChangePasswordInput
): Promise<{ error: string } | { success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validation = changePasswordSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Invalid data" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) {
    return { error: "This account uses Google sign-in and has no password to change" };
  }

  const isOldPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
  if (!isOldPasswordValid) {
    return { error: "Current password is incorrect" };
  }

  const hashedNewPassword = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedNewPassword },
  });

  return { success: true };
}

/**
 * Server Action: deleteAccount
 * Permanently deletes the authenticated user's account and all their data.
 * Redirects to the home page after deletion.
 */
export async function deleteAccount(): Promise<{ error: string } | never> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.user.delete({ where: { id: session.user.id } });

  revalidatePath("/");
  redirect("/");
}

/**
 * Server Action: completeOnboarding
 * Saves onboarding data (bio, image, interests) for a new user.
 * Marks the user profile as complete.
 *
 * @param data - { bio?, image?, interests[] }
 * @returns { error: string } on failure, redirects to "/" on success
 */
export async function completeOnboarding(
  data: OnboardingInput
): Promise<{ error: string } | never> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validation = onboardingSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message ?? "Invalid data" };
  }

  const { bio, image, interests } = validation.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: bio || null,
      image: image || null,
      interests,
    },
  });

  revalidatePath("/");
  redirect("/");
}

/**
 * Server Action: registerUser
 * Creates a new user account with a hashed password.
 * Redirects to /welcome on success.
 *
 * @param name - Display name
 * @param email - Email address (must be unique)
 * @param password - Plain-text password to hash
 * @param username - Unique username (lowercase alphanumeric)
 * @returns { error: string } on failure, redirects on success
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  username: string
): Promise<{ error: string } | { success: boolean }> {
  // Check for existing email
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return { error: "An account with this email already exists" };

  // Check for existing username
  const existingUsername = await prisma.user.findUnique({ where: { username } });
  if (existingUsername) return { error: "This username is already taken" };

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashedPassword, username },
  });

  return { success: true };
}
