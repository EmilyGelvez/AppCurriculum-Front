import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance } from 'axios'
import { limpiarSesion } from 'src/utils/auth'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({ baseURL: 'http://localhost:3000' })

export default boot(({ app, router }) => {
  // 1. Interceptor de Petición (Envía el token al servidor)
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

  // 2. Interceptor de Respuesta (Te saca si el servidor dice 401)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log('Sesión expirada detectada por el escudo 401')
        limpiarSesion()
        router.push('/login')
      }
      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }