<template>
  <div class="page-wrapper">
    <div class="q-pa-md">

      <!-- CABECERA -->
      <div class="row items-start justify-between q-mb-md header">
        <div>
          <div class="text-h6 text-primary text-weight-bold">Currículums recibidos</div>
          <div class="text-caption text-grey-6">Gestión de Talento Humano · Orinoco Fueltech</div>
        </div>
        <div class="row q-gutter-xs btnVista">
          <q-btn unelevated
            :style="vistaActual === 'lista' ? 'background:#DAA520;color:#fff' : 'background:#fff;color:#6B7280'"
            style="border-radius:7px; border:1.5px solid #e5e7eb;" dense no-caps icon="view_list" label="Lista"
            @click="cambiarVista('lista')" />
          <q-btn unelevated
            :style="vistaActual === 'tarjetas' ? 'background:#DAA520;color:#fff' : 'background:#fff;color:#6B7280'"
            style="border-radius:7px; border:1.5px solid #e5e7eb;" dense no-caps icon="grid_view" label="Tarjetas"
            @click="cambiarVista('tarjetas')" />
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="row items-center q-gutter-sm q-mb-md flex-wrap toolbar">
        <div class="total-badge">
          <q-icon name="groups" color="gold" size="18px" />
          Total: <strong class="q-ml-xs">{{ rows.length }} postulantes</strong>
        </div>

        <div class="col">
          <q-input v-model="filtros.name" dense outlined placeholder="Buscar por nombre..." bg-color="white"
            class="filtro-input">
            <template v-slot:prepend><q-icon name="search" color="grey-5" size="18px" /></template>
            <template v-slot:append>
              <q-icon v-if="filtros.name" name="close" class="cursor-pointer" size="16px" @click="filtros.name = ''" />
            </template>
          </q-input>
        </div>

        <!-- Botón Filtrar -->
        <q-btn unelevated no-caps icon="filter_list" label="Filtrar"
          style="background:#fff; border:1px solid #e5e7eb; border-radius:7px; color:#374151;" dense padding="7px 14px">
          <q-menu style="border-radius:10px; padding:16px; min-width:280px;">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-sm">FILTROS</div>
            <q-input v-model="filtros.email" dense outlined label="Correo electrónico" bg-color="white"
              class="filtro-input q-mb-sm">
              <template v-slot:prepend><q-icon name="email" color="grey-5" size="16px" /></template>
            </q-input>
            <q-input v-model="filtros.cargo" dense outlined label="Cargo aspirado" bg-color="white"
              class="filtro-input q-mb-sm">
              <template v-slot:prepend><q-icon name="work" color="grey-5" size="16px" /></template>
            </q-input>
            <q-btn v-if="filtros.email || filtros.cargo" flat dense no-caps label="Limpiar filtros" color="grey-6"
              size="sm" @click="filtros.email = ''; filtros.cargo = ''" />
          </q-menu>
        </q-btn>

        <!-- Botón Ordenar -->
        <q-btn unelevated no-caps icon="sort" :label="orderDate"
          style="background:#fff; border:1px solid #e5e7eb; border-radius:7px; color:#374151;" dense padding="7px 14px">
          <q-menu style="border-radius:8px;">
            <q-list dense style="min-width:160px;">
              <q-item v-for="op in ['Más recientes', 'Más antiguos']" :key="op" clickable v-close-popup
                @click="orderDate = op; aplicarOrdenFecha()">
                <q-item-section>
                  <span :style="orderDate === op ? 'color:#DAA520; font-weight:500' : ''">{{ op }}</span>
                </q-item-section>
                <q-item-section side v-if="orderDate === op">
                  <q-icon name="check" color="gold" size="16px" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <!-- VISTA LISTA -->
      <div v-if="vistaActual === 'lista'">
        <q-table :rows="rowsFiltrados" :columns="columns" row-key="_id" :loading="loading" flat class="orinoco-table"
          :rows-per-page-options="[5, 10, 25]" rows-per-page-label="Registros por página">
          <template v-slot:body="props">
            <q-tr :props="props" @click="verDetalles(props.row)" class="cursor-pointer hover-row">
              <q-td key="name" :props="props" class="text-weight-bold text-primary">{{ props.row.name }}</q-td>
              <q-td key="edad" :props="props">{{ props.row.edad }} años</q-td>
              <q-td key="email" :props="props" class="text-grey-7">{{ props.row.email }}</q-td>
              <q-td key="cargo" :props="props">
                <span :class="['cargo-badge', obtenerClaseCargo(props.row.cargo)]">{{ props.row.cargo }}</span>
              </q-td>
              <q-td key="cv" :props="props" class="text-center">
                <q-btn flat round color="negative" icon="picture_as_pdf" size="sm"
                  @click.stop="abrirPDF(props.row.cvPath)">
                  <q-tooltip>Ver Currículum</q-tooltip>
                </q-btn>
              </q-td>
              <q-td key="acciones" :props="props" class="text-center">
                <q-btn v-if="userRole === 'superadmin' || userRole === 'admin'" flat round icon="delete" size="sm"
                  style="color:#6B7280" @click.stop="confirmarEliminar(props.row)">
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
                <q-icon v-else name="lock" color="grey-4" size="xs" />
              </q-td>
            </q-tr>
          </template>
          <template v-slot:no-data>
            <div class="full-width text-center q-pa-xl text-grey-5">
              <q-icon name="search_off" size="48px" class="q-mb-sm" />
              <div class="text-subtitle2">No se encontraron resultados</div>
            </div>
          </template>
        </q-table>
      </div>

      <!-- VISTA TARJETAS -->
      <div v-else class="row q-col-gutter-md">
        <div v-for="row in rowsFiltrados" :key="row._id" class="col-6 col-sm-4 col-md-3">
          <q-card flat class="cv-card" @click="verDetalles(row)">

            <!-- Preview PDF -->
            <div class="pdf-preview-wrapper">
              <canvas :ref="el => { if (el) canvasRefs[row._id] = el }" class="pdf-canvas" />
              <div v-if="!pdfCargado[row._id]" class="pdf-placeholder">
                <q-icon name="picture_as_pdf" size="40px" color="grey-4" />
                <div class="text-caption text-grey-5 q-mt-xs">Cargando preview...</div>
              </div>
            </div>

            <q-separator />

            <!-- Datos -->
            <q-card-section class="q-pa-sm">
              <div class="text-weight-bold text-primary ellipsis">{{ row.name }}</div>
              <div class="text-caption text-grey-6">{{ row.edad }} años</div>
              <div class="text-caption text-grey-6 ellipsis">{{ row.email }}</div>
              <div class="q-mt-xs">
                <!-- CORRECCIÓN: Usar 'row.cargo' en lugar de 'props.row.cargo' -->
                <span :class="['cargo-badge', obtenerClaseCargo(row.cargo)]">
                  {{ row.cargo }}
                </span>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-xs">
              <q-btn flat dense round color="negative" icon="picture_as_pdf" size="sm"
                @click.stop="abrirPDF(row.cvPath)">
                <q-tooltip>Ver PDF</q-tooltip>
              </q-btn>
              <q-btn v-if="userRole === 'superadmin' || userRole === 'admin'" flat dense round icon="delete" size="sm"
                style="color:#6B7280" @click.stop="confirmarEliminar(row)">
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- DIALOG DETALLES -->
      <q-dialog v-model="mostrarDetalles" transition-show="jump-down" transition-hide="jump-up">
        <q-card style="width: 500px; max-width: 90vw; border-radius: 12px; overflow: hidden;">
          <q-card-section style="background-color:#0C1E3C; color:#FFFFFF" class="row items-center q-py-sm">
            <div class="text-subtitle1 text-weight-bold">Expediente del Postulante</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup size="sm" />
          </q-card-section>
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <q-avatar size="70px" style="background-color:#F8F9FA; border:1.5px solid #DAA520" text-color="primary"
                icon="article" class="q-mr-md shadow-1 cursor-pointer" @click="abrirPDF(usuarioSeleccionado.cvPath)">
                <q-tooltip>Ver currículum</q-tooltip>
              </q-avatar>
              <div class="col">
                <div class="text-h6 text-primary text-weight-bolder" style="line-height:1.2">{{ usuarioSeleccionado.name
                }}
                </div>
                <div class="text-caption text-weight-bold text-uppercase" style="color:#DAA520; letter-spacing:1px">
                  {{ usuarioSeleccionado.nivel_estudios }}
                  <span v-if="usuarioSeleccionado.nivel_estudios !== 'Sin estudios'" class="text-grey-6">
                    | {{ usuarioSeleccionado.titulo_especifico }}
                  </span>
                </div>
                <div class="text-caption text-grey-7">{{ usuarioSeleccionado.edad }} años</div>
              </div>
            </div>
            <div class="q-mb-lg">
              <div class="text-caption text-weight-bold text-primary q-mb-xs" style="opacity:0.7">CARGO AL QUE ASPIRA
              </div>
              <div class="q-pa-sm row items-center"
                style="background-color:#0C1E3C; border-radius:6px; border-left:4px solid #DAA520">
                <q-icon name="work_outline" size="xs" color="white" class="q-mr-sm" />
                <div class="text-white text-weight-medium text-body2">{{ usuarioSeleccionado.cargo }}</div>
              </div>
            </div>
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-6">
                <div class="text-caption text-grey-6 text-weight-bold">TELÉFONO</div>
                <div class="text-body2 text-primary text-weight-medium">{{ usuarioSeleccionado.tel }}</div>
              </div>
              <div class="col-6">
                <div class="text-caption text-grey-6 text-weight-bold">CORREO</div>
                <div class="text-body2 text-primary text-weight-medium" style="word-break:break-all">{{
                  usuarioSeleccionado.email }}</div>
              </div>
            </div>
            <div class="bg-grey-1 q-pa-md" style="border-radius:8px">
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
            <q-btn unelevated style="background-color:#DAA520; color:#FFFFFF" icon="open_in_new" label="Ver Currículum"
              @click="abrirPDF(usuarioSeleccionado.cvPath)" no-caps />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed, watch, nextTick } from 'vue'
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
const canvasRefs = reactive({})
const pdfCargado = reactive({})
const apiUrl = import.meta.env.VITE_API_URL

