<template>
  <div class="q-pa-md">
    <div class="row q-gutter-sm q-mb-md">
      <q-input 
        filled 
        v-model="filter" 
        placeholder="Buscar..." 
        class="col-grow"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        filled
        v-model="orderDate"
        :options="['Más recientes', 'Más antiguos']"
        label="Fecha"
        style="width: 200px"
        @update:model-value="aplicarOrdenFecha"
      />
    </div>

    <q-table 
      title="Curriculums" 
      :rows="rows" 
      :columns="columns" 
      row-key="_id"
      :filter="filter"
    >
      <template v-slot:body-cell-cv="props">
        <q-td :props="props">
          <q-btn flat round color="red" icon="picture_as_pdf" @click="abrirPDF(props.row.cvPath)" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'

// 💡 Las columnas ya tienen 'sortable: true' para ordenar por nombre, correo, etc.
const columns = [
  { name: 'name', label: 'Nombre completo', align: 'left', field: 'name', sortable: true },
  { name: 'email', label: 'Correo electrónico', align: 'left', field: 'email', sortable: true },
  { name: 'tel', label: 'Teléfono', align: 'center', field: 'tel' },
  { 
    name: 'ubicacion', 
    label: 'Ubicación', 
    align: 'left', 
    field: row => `${row.estado}, ${row.municipio}`, 
    sortable: true 
  },
  { name: 'cargo', label: 'Cargo al que aspira', align: 'left', field: 'cargo', sortable: true },
  { name: 'cv', label: 'Currículum (PDF)', align: 'center', field: 'cvPath' }
]

export default {
  setup() {
    const rows = ref([])
    const filter = ref('')
    const orderDate = ref('Más recientes')

    const cargarPostulaciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/postulaciones', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        rows.value = response.data;
        aplicarOrdenFecha(); // Ordenar apenas carguen los datos
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    // 💡 Lógica para ordenar por fecha (más recientes/antiguos)
    const aplicarOrdenFecha = () => {
      rows.value.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0); // Asegúrate que tu esquema tenga createdAt
        const dateB = new Date(b.createdAt || 0);
        return orderDate.value === 'Más recientes' ? dateB - dateA : dateA - dateB;
      });
    };

    const abrirPDF = (nombreArchivo) => {
      if (nombreArchivo) {
        const url = `http://localhost:3000/${nombreArchivo}`;
        window.open(url, '_blank');
      }
    };

    onMounted(cargarPostulaciones)

    return {
      columns,
      rows,
      filter,
      orderDate,
      abrirPDF,
      aplicarOrdenFecha
    }
  }
}
</script>