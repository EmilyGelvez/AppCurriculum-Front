import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { limpiarSesion } from 'src/utils/auth'

// Creamos la instancia fuera para poder exportarla
const api = axios.create({ 
  baseURL: 'http://localhost:3000',
  timeout: 10000 
})

export default boot(({ app, router }) => {
  // Interceptor de Petición
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('orinoco_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // Interceptor de Respuesta
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // 🛡️ REGLA DE ORO: Solo sacar si es 401 real y NO estamos ya en el login
      if (error.response && error.response.status === 401) {
        if (router.currentRoute.value.path !== '/login') {
          console.warn('Sesión expirada. Limpiando datos...')
          limpiarSesion()
          router.replace('/login')
        }
      }
      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }