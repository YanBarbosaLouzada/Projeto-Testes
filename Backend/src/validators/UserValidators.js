export function senhasConferem(password, confirmPassword) {
  return password === confirmPassword;
}

export function validarEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarIdade(age) {
  return Number.isInteger(age) && age >= 0 && age <= 120;
}

export function validarSenha(password) {
  return typeof password === "string"
    && password.length >= 12
    && /[A-Za-z]/.test(password)
    && /\d/.test(password);
}

export function validarCadastroUsuario({ name, age, email, password, confirmPassword }) {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
    return "Nome é obrigatório e deve ter até 100 caracteres.";
  }
  if (!validarEmail(email) || email.length > 254) {
    return "Email inválido.";
  }
  if (!validarIdade(age)) {
    return "Idade inválida.";
  }
  if (!validarSenha(password)) {
    return "A senha deve ter ao menos 12 caracteres, incluindo letras e números.";
  }
  if (!senhasConferem(password, confirmPassword)) {
    return "As senhas são diferentes.";
  }
  return null;
}