// Vista persistida en localStorage
const vistaActual = ref(localStorage.getItem('orinoco_vista') || 'lista')
const cambiarVista = (v) => {
  vistaActual.value = v
  localStorage.setItem('orinoco_vista', v)
}

const obtenerClaseCargo = (cargo) => {
  const clases = {
    'Gerente de Recursos Humanos': 'cargo-gerencia',
    'Analista de Recursos Humanos': 'cargo-rh',
    'Jefe de Finanzas': 'cargo-finanzas',
    'Analista Contable': 'cargo-finanzas',
    'Logistica': 'cargo-logistica',
    'Asistente Administrativo': 'cargo-admin',
    'Tecnología': 'cargo-tecnologia',
    'Analista Legal': 'cargo-legal'
  }

  return clases[cargo] || 'cargo-default'
}

const filtros = reactive({ name: '', email: '', cargo: '' })

const columns = [
  { name: 'name', label: 'Nombre completo', align: 'left', field: 'name', sortable: true },
  { name: 'edad', label: 'Edad', align: 'center', field: 'edad', sortable: true },
  { name: 'email', label: 'Correo', align: 'left', field: 'email' },
  { name: 'cargo', label: 'Cargo Aspirado', align: 'left', field: 'cargo', sortable: true },
  { name: 'cv', label: 'PDF', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

// Filtro por INICIO de palabra (startsWith)
const rowsFiltrados = computed(() => {
  return rows.value.filter(row => {
    const nameMatch = row.name.toLowerCase().startsWith(filtros.name.toLowerCase().trim())
    const emailMatch = row.email.toLowerCase().startsWith(filtros.email.toLowerCase().trim())
    const cargoMatch = row.cargo.toLowerCase().startsWith(filtros.cargo.toLowerCase().trim())
    return nameMatch && emailMatch && cargoMatch
  })
})

// Cargar preview PDF con pdf.js
const cargarPreviewPDF = async (row) => {
  // Asegúrate de que apiUrl tenga valor (definida arriba como import.meta.env.VITE_API_URL)
  if (!row.cvPath || !apiUrl) return;

  try {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) return;

    // Usamos apiUrl que ya declaraste al inicio del script
    const url = `${apiUrl}/uploads/${row.cvPath}`;

    const loadingTask = pdfjsLib.getDocument(url);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    // Esperar un pequeño tick para asegurar que el canvas existe en el DOM
    await nextTick();
    const canvas = canvasRefs[row._id];
    if (!canvas) return;

    const viewport = page.getViewport({ scale: 0.5 }); // Escala menor para miniatura
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
      canvasContext: canvas.getContext('2d'),
      viewport: viewport
    };

    await page.render(renderContext).promise;
    pdfCargado[row._id] = true;
  } catch (e) {
    console.error('Error cargando preview para:', row.name, e);
  }
}

