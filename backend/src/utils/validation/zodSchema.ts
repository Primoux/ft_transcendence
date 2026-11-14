import * as zod from 'zod'

const minUsernameLength = 3
const maxUsernameLength = 15

const minPasswordLength = 8
const maxPasswordLength = 64

// Usernames are stored and compared lowercased, so "Kiba" and "kiba" are the same account.
// The character set keeps them safe in URLs (/users/:username) and free of lookalike Unicode.
export const usernameSchema = zod.string().trim().toLowerCase()
  .min(minUsernameLength).max(maxUsernameLength)
  .regex(/^[a-z0-9_]+$/, "Only letters, digits and underscores")

const passwordSchema = zod.string().min(minPasswordLength).max(maxPasswordLength)

export const registerSchema = zod.object({
  username: usernameSchema,
  password: passwordSchema,
  passwordConfirmation: zod.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords do not match",
  path: ["passwordConfirmation"],
});

export const loginSchema = zod.object({
  username: zod.string().trim().toLowerCase(),
  password: zod.string(),
})

export const changeUsernameSchema = zod.object({
  newUsername: usernameSchema,
})

export const changePasswordSchema = zod.object({
  currentPassword: zod.string().optional(),  // absent for OAuth-only accounts setting their first password
  newPassword: passwordSchema,
  newPasswordConfirmation: zod.string(),
}).refine((data) => data.newPassword === data.newPasswordConfirmation, {
  message: "Passwords do not match",
  path: ["newPasswordConfirmation"],
})

export const guessSchema = zod.object({
  session: zod.string().nonempty(),
  card: zod.string().nonempty()
})
