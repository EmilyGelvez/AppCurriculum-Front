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
                        <h2 class="text-h3 text-uppercase q-my-none text-weight-regular">REGISTRARSE</h2>
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-form class="q-gutter-md" @submit.prevent="submitForm">
                        <q-input v-model="user.username" label="Username" outlined />
                        <q-input v-model="user.password" label="Password" type="password" outlined />

                        <div>
                            <q-btn class="full-width cursor-pointer" type="submit" color="primary" label="Crear cuenta" rounded
                                unelevated />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Register',
    data() {
        return {
            // Cambiamos el nombre a 'user' para que sea más claro que el de login
            user: {
                username: '',
                password: ''
            }
        }
    },
    methods: {
        async submitForm() {
            try {
                // 1. Validación básica antes de enviar
                if (!this.user.username || !this.user.password) {
                    this.$q.notify({
                        type: 'warning',
                        message: 'Por favor, completa todos los campos para el registro',
                        position: 'top'
                    });
                    return;
                }

                // 2. Petición al endpoint de creación de usuarios
                // Nota: Asegúrate de que en el backend creaste el recurso 'users'
                const response = await this.$axios.post('http://localhost:3000/users', {
                    username: this.user.username,
                    password: this.user.password
                });

                console.log('Usuario creado:', response.data);
                
                this.$q.notify({
                    type: 'positive',
                    message: '¡Cuenta creada con éxito! Ya puedes iniciar sesión',
                    position: 'top'
                });

                // 3. Redirigir al login automáticamente después de registrarse
                this.$router.push('/login');

            } catch (error) {
                let mensaje = 'No se pudo crear la cuenta';

                if (error.response) {
                    // Si el usuario ya existe, NestJS suele mandar un error 400 o 409
                    mensaje = error.response.data.message || mensaje;
                } else if (error.request) {
                    mensaje = 'El servidor no responde. Verifica que el backend esté activo.';
                }

                this.$q.notify({
                    type: 'negative',
                    message: mensaje,
                    position: 'top'
                });
            }
        }
    }
}
</script>