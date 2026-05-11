<template>
  <div class="page-wrapper">
    <div class="q-pa-lg flex flex-center">
      <div style="width: 100%; max-width: 720px;">

        <div class="text-h5 text-primary text-weight-bold text-center q-mb-lg">
          Perfil de Usuario
        </div>

        <q-card flat bordered class="perfil-card">
          <q-card-section class="q-pa-xl perfil-card__container">

            <!-- Avatar + subir foto -->
            <div class="row items-center q-mb-lg perfil-card__fotoYBoton" style="gap: 24px;">
              <div class="avatar-wrapper">
                <q-avatar size="100px" style="box-shadow: 0 0 0 3px #DAA520; background: #f0f0f0;">
                  <img v-if="fotoUrl" :src="fotoUrl" style="width:100%; height:100%; object-fit:cover;" />
                  <q-icon v-else name="person" size="60px" color="grey-4" />
                </q-avatar>
                <q-inner-loading :showing="subiendoFoto">
                  <q-spinner-dots color="gold" size="30px" />
                </q-inner-loading>
              </div>

              <div>
                <q-btn unelevated no-caps label="SUBIR NUEVA FOTO"
                  style="background:#DAA520; color:#fff; border-radius:7px; font-weight:600;" padding="8px 18px"
                  :loading="subiendoFoto" @click="$refs.inputFoto.click()" />
                <div class="text-caption text-grey-6 q-mt-xs">JPG o PNG recomendado. Máx 2MB.</div>
                <input ref="inputFoto" type="file" accept="image/jpeg,image/png" style="display:none"
                  @change="subirFoto" />
              </div>
            </div>

            <q-separator class="q-mb-lg" />

            <!-- Datos del usuario -->
            <div class="row q-col-gutter-lg q-mb-lg">
              <div class="col-12 col-sm-4 text-center">
                <div class="text-caption text-grey-6 q-mb-xs">Nombre de Usuario</div>
                <div class="text-body1 text-primary text-weight-bold">{{ perfil.username || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4 text-center">
                <div class="text-caption text-grey-6 q-mb-xs">Correo Electrónico</div>
                <div class="text-body1 text-primary text-weight-bold">{{ perfil.email || '—' }}</div>
              </div>
              <div class="col-12 col-sm-4 text-center">
                <div class="text-caption text-grey-6 q-mb-xs">Rol de Sistema</div>
                <span v-if="perfil.role" :class="['rol-badge', `rol-${perfil.role}`]">{{ perfil.role }}</span>
                <span v-else>—</span>
              </div>
            </div>

            <q-separator class="q-mb-lg" />

            <!-- Cambiar contraseña -->
            <div class="text-center">
              <q-btn outline no-caps label="CAMBIAR CONTRASEÑA" icon="lock"
                style="border-color:#DAA520; color:#DAA520; border-radius:7px; min-width:260px; max-width:100%;"
                class="full-width-xs" @click="mostrarModalPass = true" />
            </div>

          </q-card-section>
        </q-card>
        <q-dialog v-model="mostrarModalPass" transition-show="jump-down" transition-hide="jump-up">
          <q-card style="width:420px; max-width:95vw; border-radius:12px; overflow:hidden;">

            <q-card-section style="background-color:#0C1E3C; color:#fff" class="row items-center q-py-sm">
              <q-icon name="lock" color="gold" size="20px" class="q-mr-sm" />
              <div class="text-subtitle1 text-weight-bold">Cambiar Contraseña</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup size="sm" color="white" @click="cerrarModalPass" />
            </q-card-section>

            <q-card-section class="q-pa-lg">
              <div class="column q-gutter-md">

                <q-input v-model="passForm.actual" label="Contraseña actual"
                  :type="verPass.actual ? 'text' : 'password'" outlined dense class="filtro-input">
                  <template v-slot:append>
                    <q-icon :name="verPass.actual ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      color="grey-5" @click="verPass.actual = !verPass.actual" />
                  </template>
                </q-input>

                <q-input v-model="passForm.nueva" label="Nueva contraseña" :type="verPass.nueva ? 'text' : 'password'"
                  outlined dense class="filtro-input" hint="Mín. 8 chars, mayúscula, número y carácter especial">
                  <template v-slot:append>
                    <q-icon :name="verPass.nueva ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      color="grey-5" @click="verPass.nueva = !verPass.nueva" />
                  </template>
                </q-input>

                <q-input v-model="passForm.confirmar" label="Confirmar nueva contraseña"
                  :type="verPass.confirmar ? 'text' : 'password'" outlined dense class="filtro-input"
                  :error="passForm.confirmar.length > 0 && passForm.nueva !== passForm.confirmar"
                  error-message="Las contraseñas no coinciden">
                  <template v-slot:append>
                    <q-icon :name="verPass.confirmar ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                      color="grey-5" @click="verPass.confirmar = !verPass.confirmar" />
                  </template>
                </q-input>

              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md q-pt-none">
              <q-btn flat no-caps label="Cancelar" color="grey-7" @click="cerrarModalPass" />
              <q-btn unelevated no-caps label="Guardar contraseña"
                style="background:#DAA520; color:#fff; border-radius:7px;" :loading="guardandoPass"
                @click="guardarPassword" />
            </q-card-actions>

          </q-card>
        </q-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { jwtDecode } from 'jwt-decode'
import { validarPasswordSegura } from 'src/utils/passwordValidator'

const mostrarModalPass = ref(false)
const verPass = reactive({ actual: false, nueva: false, confirmar: false })
const $q = useQuasar()
const perfil = ref({ username: '', email: '', role: '', photoPath: null })
const subiendoFoto = ref(false)
const guardandoPass = ref(false)
const passForm = ref({ actual: '', nueva: '', confirmar: '' })

const fotoUrl = computed(() => {
  if (!perfil.value.photoPath) return null
  // La foto está en uploads/fotoPerfilUsuario/
  return `${import.meta.env.VITE_API_URL}/uploads/fotoPerfilUsuario/${perfil.value.photoPath}`
})

const cargarPerfil = async () => {
  try {
    const token = localStorage.getItem('orinoco_token')
    if (!token) return

    // Primero intentamos con GET /users/me
    // Si falla, extraemos los datos básicos del token
    try {
      const res = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      perfil.value = res.data
    } catch (e) {
      // Fallback: leer datos del JWT mientras implementas el endpoint
      const decoded = jwtDecode(token)
      perfil.value = {
        username: decoded.username || decoded.sub || '',
        email: decoded.email || '',
        role: decoded.role || '',
        photoPath: null
      }
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error cargando perfil' })
  }
}

const cerrarModalPass = () => {
  mostrarModalPass.value = false
  passForm.value = { actual: '', nueva: '', confirmar: '' }
  verPass.actual = false
  verPass.nueva = false
  verPass.confirmar = false
}
const subirFoto = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    $q.notify({ type: 'warning', message: 'La imagen no debe superar 2MB' })
    return
  }

  subiendoFoto.value = true
  try {
    const formData = new FormData()
    formData.append('photo', file)
    const token = localStorage.getItem('orinoco_token')
    const res = await api.post('/users/upload-photo', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    perfil.value.photoPath = res.data.photoPath
    $q.notify({ type: 'positive', message: 'Foto actualizada correctamente' })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al subir la foto' })
  } finally {
    subiendoFoto.value = false
    event.target.value = ''
  }
}

const guardarPassword = async () => {
  if (!passForm.value.actual) {
    $q.notify({ type: 'warning', message: 'Ingresa tu contraseña actual' })
    return
  }
  const error = validarPasswordSegura(passForm.value.nueva)
  if (error) {
    $q.notify({ type: 'warning', message: error })
    return
  }
  if (passForm.value.nueva !== passForm.value.confirmar) {
    $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden' })
    return
  }

  guardandoPass.value = true
  try {
    const token = localStorage.getItem('orinoco_token')
    await api.patch('/users/change-password', {
      actual: passForm.value.actual,
      nueva: passForm.value.nueva,
      confirmar: passForm.value.confirmar
    }, { headers: { Authorization: `Bearer ${token}` } })

    $q.notify({ type: 'positive', message: 'Contraseña actualizada correctamente' })
    cerrarModalPass()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al cambiar la contraseña' })
  } finally {
    guardandoPass.value = false
  }
}

onMounted(() => cargarPerfil())
</script>

<style scoped>
.page-wrapper {
  background-color: #F5F7FA;
  min-height: calc(100vh - 50px);
  width: 100%;
}

.perfil-card {
  background: white;
  border-radius: 12px !important;
  border: 0.5px solid #e5e7eb !important;
}

.avatar-wrapper {
  position: relative;
  display: inline-flex;
}

.rol-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.rol-superadmin {
  background: #EEF2FF;
  color: #3730a3;
  border: 1px solid #c7d2fe;
}

.rol-admin {
  background: #FDF6E3;
  color: #7a5c00;
  border: 1px solid #e8d48a;
}

.rol-viewer {
  background: #F0FDF4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.filtro-input :deep(.q-field__native),
.filtro-input :deep(.q-field__input) {
  color: #0C1E3C !important;
}

.filtro-input :deep(.q-field__label) {
  color: #616161 !important;
}

.text-primary {
  color: #0C1E3C !important;
}

@media (max-width: 599px) {
  .perfil-card__fotoYBoton {
    justify-content: center;
    text-align: center;
  }

  .full-width-xs {
    min-width: unset !important;
    width: 100%;
  }

  .perfil-card__container{
    padding: 20px;
  }
}
</style>