export function validarPasswordSegura(password) {
  if (!password || password.length < 8) {
    return 'Mínimo 8 caracteres'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Debe tener al menos una mayúscula'
  }
  if (!/[0-9]/.test(password)) {
    return 'Debe tener al menos un número'
  }
  if (!/[@$!%*?&.#]/.test(password)) {
    return 'Debe tener al menos un carácter especial (@$!%*?&.#)'
  }
  return null
}

// Para usar directamente como regla de q-input
export const reglasPassword = [
  val => (val && val.length >= 8) || 'Mínimo 8 caracteres',
  val => /[A-Z]/.test(val) || 'Debe tener al menos una mayúscula',
  val => /[0-9]/.test(val) || 'Debe tener al menos un número',
  val => /[@$!%*?&.#]/.test(val) || 'Debe tener al menos un carácter especial (@$!%*?&.#)'
]