export function validateFullName(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 'Escribe tu nombre completo.';
  if (trimmed.length < 5 || !trimmed.includes(' ')) return 'Incluye nombre y apellido.';
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  if (value.trim().length === 0) return 'Ingresa tu email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Revisa el formato, por ejemplo nombre@correo.com.';
  }
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return 'Lo usamos para coordinar tus entregas.';
  if (digits.length !== 10 || !digits.startsWith('3')) {
    return 'Usa un celular de 10 dígitos que empiece por 3.';
  }
  return undefined;
}

export function validateDocumentId(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return 'Ingresa tu número de cédula.';
  if (digits.length < 6 || digits.length > 10) return 'La cédula tiene entre 6 y 10 dígitos.';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (value.length === 0) return 'Crea una contraseña.';
  if (value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Mínimo 8 caracteres, con letras y números.';
  }
  return undefined;
}

export function validateConfirmPassword(value: string, password: string): string | undefined {
  if (value.length === 0) return 'Repite la contraseña.';
  if (value !== password) return 'Las contraseñas no coinciden.';
  return undefined;
}

export function validateLoginEmail(value: string): string | undefined {
  if (value.trim().length === 0) return 'Ingresa tu email.';
  return undefined;
}

export function validateLoginPassword(value: string): string | undefined {
  if (value.length === 0) return 'Ingresa tu contraseña.';
  return undefined;
}
