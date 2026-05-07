<template>
  <q-page class="bg-grey-2 flex flex-center q-pt-sm-none q-pt-md" style="min-height: calc(100vh - 50px);">
    <div class="full-width q-px-lg" style="max-width: 1400px;">
      
      <!-- CABECERA -->
      <div class="text-center q-mb-md">
        <div class="text-h5 text-primary text-bold q-ma-none">Panel Administrativo</div>
        <div class="text-caption text-grey-7">Gestión de Talento Humano | Orinoco Fueltech</div>
      </div>

      <!-- TABLERO -->
      <div class="row items-stretch bg-transparent overflow-hidden">
        
        <!-- Lado IZQUIERDO: Galería — oculto en mobile -->
        <div class="col-md-5 gt-sm">
          <q-carousel
            v-model="slide"
            transition-prev="slide-right"
            transition-next="slide-left"
            swipeable
            animated
            control-color="gold"
            arrows
            infinite
            :autoplay="5000"
            height="100%"
            class="full-height shadow-1"
            style="border-radius: 8px;" 
          >
            <q-carousel-slide :name="1" img-src="../assets/hero chatGPT.png" />
            <q-carousel-slide :name="2" img-src="../assets/teamOFT.jpeg" />
            <q-carousel-slide :name="3" img-src="../assets/local.jpeg" />
          </q-carousel>
        </div>

        <!-- Lado DERECHO: Estadísticas -->
        <div class="col-12 col-md-7 q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-bold text-secondary">Resumen de Postulaciones</div>
            
            <!-- Botón de Total -->
            <q-btn 
              unelevated 
              color="secondary" 
              class="text-white q-px-md" 
              style="border-radius: 8px;"
              to="/curriculums"
              no-caps
              :loading="loading"
            >
              <q-icon name="groups" class="q-mr-sm" color="gold" />
              Total Registrados: <span class="text-bold q-ml-xs text-white">{{ totalCvs }}</span>
            </q-btn>
          </div>

          <!-- Grid de Cargos -->
          <!-- En desktop: col-sm-3 = 4 columnas | En mobile: col-3 = 4 columnas compactas -->
          <div class="row q-col-gutter-sm">
            <div v-for="stat in stats" :key="stat.cargo" class="col-6 col-sm-3">
              <q-card flat bordered class="stat-card-mini text-center transition-hover" style="border-radius: 8px;" @click="$router.push({ path: '/curriculums', query: { cargo: stat.cargo } })">
                <q-card-section class="q-pa-sm">
                  <q-icon :name="stat.icon" size="20px" color="primary" />
                  
                  <div class="text-bold q-mt-xs" style="font-size: 1.1rem; color: #0C1E3C;">
                    {{ stat.count }}
                  </div>
                  
                  <div class="text-tiny text-grey-7 text-uppercase text-weight-medium ellipsis-2-lines">
                    {{ stat.cargo }}
                  </div>
                </q-card-section>
                <q-inner-loading :showing="loading">
                  <q-spinner-none color="primary" />
                </q-inner-loading>
              </q-card>
            </div>
          </div>

          <!-- Botón Principal -->
          <div class="row q-mt-lg">
            <q-btn 
              unelevated 
              style="background-color: #DAA520; border-radius: 8px;" 
              text-color="white" 
              label="VER TODOS LOS CURRÍCULUMS" 
              icon="visibility" 
              class="full-width text-bold" 
              no-wrap
              to="/curriculums" 
            />
          </div>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const slide = ref(1)
const totalCvs = ref(0)
const loading = ref(false)

// Estructura base de las estadísticas
const stats = ref([
  { cargo: 'Gerente de Recursos Humanos', count: 0, icon: 'manage_accounts' },
  { cargo: 'Analista de Recursos Humanos', count: 0, icon: 'person_search' }, 
  { cargo: 'Jefe de Finanzas', count: 0, icon: 'account_balance' },
  { cargo: 'Analista Contable', count: 0, icon: 'request_quote' },
  { cargo: 'Logistica', count: 0, icon: 'local_shipping' },
  { cargo: 'Asistente Administrativo', count: 0, icon: 'edit_note' }, 
  { cargo: 'Tecnología', count: 0, icon: 'terminal' },
  { cargo: 'Analista Legal', count: 0, icon: 'gavel' }
])

const cargarEstadisticas = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('orinoco_token')
    const response = await api.get('/postulaciones', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const data = response.data
    totalCvs.value = data.length

    // Procesar los conteos por cargo de forma dinámica
    stats.value = stats.value.map(stat => {
      const matchingCount = data.filter(row => 
        row.cargo.toLowerCase().trim() === stat.cargo.toLowerCase().trim()
      ).length
      
      return { ...stat, count: matchingCount }
    })

  } catch (error) {
    console.error('Error cargando datos:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar las estadísticas reales'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarEstadisticas()
})
</script>

<style scoped>
.transition-hover:hover {
  background-color: #fffdf5;
  border-color: #DAA520;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.stat-card-mini {
  background: white;
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.text-tiny {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  height: 2.4em;
}

.overflow-hidden { overflow: hidden; }

/* ── Solo mobile (< 600px) ── */
@media (max-width: 599px) {
  .stat-card-mini {
    min-height: 72px;
  }
  .text-tiny {
    font-size: 0.55rem;
    letter-spacing: 0.2px;
  }
}
</style>