<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="q-pa-md shadow-2 login-card" style="width: 400px">
          
          <!-- Sección del Logo -->
          <q-card-section class="text-center">
            <div class="flex justify-center q-mb-md">
              <q-img src="../assets/orinoco tech.png" style="width: 150px" />
            </div>
            <div class="text-h5 text-bold text-primary">Bienvenido</div>
            <div class="text-subtitle2 text-grey-7 q-mt-sm">
              Ingresa tus credenciales para acceder.
            </div>
          </q-card-section>

          <!-- Formulario de Login -->
          <q-card-section>
            <q-form @submit.prevent="submitForm" class="q-gutter-md">
              <q-input
                v-model="login.username"
                label="Nombre de usuario"
                filled
                :rules="[val => !!val || 'El usuario es requerido']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" />
                </template>
              </q-input>

              <q-input
                v-model="login.password"
                type="password"
                label="Contraseña"
                filled
                :rules="[val => !!val || 'La contraseña es requerida']"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>

              <div>
                <q-btn
                  label="Iniciar Sesión"
                  type="submit"
                  color="primary"
                  class="full-width"
                  unelevated
                />
              </div>

              <div class="text-center q-mt-md">
                <q-btn 
                  flat 
                  color="primary" 
                  label="¿Olvidaste tu contraseña?" 
                  to="/SolicitarRecuperacion" 
                  size="sm"
                  class="text-weight-bold"
                />
              </div>
            </q-form>
          </q-card-section>

        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { api } from 'src/boot/axios'

export default {
  name: 'Login',
  data() {
    return {
      login: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        if (!this.login.username || !this.login.password) {
          this.$q.notify({
            type: 'warning',
            message: 'Por favor, llena todos los campos',
            position: 'top'
          });
          return;
        }

        const response = await api.post('/auth/login', {
          username: this.login.username,
          password: this.login.password
        });

        const datos = response.data;
        
        if (datos.user) {
          localStorage.setItem('orinoco_user', JSON.stringify(datos.user));
        }
        if (datos.access_token) {
          localStorage.setItem('orinoco_token', datos.access_token);
        }
        localStorage.setItem('last_activity', Date.now().toString());

        this.$q.notify({
          type: 'positive',
          message: '¡Bienvenido!',
          position: 'top',
          icon: 'check_circle'
        });

        await this.$router.push('/');

      } catch (error) {
        let mensaje = 'Credenciales inválidas';
        if (error.response) {
          mensaje = error.response.data.message || mensaje;
        } else if (error.request) {
          mensaje = 'El servidor no responde. Revisa el backend.';
        }

        this.$q.notify({
          type: 'negative',
          message: mensaje,
          position: 'top',
          icon: 'report_problem'
        });
      }
    }
  }
}
</script>

<style scoped>
/* Este es el toque clave para que se vea igual al de recuperación */
.login-card {
  border-top: 5px solid #DAA520; /* El color dorado/primary */
  border-radius: 8px;
}
</style>