// Cuando cambia a tarjetas, cargar previews
watch(vistaActual, async (val) => {
  if (val === 'tarjetas') {
    await nextTick()
    rowsFiltrados.value.forEach(row => cargarPreviewPDF(row))
  }
})

// También cargar cuando llegan los datos y ya está en tarjetas
watch(rows, async () => {
  if (vistaActual.value === 'tarjetas') {
    await nextTick()
    rowsFiltrados.value.forEach(row => cargarPreviewPDF(row))
  }
})

const verDetalles = (row) => {
  usuarioSeleccionado.value = row
  mostrarDetalles.value = true
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
    const dateA = new Date(a.createdAt || 0)
    const dateB = new Date(b.createdAt || 0)
    return orderDate.value === 'Más recientes' ? dateB - dateA : dateA - dateB
  })
}

const abrirPDF = (archivo) => {
  const baseUrl = import.meta.env.VITE_API_URL
  if (archivo) window.open(`${baseUrl}/uploads/${archivo}`, '_blank')
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

onMounted(async () => {
  // Cargar pdf.js dinámicamente
  if (!window['pdfjs-dist/build/pdf']) {
    await new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        window['pdfjs-dist/build/pdf'].GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        resolve()
      }
      document.head.appendChild(script)
    })
  }

  const token = localStorage.getItem('orinoco_token')
  if (token) {
    try { const decoded = jwtDecode(token); userRole.value = decoded.role } catch (e) { }
  }
  if (route.query.cargo) filtros.cargo = route.query.cargo
  cargarPostulaciones()
})
</script>

