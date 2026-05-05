import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { limpiarSesion } from 'src/utils/auth'

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 60000 
})

export default boot(({ app, router }) => {
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

  api.interceptors.response.use(
    (response) => response,
    (error) => {
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