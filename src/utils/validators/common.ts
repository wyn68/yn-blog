export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function validateRequired(value: string | undefined | null, fieldName: string = "此字段"): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `${fieldName}不能为空` };
  }
  return { valid: true, message: "" };
}

export function validateMinLength(value: string, minLength: number, fieldName: string = "此字段"): ValidationResult {
  if (value.length < minLength) {
    return { valid: false, message: `${fieldName}长度至少为${minLength}个字符` };
  }
  return { valid: true, message: "" };
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string = "此字段"): ValidationResult {
  if (value.length > maxLength) {
    return { valid: false, message: `${fieldName}长度不能超过${maxLength}个字符` };
  }
  return { valid: true, message: "" };
}

export function validateLengthRange(value: string, minLength: number, maxLength: number, fieldName: string = "此字段"): ValidationResult {
  if (value.length < minLength) {
    return { valid: false, message: `${fieldName}长度至少为${minLength}个字符` };
  }
  if (value.length > maxLength) {
    return { valid: false, message: `${fieldName}长度不能超过${maxLength}个字符` };
  }
  return { valid: true, message: "" };
}

export function validateNumeric(value: string): ValidationResult {
  if (!/^\d+$/.test(value)) {
    return { valid: false, message: "请输入有效的数字" };
  }
  return { valid: true, message: "" };
}

export function validatePositiveNumber(value: string): ValidationResult {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, message: "请输入有效的正数" };
  }
  return { valid: true, message: "" };
}

export function validateSlug(value: string): ValidationResult {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return { valid: false, message: "Slug只能包含小写字母、数字和连字符，且不能以连字符开头或结尾" };
  }
  return { valid: true, message: "" };
}

export function validateHexColor(value: string): ValidationResult {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
    return { valid: false, message: "请输入有效的十六进制颜色值（如 #fff 或 #ffffff）" };
  }
  return { valid: true, message: "" };
}

export function validatePhoneNumber(value: string): ValidationResult {
  const cleaned = value.replace(/\s/g, '');
  if (!/^1[3-9]\d{9}$/.test(cleaned)) {
    return { valid: false, message: "请输入有效的手机号码" };
  }
  return { valid: true, message: "" };
}

export function validateUsername(value: string): ValidationResult {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
    return { valid: false, message: "用户名只能包含字母、数字和下划线，长度为3-20个字符" };
  }
  return { valid: true, message: "" };
}

export function validateHtmlContent(value: string, maxLength: number = 50000): ValidationResult {
  if (value.length > maxLength) {
    return { valid: false, message: `内容长度不能超过${maxLength}个字符` };
  }
  return { valid: true, message: "" };
}

export function validateArrayNotEmpty<T>(arr: T[] | undefined | null, fieldName: string = "列表"): ValidationResult {
  if (!arr || arr.length === 0) {
    return { valid: false, message: `${fieldName}不能为空` };
  }
  return { valid: true, message: "" };
}
