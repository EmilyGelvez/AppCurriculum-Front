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
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { limpiarSesion } from 'src/utils/auth'

export default {
  setup() {
    const leftDrawerOpen = ref(false)
    const $router = useRouter()
    const $route = useRoute()
    const $q = useQuasar()

    // Cada vez que el usuario cambia de página, actualizamos su actividad
    watch(() => $route.path, () => {
      localStorage.setItem('last_activity', Date.now().toString())
    })

    const confirmarSalida = () => {
      $q.dialog({
        title: 'Confirmar salida',
        message: '¿Estás seguro de que quieres cerrar sesión?',
        cancel: {
          label: 'Cancelar',
          color: 'grey',
          flat: true
        },
        ok: {
          label: 'Sí, salir',
          color: 'negative',
          unelevated: true
        },
        persistent: true
      }).onOk(() => {
        // Ejecutamos la limpieza centralizada
        limpiarSesion();

        // Notificación profesional
        $q.notify({
          type: 'positive',
          message: 'Sesión cerrada correctamente',
          position: 'top',
          timeout: 2000
        });

        // Redirección al login
        $router.push('/login');
      });
    }

    return {
      leftDrawerOpen,
      confirmarSalida,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
}
</script>

<style scoped>
.full-height {
  height: 100%;
}

.q-toolbar .q-avatar {
  height: max-content;
  border-radius: 0;
  width: 80px;
}

.my-menu-link {
  color: #DAA520 !important;
  background: rgba(218, 165, 32, 0.1);
  border-radius: 8px;
}

/* Estilo para que el botón de logout resalte un poco más */
.text-negative {
  transition: background 0.3s;
  border-radius: 8px;
}
.text-negative:hover {
  background: rgba(255, 0, 0, 0.05);
}
</style>