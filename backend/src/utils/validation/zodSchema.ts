import * as zod from 'zod'

const minUsernameLength = 3
const maxUsernameLength = 15

const minDisplayNameLength = 1
const maxDisplayNameLength = 20

const minPasswordLength = 8
const maxPasswordLength = 64

let password = ''

export const registerSchema = zod.object({ 
  username: zod.string().trim().min(minUsernameLength).max(maxUsernameLength),
  displayName: zod.string().trim().min(minDisplayNameLength).max(maxDisplayNameLength),
  password: zod.string().min(minPasswordLength).max(maxPasswordLength).refine((value) => (password = value)),
  passwordConfirmation: zod.string().min(minPasswordLength).max(maxPasswordLength).refine((value) => (value === password), "Passwords do not match")
});


export const loginSchema = zod.object({
  username: zod.string().trim(),
  password: zod.string().trim()
})

export const changeDisplayNameSchema = zod.object({
  newDisplayName: zod.string().trim().min(minDisplayNameLength).max(maxDisplayNameLength),
})

export const changePasswordSchema = zod.object({
  newPassword: zod.string().min(minPasswordLength).max(maxPasswordLength).refine((value) => (password = value)),
  newPasswordConfirmation: zod.string().min(minPasswordLength).max(maxPasswordLength).refine((value) => (value === password), 'passwords do not match')
})

export const guessSchema = zod.object({
  session: zod.string().nonempty(),
  card: zod.string().nonempty()
})