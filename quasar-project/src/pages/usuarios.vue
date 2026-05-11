<template>
  <div class="page-wrapper">
    <div class="q-pa-md">

      <!-- CABECERA -->
      <div class="row items-start justify-between q-mb-md">
        <div>
          <div class="text-h6 text-primary text-weight-bold">Gestión de Usuarios</div>
          <div class="text-caption text-grey-6">Orinoco Fueltech · Panel Administrativo</div>
        </div>
        <q-btn v-if="userRole === 'superadmin' || userRole === 'admin'" unelevated no-caps icon="person_add"
          label="Nuevo Usuario" style="background:#DAA520; color:#fff; border-radius:7px;" dense padding="7px 14px"
          @click="abrirModal" />
      </div>

      <!-- TOOLBAR -->
      <div class="row items-center q-gutter-sm q-mb-md flex-wrap">

        <!-- Total -->
        <div class="total-badge">
          <q-icon name="groups" color="gold" size="18px" />
          Total: <strong class="q-ml-xs">{{ usuarios.length }} usuarios</strong>
        </div>

        <!-- Buscador por nombre -->
        <div class="col">
          <q-input v-model="filtros.username" dense outlined placeholder="Buscar por usuario..." bg-color="white"
            class="filtro-input">
            <template v-slot:prepend><q-icon name="search" color="grey-5" size="18px" /></template>
            <template v-slot:append>
              <q-icon v-if="filtros.username" name="close" class="cursor-pointer" size="16px"
                @click="filtros.username = ''" />
            </template>
          </q-input>
        </div>

        <!-- Botón Filtrar -->
        <q-btn unelevated no-caps icon="filter_list" label="Filtrar"
          style="background:#fff; border:1px solid #e5e7eb; border-radius:7px; color:#374151;" dense padding="7px 14px">
          <q-menu style="border-radius:10px; padding:16px; min-width:240px;">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-sm">FILTRAR POR ROL</div>
            <q-list dense>
              <q-item v-for="op in ['Todos', 'superadmin', 'admin', 'viewer']" :key="op" clickable v-close-popup
                @click="filtros.role = op">
                <q-item-section>
                  <span :style="filtros.role === op ? 'color:#DAA520; font-weight:500' : ''">{{ op }}</span>
                </q-item-section>
                <q-item-section side v-if="filtros.role === op">
                  <q-icon name="check" color="gold" size="16px" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <!-- Botón Ordenar -->
        <q-btn unelevated no-caps icon="sort" :label="ordenFecha"
          style="background:#fff; border:1px solid #e5e7eb; border-radius:7px; color:#374151;" dense padding="7px 14px">
          <q-menu style="border-radius:8px;">
            <q-list dense style="min-width:160px;">
              <q-item v-for="op in ['Más recientes', 'Más antiguos']" :key="op" clickable v-close-popup
                @click="ordenFecha = op; aplicarOrden()">
                <q-item-section>
                  <span :style="ordenFecha === op ? 'color:#DAA520; font-weight:500' : ''">{{ op }}</span>
                </q-item-section>
                <q-item-section side v-if="ordenFecha === op">
                  <q-icon name="check" color="gold" size="16px" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

      </div>

      <!-- TABLA -->
      <q-table :rows="usuariosFiltradosYOrdenados" :columns="columns" row-key="_id" flat class="orinoco-table"
        :loading="loading" :rows-per-page-options="[5, 10, 25]" rows-per-page-label="Registros por página">
        <!-- Columna nombre con foto -->
        <template v-slot:body-cell-username="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-sm">
              <q-avatar size="32px" style="background:#f0f0f0;">
                <img v-if="props.row.photoPath" :src="`${apiUrl}/uploads/fotoPerfilUsuario/${props.row.photoPath}`"
                  style="width:100%; height:100%; object-fit:cover;" />
                <q-icon v-else name="person" size="20px" color="grey-4" />
              </q-avatar>
              <span class="text-weight-medium text-primary">{{ props.row.username }}</span>
            </div>
          </q-td>
        </template>

        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            <span :class="['rol-badge', `rol-${props.row.role}`]">{{ props.row.role }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn v-if="puedeEliminar(props.row)" flat round color="negative" icon="delete" size="sm"
              @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar Usuario</q-tooltip>
            </q-btn>
            <q-icon v-else name="lock" color="grey-4" size="xs" />
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width text-center q-pa-xl text-grey-5">
            <q-icon name="search_off" size="48px" class="q-mb-sm" />
            <div class="text-subtitle2">No se encontraron usuarios</div>
          </div>
        </template>
      </q-table>

      <!-- MODAL NUEVO USUARIO -->
      <!-- MODAL NUEVO USUARIO CORREGIDO -->
      <q-dialog v-model="mostrarModal">
        <q-card style="min-width:380px; border-radius:12px; overflow:hidden;">
          <q-card-section style="background-color:#0C1E3C; color:#fff" class="row items-center q-py-sm">
            <div class="text-subtitle1 text-weight-bold">Registrar Nuevo Acceso</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup size="sm" />
          </q-card-section>

          <q-card-section class="q-pa-lg q-gutter-md">
            <q-input v-model="nuevoUsuario.username" label="Nombre de usuario" outlined dense class="filtro-input" />

            <q-input v-model="nuevoUsuario.email" label="Correo Electrónico" type="email" outlined dense
              class="filtro-input" placeholder="ejemplo@orinoco.com" />

            <!-- CAMBIO: Agregamos ref="passwordRef" -->
            <q-input ref="passwordRef" v-model="nuevoUsuario.password" label="Contraseña"
              :type="verPassModal ? 'text' : 'password'" outlined dense class="filtro-input" :rules="reglasPassword"
              lazy-rules hint="Mín. 8 chars, mayúscula, número y especial">
              <template v-slot:append>
                <q-icon :name="verPassModal ? 'visibility_off' : 'visibility'" class="cursor-pointer" color="grey-5"
                  @click="verPassModal = !verPassModal" />
              </template>
            </q-input>

            <!-- CAMBIO: Agregamos behavior="menu" para que sea un select real -->
            <q-select v-model="nuevoUsuario.role" :options="opcionesRoles" label="Asignar Rol" outlined dense
              behavior="menu" class="filtro-input" />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md q-pt-none">
            <q-btn flat label="Cancelar" color="grey-7" v-close-popup no-caps />
            <q-btn unelevated no-caps label="Guardar Usuario" style="background:#DAA520; color:#fff; border-radius:7px;"
              @click="crearUsuario" />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { jwtDecode } from 'jwt-decode'
import { reglasPassword } from 'src/utils/passwordValidator'

const passwordRef = ref(null)
const verPassModal = ref(false)
const apiUrl = import.meta.env.VITE_API_URL
const $q = useQuasar()
const usuarios = ref([])
const userRole = ref('')
const userId = ref('')
const mostrarModal = ref(false)
const loading = ref(false)
const ordenFecha = ref('Más recientes')

const filtros = reactive({ username: '', role: 'Todos' })
const nuevoUsuario = ref({ username: '', email: '', password: '', role: 'viewer' })

const columns = [
  { name: 'username', label: 'Usuario', field: 'username', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'role', label: 'Rol', field: 'role', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' }
]

const cargarUsuarios = async () => {
  const token = localStorage.getItem('orinoco_token')
  if (!token) return
  loading.value = true
  try {
    const res = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } })
    usuarios.value = res.data
    aplicarOrden()
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Error de sincronización' })
  } finally { loading.value = false }
}

