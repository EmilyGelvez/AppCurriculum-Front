<template>
  <div class="q-pa-md">
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input dense filled v-model="filtros.username" placeholder="Filtrar por usuario">
          <template v-slot:append><q-icon name="person" /></template>
        </q-input>
      </div>

      <div class="col-12 col-md-4">
        <q-select 
          dense filled 
          v-model="filtros.role" 
          :options="['Todos', 'superadmin', 'admin', 'viewer']" 
          label="Filtrar por Rol" 
        />
      </div>

      <div class="col-12 col-md-4">
        <q-select 
          dense filled 
          v-model="ordenFecha" 
          :options="['Más recientes', 'Más antiguos']" 
          label="Ordenar por fecha"
          @update:model-value="aplicarOrden"
        />
      </div>
    </div>

    <div v-if="userRole === 'superadmin' || userRole === 'admin'" class="row justify-end q-mb-md">
      <q-btn color="primary" icon="person_add" label="Nuevo Usuario" @click="abrirModal" />
    </div>

    <q-table
      title="Gestión de Usuarios de Orinoco Fueltech"
      :rows="usuariosFiltradosYOrdenados"
      :columns="columns"
      row-key="_id"
      flat bordered
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn
            v-if="puedeEliminar(props.row)"
            flat round color="negative" icon="delete"
            @click="confirmarEliminar(props.row)"
          >
            <q-tooltip>Eliminar Usuario</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="mostrarModal">
      <q-card style="min-width: 350px">
        <q-card-section><div class="text-h6">Registrar Nuevo Acceso</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="nuevoUsuario.username" label="Nombre de usuario" filled dense />
          <q-input v-model="nuevoUsuario.password" label="Contraseña" type="password" filled dense />
          <q-select v-model="nuevoUsuario.role" :options="opcionesRoles" label="Asignar Rol" filled dense />
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar Usuario" @click="crearUsuario" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { api } from 'src/boot/axios';
import { useQuasar } from 'quasar';
import { jwtDecode } from 'jwt-decode';

const $q = useQuasar();
const usuarios = ref([]);
const userRole = ref('');
const userId = ref('');
const mostrarModal = ref(false);
const loading = ref(false);
const ordenFecha = ref('Más recientes'); // 👈 Cambiado a fecha

const filtros = reactive({
  username: '',
  role: 'Todos'
});

const nuevoUsuario = ref({ username: '', password: '', role: 'viewer' });

const columns = [
  { name: 'username', label: 'Usuario', field: 'username', align: 'left', sortable: true },
  { name: 'role', label: 'Rol', field: 'role', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'center' }
];

const cargarUsuarios = async () => {
  const token = localStorage.getItem('orinoco_token');
  if (!token) return;
  loading.value = true;
  try {
    const res = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
    usuarios.value = res.data;
    aplicarOrden(); // 👈 Ordenar al cargar
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Error de sincronización' });
  } finally {
    loading.value = false;
  }
};

const usuariosFiltradosYOrdenados = computed(() => {
  let resultado = [];
  if (userRole.value === 'superadmin') resultado = [...usuarios.value];
  else if (userRole.value === 'admin') {
    resultado = usuarios.value.filter(u => u.role === 'admin' || u.role === 'viewer');
  }

  return resultado.filter(u => {
    const coincideNombre = u.username.toLowerCase().startsWith(filtros.username.toLowerCase().trim());
    const coincideRol = filtros.role === 'Todos' || u.role === filtros.role;
    return coincideNombre && coincideRol;
  });
});

// 💡 Lógica de orden por fecha de creación (createdAt)
const aplicarOrden = () => {
  usuarios.value.sort((a, b) => {
    const fechaA = new Date(a.createdAt || 0);
    const fechaB = new Date(b.createdAt || 0);
    return ordenFecha.value === 'Más recientes' ? fechaB - fechaA : fechaA - fechaB;
  });
};

const crearUsuario = async () => {
  try {
    const token = localStorage.getItem('orinoco_token');
    await api.post('/users/register', nuevoUsuario.value, { headers: { Authorization: `Bearer ${token}` } });
    $q.notify({ color: 'positive', message: 'Usuario creado' });
    mostrarModal.value = false;
    cargarUsuarios();
  } catch (e) {
    $q.notify({ color: 'negative', message: e.response?.data?.message || 'Error al crear' });
  }
};

const confirmarEliminar = (user) => {
  $q.dialog({
    title: 'Eliminar',
    message: `¿Borrar a ${user.username}?`,
    cancel: true, persistent: true
  }).onOk(async () => {
    try {
      const token = localStorage.getItem('orinoco_token');
      await api.delete(`/users/${user._id}`, { headers: { Authorization: `Bearer ${token}` } });
      $q.notify({ color: 'positive', message: 'Eliminado' });
      cargarUsuarios();
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Error de permisos' });
    }
  });
};

const opcionesRoles = computed(() => {
  if (userRole.value === 'superadmin') return ['superadmin', 'admin', 'viewer'];
  return ['viewer'];
});

const puedeEliminar = (targetUser) => {
  if (userRole.value === 'superadmin') return targetUser._id !== userId.value;
  if (userRole.value === 'admin') return targetUser.role === 'viewer';
  return false;
};

const abrirModal = () => {
  nuevoUsuario.value = { username: '', password: '', role: 'viewer' };
  mostrarModal.value = true;
};

onMounted(() => {
  const token = localStorage.getItem('orinoco_token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole.value = decoded.role;
      userId.value = decoded.sub;
      if (userRole.value === 'superadmin' || userRole.value === 'admin') cargarUsuarios();
    } catch (error) { console.error('Error token', error); }
  }
});
</script>