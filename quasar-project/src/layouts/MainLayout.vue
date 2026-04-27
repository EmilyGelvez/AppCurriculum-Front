<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>
          <q-avatar>
            <img src="../assets/orinoco-techBNMB.png">
          </q-avatar>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <div class="column full-height q-pa-md">
        <q-list class="column full-height">
          <q-item clickable v-ripple to="/" active-class="my-menu-link" exact>
            <q-item-section avatar>
              <q-icon color="primary" name="home" />
            </q-item-section>
            <q-item-section>Inicio</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/Dashboard" active-class="my-menu-link">
            <q-item-section avatar>
              <q-icon color="primary" name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item 
            v-if="userRole === 'superadmin' || userRole === 'admin'" 
            clickable 
            v-ripple 
            to="/usuarios" 
            active-class="my-menu-link"
          >
            <q-item-section avatar>
              <q-icon color="primary" name="person" />
            </q-item-section>
            <q-item-section>Usuarios</q-item-section>
          </q-item>

          <q-space />

          <q-item clickable v-ripple @click="confirmarSalida" class="text-negative q-mb-md">
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Cerrar Sesión</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { limpiarSesion } from 'src/utils/auth'
import { jwtDecode } from 'jwt-decode'

export default {
  setup() {
    const leftDrawerOpen = ref(false)
    const userRole = ref('')
    const $router = useRouter()
    const $route = useRoute()
    const $q = useQuasar()
    
    let intervaloInactividad = null // Guardamos el intervalo aquí

    // 💡 Función para actualizar el timestamp de actividad
    const actualizarActividad = () => {
      localStorage.setItem('last_activity', Date.now().toString())
    }

    // 🛡️ FUNCIÓN CRÍTICA: Revisa si el tiempo expiró
    const verificarSesion = () => {
      const ultimaActividad = localStorage.getItem('last_activity')
      const token = localStorage.getItem('orinoco_token')

      if (token && ultimaActividad) {
        const ahora = Date.now()
        const transcurrido = ahora - parseInt(ultimaActividad)
        const LIMITE = 15 * 60 * 1000 // 15 minutos en milisegundos

        if (transcurrido > LIMITE) {
          console.warn("Sesión expirada por inactividad")
          ejecutarCierreSesion('Sesión expirada por inactividad')
        }
      }
    }

    const ejecutarCierreSesion = (mensaje) => {
      limpiarSesion()
      if (intervaloInactividad) clearInterval(intervaloInactividad)
      
      $q.notify({
        type: 'warning',
        message: mensaje,
        position: 'top'
      })
      $router.push('/login')
    }

    const obtenerInfoUsuario = () => {
      const token = localStorage.getItem('orinoco_token')
      if (token) {
        try {
          const decoded = jwtDecode(token)
          userRole.value = decoded.role
        } catch (e) {
          console.error("Error leyendo token:", e)
        }
      }
    }

    onMounted(() => {
      obtenerInfoUsuario()
      actualizarActividad()

      // 🕒 REVISIÓN ACTIVA: Chequea cada 15 segundos si debe sacarte
      intervaloInactividad = setInterval(verificarSesion, 15000)

      // 🖱️ LISTENERS: Reinician el contador de los 15 min
      window.addEventListener('mousemove', actualizarActividad)
      window.addEventListener('keydown', actualizarActividad)
      window.addEventListener('click', actualizarActividad)
      window.addEventListener('scroll', actualizarActividad)
    })

    onUnmounted(() => {
      if (intervaloInactividad) clearInterval(intervaloInactividad)
      window.removeEventListener('mousemove', actualizarActividad)
      window.removeEventListener('keydown', actualizarActividad)
      window.removeEventListener('click', actualizarActividad)
      window.removeEventListener('scroll', actualizarActividad)
    })

    watch(() => $route.path, () => {
      actualizarActividad()
      obtenerInfoUsuario()
    })

    const confirmarSalida = () => {
      $q.dialog({
        title: 'Confirmar salida',
        message: '¿Estás seguro de que quieres cerrar sesión?',
        cancel: { label: 'Cancelar', color: 'grey', flat: true },
        ok: { label: 'Sí, salir', color: 'negative', unelevated: true },
        persistent: true
      }).onOk(() => {
        ejecutarCierreSesion('Sesión cerrada correctamente')
      })
    }

    return {
      leftDrawerOpen,
      userRole,
      confirmarSalida,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
}
</script>

<style scoped>
.full-height { height: 100%; }
.q-toolbar .q-avatar { height: max-content; border-radius: 0; width: 80px; }
.my-menu-link { color: #DAA520 !important; background: rgba(218, 165, 32, 0.1); border-radius: 8px; }
.text-negative { transition: background 0.3s; border-radius: 8px; }
.text-negative:hover { background: rgba(255, 0, 0, 0.05); }
</style>