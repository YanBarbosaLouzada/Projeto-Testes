export function senhasConferem(password, confirmPassword) {
  return password === confirmPassword;
}

export function validarEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarIdade(age) {
  return Number.isInteger(age) && age >= 0 && age <= 120;
}