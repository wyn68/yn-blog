export interface PasswordValidationResult {
  valid: boolean;
  message: string;
}

export interface PasswordStrengthResult {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  suggestions: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.length === 0) {
    return { valid: false, message: "请输入密码" };
  }

  if (password.length < 8) {
    return { valid: false, message: "密码长度至少为8个字符" };
  }

  if (password.length > 128) {
    return { valid: false, message: "密码长度不能超过128个字符" };
  }

  return { valid: true, message: "" };
}

export function validatePasswordMatch(newPassword: string, confirmPassword: string): PasswordValidationResult {
  if (newPassword !== confirmPassword) {
    return { valid: false, message: "两次输入的密码不一致" };
  }
  return { valid: true, message: "" };
}

export function validatePasswordNotSame(currentPassword: string, newPassword: string): PasswordValidationResult {
  if (currentPassword === newPassword) {
    return { valid: false, message: "新密码不能与当前密码相同" };
  }
  return { valid: true, message: "" };
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score += 1;
  else suggestions.push("密码长度至少8个字符");

  if (password.length >= 12) score += 1;
  else suggestions.push("密码越长越安全");

  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push("包含小写字母");

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push("包含大写字母");

  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push("包含数字");

  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  else suggestions.push("包含特殊字符（如@#$%）");

  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 6) strength = 'strong';
  else if (score >= 4) strength = 'medium';

  return { strength, score, suggestions };
}
