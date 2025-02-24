// Common password patterns to check against
const COMMON_PASSWORDS = [
  'password123',
  '12345678',
  'qwerty123',
  'admin123',
  'letmein123',
  'welcome123',
];

// Sequential patterns to check against
const SEQUENTIAL_PATTERNS = [
  'abcdef',
  '123456',
  'qwerty',
];

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.some(commonPwd => password.toLowerCase().includes(commonPwd.toLowerCase()))) {
    errors.push('Password is too common or easily guessable');
  }

  // Check for sequential patterns
  if (SEQUENTIAL_PATTERNS.some(pattern => password.toLowerCase().includes(pattern.toLowerCase()))) {
    errors.push('Password contains sequential patterns');
  }

  // Check for repeated characters
  if (/(.)\1{3,}/.test(password)) {
    errors.push('Password contains too many repeated characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}