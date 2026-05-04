<template>
  <div class="q-pa-md bg-gray-light">
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-3">
        <q-input dense standout="bg-gold" v-model="filtros.name" label="Nombre" bg-color="white" class="filtro-input">
          <template v-slot:append><q-icon name="person" color="primary" /></template>
        </q-input>
      </div>

      <div class="col-12 col-md-3">
        <q-input dense standout="bg-gold" v-model="filtros.email" label="Correo" bg-color="white" class="filtro-input">
          <template v-slot:append><q-icon name="email" color="primary" /></template>
        </q-input>
      </div>

      <div class="col-12 col-md-3">
        <q-input dense standout="bg-gold" v-model="filtros.cargo" label="Cargo" bg-color="white" class="filtro-input">
          <template v-slot:append><q-icon name="work" color="primary" /></template>
        </q-input>
      </div>

      <div class="col-12 col-md-3">
        <q-select dense standout="bg-gold" v-model="orderDate" :options="['Más recientes', 'Más antiguos']"
          label="Ordenar por fecha" bg-color="white" @update:model-value="aplicarOrdenFecha" class="filtro-input" />
      </div>
    </div>

    <q-table title="Curriculums Recibidos" :rows="rows" :columns="columns" row-key="_id" :filter="filtros"
      :filter-method="customFilter" :loading="loading" flat bordered class="orinoco-table">
      <template v-slot:body="props">
        <q-tr :props="props" @click="verDetalles(props.row)" class="cursor-pointer hover-row">
          <q-td key="name" :props="props" class="text-weight-bold text-primary">{{ props.row.name }}</q-td>
          <q-td key="edad" :props="props">{{ props.row.edad }} años</q-td>
          <q-td key="email" :props="props">{{ props.row.email }}</q-td>
          <q-td key="cargo" :props="props">
            <q-badge :style="{ backgroundColor: '#DAA520', color: '#FFFFFF' }" class="text-weight-bold q-pa-xs">
              {{ props.row.cargo }}
            </q-badge>
          </q-td>

          <q-td key="cv" :props="props" class="text-center">
            <q-btn flat round color="negative" icon="picture_as_pdf" @click.stop="abrirPDF(props.row.cvPath)">
              <q-tooltip>Ver Currículum</q-tooltip>
            </q-btn>
          </q-td>

          <q-td key="acciones" :props="props" class="text-center">
            <q-btn v-if="userRole === 'superadmin' || userRole === 'admin'" flat round icon="delete"
              style="color: #374151" @click.stop="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar Registro</q-tooltip>
            </q-btn>
            <q-icon v-else name="lock" color="gray" size="xs" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog v-model="mostrarDetalles" transition-show="jump-down" transition-hide="jump-up">
      <q-card style="width: 500px; max-width: 90vw; border-radius: 12px; overflow: hidden;">
        <q-card-section :style="{ backgroundColor: '#0C1E3C', color: '#FFFFFF' }" class="row items-center q-py-sm">
          <div class="text-subtitle1 text-weight-bold">Expediente del Postulante</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup size="sm" />
        </q-card-section>

        <q-card-section class="q-pa-lg">
          <div class="row items-center q-mb-md">
            <q-avatar size="70px" style="background-color: #F8F9FA; border: 1.5px solid #DAA520" text-color="primary"
              icon="article" class="q-mr-md shadow-1 cursor-pointer" @click="abrirPDF(usuarioSeleccionado.cvPath)">
              <q-tooltip>Ver currículum</q-tooltip>
            </q-avatar>

            <div class="col">
              <div class="text-h6 text-primary text-weight-bolder" style="line-height: 1.2;">
                {{ usuarioSeleccionado.name }}
              </div>
              <div class="text-caption text-weight-bold text-uppercase tracking-wider"
                style="color: #DAA520; letter-spacing: 1px;">
                {{ usuarioSeleccionado.nivel_estudios }}
                <span v-if="usuarioSeleccionado.nivel_estudios !== 'Sin estudios'" class="text-grey-6">
                  | {{ usuarioSeleccionado.titulo_especifico }}
                </span>
              </div>
              <div class="text-caption text-grey-7">{{ usuarioSeleccionado.edad }} años</div>
            </div>
          </div>

          <div class="q-mb-lg">
            <div class="text-caption text-weight-bold text-primary q-mb-xs" style="opacity: 0.7;">CARGO AL QUE ASPIRA
            </div>
            <div class="q-pa-sm row items-center"
              style="background-color: #0C1E3C; border-radius: 6px; border-left: 4px solid #DAA520;">
              <q-icon name="work_outline" size="xs" color="white" class="q-mr-sm" />
              <div class="text-white text-weight-medium text-body2">
                {{ usuarioSeleccionado.cargo }}
              </div>
            </div>
          </div>

          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <div class="text-caption text-grey-6 text-weight-bold">TELÉFONO</div>
              <div class="text-body2 text-primary text-weight-medium">{{ usuarioSeleccionado.tel }}</div>
            </div>
            <div class="col-6">
              <div class="text-caption text-grey-6 text-weight-bold">CORREO</div>
              <div class="text-body2 text-primary text-weight-medium" style="word-break: break-all;">
                {{ usuarioSeleccionado.email }}
              </div>
            </div>
          </div>

          <div class="bg-grey-1 q-pa-md" style="border-radius: 8px;">
            <div class="text-caption text-weight-bold text-primary q-mb-sm">UBICACIÓN RESIDENCIAL</div>
            <div class="row q-col-gutter-sm text-caption text-primary">
              <div class="col-6"><strong>Estado:</strong> {{ usuarioSeleccionado.estado }}</div>
              <div class="col-6"><strong>Ciudad:</strong> {{ usuarioSeleccionado.ciudad }}</div>
              <div class="col-6"><strong>Municipio:</strong> {{ usuarioSeleccionado.municipio }}</div>
              <div class="col-6"><strong>Parroquia:</strong> {{ usuarioSeleccionado.parroquia }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md q-pt-none">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup no-caps />
          <q-btn unelevated :style="{ backgroundColor: '#DAA520', color: '#FFFFFF' }" icon="open_in_new"
            label="Ver Currículum" @click="abrirPDF(usuarioSeleccionado.cvPath)" no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'
import { jwtDecode } from 'jwt-decode'
import { useRoute } from 'vue-router'

const route = useRoute()
const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const userRole = ref('')
const orderDate = ref('Más recientes')
const mostrarDetalles = ref(false)
const usuarioSeleccionado = ref({})

const filtros = reactive({ name: '', email: '', cargo: '' })

const columns = [
  { name: 'name', label: 'Nombre completo', align: 'left', field: 'name', sortable: true },
  { name: 'edad', label: 'Edad', align: 'center', field: 'edad', sortable: true },
  { name: 'email', label: 'Correo', align: 'left', field: 'email', sortable: true },
  { name: 'cargo', label: 'Cargo Aspirado', align: 'left', field: 'cargo', sortable: true },
  { name: 'cv', label: 'PDF', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

const verDetalles = (row) => {
  usuarioSeleccionado.value = row
  mostrarDetalles.value = true
}

const customFilter = (rows, terms) => {
  return rows.filter(row => {
    return row.name.toLowerCase().includes(terms.name.toLowerCase().trim()) &&
      row.email.toLowerCase().includes(terms.email.toLowerCase().trim()) &&
      row.cargo.toLowerCase().includes(terms.cargo.toLowerCase().trim())
  })
}

const cargarPostulaciones = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('orinoco_token')
    const response = await api.get('/postulaciones', {
      headers: { Authorization: `Bearer ${token}` }
    })
    rows.value = response.data
    aplicarOrdenFecha()
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error de conexión con el servidor' })
  } finally { loading.value = false }
}

const aplicarOrdenFecha = () => {
  rows.value.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0); const dateB = new Date(b.createdAt || 0)
    return orderDate.value === 'Más recientes' ? dateB - dateA : dateA - dateB
  })
}