// Filtro startsWith igual que en currículums
const usuariosFiltradosYOrdenados = computed(() => {
  let resultado = []
  if (userRole.value === 'superadmin') resultado = [...usuarios.value]
  else if (userRole.value === 'admin') {
    resultado = usuarios.value.filter(u => u.role === 'admin' || u.role === 'viewer')
  }
  return resultado.filter(u => {
    const coincideNombre = u.username.toLowerCase().startsWith(filtros.username.toLowerCase().trim())
    const coincideRol = filtros.role === 'Todos' || u.role === filtros.role
    return coincideNombre && coincideRol
  })
})

const aplicarOrden = () => {
  usuarios.value.sort((a, b) => {
    const fechaA = new Date(a.createdAt || 0)
    const fechaB = new Date(b.createdAt || 0)
    return ordenFecha.value === 'Más recientes' ? fechaB - fechaA : fechaA - fechaB
  })
}

const crearUsuario = async () => {
  const isPasswordValid = await passwordRef.value.validate()
  if (!isPasswordValid) {
    $q.notify({
      color: 'negative',
      message: 'La contraseña no cumple con los requisitos mínimos',
      icon: 'warning'
    })
    return // Detenemos la ejecución aquí
  }
  try {
    const token = localStorage.getItem('orinoco_token')
    await api.post('/users/register', nuevoUsuario.value, { headers: { Authorization: `Bearer ${token}` } })
    $q.notify({ color: 'positive', message: 'Usuario creado con éxito' })
    mostrarModal.value = false
    cargarUsuarios()
  } catch (e) {
    $q.notify({ color: 'negative', message: e.response?.data?.message || 'Error al crear' })
  }
}

const confirmarEliminar = (user) => {
  $q.dialog({
    title: 'Eliminar',
    message: `¿Borrar a ${user.username}?`,
    cancel: true, persistent: true
  }).onOk(async () => {
    try {
      const token = localStorage.getItem('orinoco_token')
      await api.delete(`/users/${user._id}`, { headers: { Authorization: `Bearer ${token}` } })
      $q.notify({ color: 'positive', message: 'Eliminado' })
      cargarUsuarios()
    } catch (e) { $q.notify({ color: 'negative', message: 'Error de permisos' }) }
  })
}

const opcionesRoles = computed(() => {
  if (userRole.value === 'superadmin') return ['superadmin', 'admin', 'viewer']
  return ['viewer']
})

const puedeEliminar = (targetUser) => {
  if (userRole.value === 'superadmin') return targetUser._id !== userId.value
  if (userRole.value === 'admin') return targetUser.role === 'viewer'
  return false
}

const abrirModal = () => {
  nuevoUsuario.value = { username: '', email: '', password: '', role: 'viewer' }
  mostrarModal.value = true
}

onMounted(() => {
  const token = localStorage.getItem('orinoco_token')
  if (token) {
    try {
      const decoded = jwtDecode(token)
      userRole.value = decoded.role
      userId.value = decoded.sub
      if (userRole.value === 'superadmin' || userRole.value === 'admin') cargarUsuarios()
    } catch (error) { console.error('Error token', error) }
  }
})
</script>

<style scoped>
.page-wrapper {
  background-color: #F5F7FA;
  min-height: calc(100vh - 50px);
  width: 100%;
}

.total-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #FDF6E3;
  border: 1px solid #e8d48a;
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 13px;
  color: #7a5c00;
  white-space: nowrap;
}

.orinoco-table {
  background: white;
  border-radius: 10px;
  border: 0.5px solid #e5e7eb;
}

/* Badges de rol con color según tipo */
.rol-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
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
</style>