<style scoped>
/* Fondo gris que cubre toda la página sin cortes */
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

.cargo-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
}

/* Gerencia */
.cargo-gerencia {
  background: #EEF2FF;
  color: #3730A3;
  border: 1px solid #C7D2FE;
}

/* Recursos Humanos */
.cargo-rh {
  background: #FDF2F8;
  color: #9D174D;
  border: 1px solid #FBCFE8;
}

/* Finanzas */
.cargo-finanzas {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
}

/* Logística */
.cargo-logistica {
  background: #ECFDF5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

/* Administrativo */
.cargo-admin {
  background: #EFF6FF;
  color: #1D4ED8;
  border: 1px solid #BFDBFE;
}

/* Tecnología */
.cargo-tecnologia {
  background: #F3E8FF;
  color: #6B21A8;
  border: 1px solid #D8B4FE;
}

/* Legal */
.cargo-legal {
  background: #FFF7ED;
  color: #9A3412;
  border: 1px solid #FED7AA;
}

/* Default */
.cargo-default {
  background: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.orinoco-table {
  background: white;
  border-radius: 10px;
  border: 0.5px solid #e5e7eb;
}

.hover-row:hover {
  background-color: #FFFBF0 !important;
  transition: 0.2s;
}

/* Tarjeta con preview */
.cv-card {
  border-radius: 10px !important;
  border: 0.5px solid #e5e7eb !important;
  background: white;
  transition: all 0.2s;
  cursor: pointer;
  overflow: hidden;
}

.cv-card:hover {
  border-color: #DAA520 !important;
  box-shadow: 0 2px 12px rgba(218, 165, 32, 0.15) !important;
}

/* Contenedor del preview PDF */
.pdf-preview-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 8.5 / 5;
  background: #f9f9f9;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  inset: 0;
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
  .header {
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .btnVista {
    margin-top: 20px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .toolbar {
    display: grid;
    MARGIN-TOP: 8px;
    margin-bottom: 8px;
  }
}
</style>