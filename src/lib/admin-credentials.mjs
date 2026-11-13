const emailFormat = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;

/** @param {unknown} inputEmail @param {unknown} inputPassword */
export function validateAdminCredentials(inputEmail, inputPassword) {
  const email = typeof inputEmail === 'string' ? inputEmail.trim().toLowerCase() : '';
  const password = typeof inputPassword === 'string' ? inputPassword : '';
  return {
    email,
    password,
    errors: {
      email: !email ? 'Ingresa tu correo.' : email.length > 254 || !emailFormat.test(email) ? 'Ingresa un correo válido.' : '',
      password: !password ? 'Ingresa tu contraseña.' : password.length > 4096 ? 'La contraseña supera el límite permitido.' : '',
    },
  };
}