const abrirPDF = (archivo) => {
  if (archivo) window.open(`http://localhost:3000/${archivo}`, '_blank')
}

const confirmarEliminar = (postulacion) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Eliminar permanentemente a ${postulacion.name}?`,
    cancel: true, persistent: true
  }).onOk(async () => {
    try {
      const token = localStorage.getItem('orinoco_token')
      await api.delete(`/postulaciones/${postulacion._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      $q.notify({ color: 'positive', message: 'Registro borrado con éxito' })
      cargarPostulaciones()
    } catch (e) { $q.notify({ color: 'negative', message: 'Error al eliminar registro' }) }
  })
}

onMounted(() => {
  const token = localStorage.getItem('orinoco_token')
  if (token) {
    try { const decoded = jwtDecode(token); userRole.value = decoded.role } catch (e) { }
  }
    if (route.query.cargo) {
      filtros.cargo = route.query.cargo
    }
  cargarPostulaciones()
})
</script>

<style scoped>
.orinoco-table {
  background: white;
  border-radius: 8px;
}

.hover-row:hover {
  background-color: #F5F7FA !important;
  transition: 0.3s;
}

/* --- SOLUCIÓN AL TEXTO BLANCO EN FILTROS --- */
.filtro-input :deep(.q-field__native),
.filtro-input :deep(.q-field__prefix),
.filtro-input :deep(.q-field__suffix),
.filtro-input :deep(.q-field__input) {
  color: #0C1E3C !important;
  /* Mantiene el texto azul oscuro */
}

.filtro-input :deep(.q-field__label) {
  color: #616161 !important;
  /* Color gris suave para el label */
}

/* Al hacer foco (standout), forzamos que el label y el texto sigan siendo visibles */
.filtro-input :deep(.q-field--focused .q-field__label) {
  color: #0C1E3C !important;
}

/* Colores Corporativos */
.text-primary {
  color: #0C1E3C !important;
}

.bg-primary {
  background-color: #0C1E3C !important;
}

.text-gold {
  color: #DAA520 !important;
}

.bg-gold {
  background-color: #DAA520 !important;
}

.bg-gray-light {
  background-color: #F5F7FA !important;
}
</style>