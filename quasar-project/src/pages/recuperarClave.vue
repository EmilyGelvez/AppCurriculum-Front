<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md shadow-2 login-card" style="width: 400px">
          
          <q-card-section class="text-center">
            <div class="flex justify-center q-mb-md">
              <q-img src="../assets/orinoco tech.png" style="width: 150px" />
            </div>
            <div class="text-h5 text-bold text-primary">Nueva Contraseña</div>
            <div class="text-subtitle2 text-grey-7 q-mt-sm">
              Crea una clave segura para tu cuenta.
            </div>
          </q-card-section>

          <q-card-section v-if="tokenValido">
            <q-form @submit="actualizarPassword" class="q-gutter-md">
              <q-input
                v-model="nuevaPassword"
                type="password"
                label="Nueva contraseña"
                filled
                :rules="[val => val && val.length >= 6 || 'Mínimo 6 caracteres']"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <q-input
                v-model="confirmarPassword"
                type="password"
                label="Confirmar contraseña"
                filled
                :rules="[
                  val => val === nuevaPassword || 'Las contraseñas no coinciden'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_reset" />
                </template>
              </q-input>

              <div>
                <q-btn
                  label="Guardar Nueva Clave"
                  type="submit"
                  color="primary"
                  class="full-width"
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>

          <q-card-section v-else class="text-center">
            <q-banner class="bg-negative text-white rounded-borders">
              Token no encontrado o inválido. Solicita un nuevo correo.
            </q-banner>
            <q-btn flat color="primary" label="Volver al Login" to="/login" class="q-mt-md" />
          </q-card-section>

        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const nuevaPassword = ref('');
const confirmarPassword = ref('');
const loading = ref(false);
const tokenValido = ref(false);
const token = ref('');

onMounted(() => {
  // Capturamos el token de la URL (?token=...)
  token.value = route.query.token;
  if (token.value) {
    tokenValido.value = true;
  }
});

const actualizarPassword = async () => {
  loading.value = true;
  try {
    await api.post('/auth/reset-password', {
      token: token.value,
      nuevaPassword: nuevaPassword.value
    });

    $q.notify({
      color: 'positive',
      icon: 'check_circle',
      message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.',
      position: 'top'
    });

    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      router.push('/login');
    }, 2000);

  } catch (error) {
    $q.notify({
      color: 'negative',
      icon: 'report_problem',
      message: error.response?.data?.message || 'Error al actualizar la contraseña',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-card {
  border-top: 5px solid #DAA520;
}
</style>