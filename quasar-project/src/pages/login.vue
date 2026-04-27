<template>
    <div class="row" style="height: 98vh;">
        <div class="col-12 col-md-6 flex flex-center q-mx-auto" :class="{ 'justify-center': $q.screen.lt.md }">
            <q-card v-bind:style="$q.screen.lt.sm ? { 'width': '88%' } : { 'width': '55%' }">
                <q-card-section class="text-center">
                    <q-avatar size="103px" class="no-border-radius">
                        <img src="../assets/orinoco tech.png" alt="LogoOFT">
                    </q-avatar>
                </q-card-section>

                <q-card-section>
                    <div class="text-center">
                        <h2 class="text-h2 text-uppercase q-my-none text-weight-regular">Login</h2>
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-form class="q-gutter-md" @submit.prevent="submitForm">
                        <q-input v-model="login.username" label="Username" outlined />
                        <q-input v-model="login.password" label="Password" type="password" outlined />

                        <div>
                            <q-btn class="full-width cursor-pointer" type="submit" color="primary" label="Login" rounded
                                unelevated />

                            <div class="text-center q-mt-md q-gutter-md">
                                <router-link class="text-primary cursor-pointer" style="text-decoration: none"
                                    to="/login">
                                    ¿Olvidaste tu contraseña?
                                </router-link>
                            </div>
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </div>
    </div>
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

                console.log(this.login.username)

                // 2. Petición al servidor
                const response = await api.post('/auth/login', {
                    username: this.login.username,
                    password: this.login.password
                });

                // 3. Lógica de éxito (DENTRO del try)
                const datos = response.data;
                if (datos.user) {
                    localStorage.setItem('orinoco_user', JSON.stringify(datos.user));
                }
                // Guardamos el token solo si el servidor lo envió
                if (datos.access_token) {
                    localStorage.setItem('orinoco_token', datos.access_token);
                }
                // Registramos el momento de la entrada para el control de inactividad
                localStorage.setItem('last_activity', Date.now().toString());

                this.$q.notify({
                    type: 'positive',
                    message: '¡Bienvenido!',
                    position: 'top'
                });

                // Redirigir al Index después de un login exitoso
                await this.$router.push('/');

            } catch (error) {
                // 4. Manejo de errores
                let mensaje = 'Credenciales inválidas';

                if (error.response) {
                    // El servidor respondió con un código de error (4xx, 5xx)
                    mensaje = error.response.data.message || mensaje;
                } else if (error.request) {
                    // La petición se hizo pero no hubo respuesta (backend apagado)
                    mensaje = 'El servidor no responde. Revisa que el backend esté activo.';
                }

                this.$q.notify({
                    type: 'negative',
                    message: mensaje,
                    position: 'top'
                });

                console.error('Error en login:', error);
            }
        }
    }
}
</script>