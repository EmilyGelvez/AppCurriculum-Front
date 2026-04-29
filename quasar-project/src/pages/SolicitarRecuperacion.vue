<template>
  <!-- Layout esencial para que la página no cargue en blanco -->
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md shadow-2 login-card" style="width: 400px">
          
          <q-card-section class="text-center">
            <!-- Contenedor de imagen con manejo de error básico -->
            <div class="flex justify-center q-mb-md">
              <q-img 
                src="../assets/orinoco tech.png" 
                style="width: 150px" 
                spinner-color="primary"
              />
            </div>
            
            <div class="text-h5 text-bold text-primary">Recuperar Acceso</div>
            <div class="text-subtitle2 text-grey-7 q-mt-sm">
              Ingresa tu usuario para enviarte un correo de recuperación.
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="enviarSolicitud" class="q-gutter-md">
              <q-input
                v-model="username"
                label="Nombre de usuario"
                filled
                lazy-rules
                :rules="[val => val && val.length > 0 || 'El usuario es obligatorio']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <div>
                <q-btn
                  label="Enviar Correo"
                  type="submit"
                  color="primary"
                  class="full-width"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section class="text-center q-pt-none">
            <q-btn flat color="primary" label="Volver al Login" to="/login" />
          </q-card-section>
          
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { api } from 'src/boot/axios'; // Verifica que esta ruta sea la correcta en tu proyecto
import { useQuasar } from 'quasar';

const $q = useQuasar();
const username = ref('');
const loading = ref(false);

const enviarSolicitud = async () => {
  loading.value = true;
  try {
    // Petición al endpoint del backend
    await api.post('/auth/forgot-password', { username: username.value });

    $q.notify({
      color: 'positive',
      icon: 'mail',
      message: 'Si el usuario existe, recibirás un correo en breve.',
      position: 'top'
    });
    
    username.value = '';
  } catch (error) {
    console.error('Error en solicitud:', error);
    $q.notify({
      color: 'negative',
      icon: 'report_problem',
      message: error.response?.data?.message || 'Error al procesar la solicitud',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-card {
  border-top: 5px solid #DAA520; /* Color dorado representativo */
}
</style>