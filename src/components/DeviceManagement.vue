<template>
  <el-card class="device-card" v-loading="loading">
    <el-row :gutter="20" class="header-row">
      <!-- 设备名称搜索 -->
      <el-col :span="7">
        <el-input
          v-model="searchText"
          placeholder="请输入设备名称"
          clearable
          @input="handleSearch"
          @clear="handleSearch"
        />
      </el-col>
      <!-- 按部门筛选 -->
      <el-col :span="5">
        <el-select
          v-model="filterDepartmentId"
          placeholder="按部门筛选"
          clearable
          @change="handleFilterChange"
          style="width: 100%;"
        >
          <el-option
            v-for="dept in departmentOptionsFlat"
            :key="dept.id"
            :label="dept.name"
            :value="dept.id"
          />
        </el-select>
      </el-col>
      <!-- 按状态筛选 -->
      <el-col :span="4">
        <el-select
          v-model="filterStatus"
          placeholder="按状态筛选"
          clearable
          @change="handleFilterChange"
          style="width: 100%;"
        >
          <el-option
            v-for="status in statusOptions"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>
      </el-col>
  
      <!-- 新增设备按钮 - 这个 el-col 会被 margin-left: auto 推到最右边 -->
      <el-col :span="8" class="add-button-col">
        <el-button type="primary" @click="openAddDialog" class="add-button">
          <el-icon><Plus /></el-icon>
          新增设备
        </el-button>
      </el-col>
    </el-row>

    <!-- 设备列表表格 -->
    <el-table
      :data="devices"
      border
      stripe
      class="device-table"
      :header-cell-style="{ 'background-color': '#f5f7fa', 'font-weight': 'bold' }"
      empty-text="暂无设备数据"
    >
      <!-- 表格列根据 deviceApi.ts 中 Device 类型定义 -->
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="name" label="设备名称" min-width="120" />
      <el-table-column prop="type" label="类型" width="100" />
      <el-table-column label="所属部门" width="120">
        <template #default="scope">
          {{ findDepartmentName(scope.row.departmentId) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="description" label="描述" min-width="150" />

      <!-- 操作列 -->
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="scope">
          <el-button type="primary" link size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="confirmDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next, sizes, total"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="page"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
        :page-sizes="[5, 10, 20, 50]"
      />
    </div>

    <!-- 新增/编辑设备弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetForm" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="ID" v-if="isEdit">
          <el-input v-model="form.id" disabled />
        </el-form-item>
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入设备类型" />
        </el-form-item>
        <el-form-item label="所属部门" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择所属部门" style="width: 100%;">
            <el-option
              v-for="dept in departmentOptionsFlat"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择设备状态" style="width: 100%;">
            <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入设备描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 导入设备 API 对象和类型
import { deviceApi } from '@/api/deviceApi';
import type { Device, PageResult } from '@/api/deviceApi';

// 导入部门 API 函数和类型
import { getDepartmentList } from '@/api/departmentApi';
import type { Department } from '@/api/departmentApi';

// --- State Variables ---
const devices = ref<Device[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// --- Filter State ---
const searchText = ref('');
const filterDepartmentId = ref<number | undefined>(undefined);
const filterStatus = ref<string | undefined>(undefined);

// --- Filter & Form Select Options ---
const departmentOptionsFlat = ref<Department[]>([]);
const statusOptions = reactive([
  { label: '启用', value: '启用' },
  { label: '维修中', value: '维修中' },
  { label: '故障', value: '故障' },
  { label: '停用', value: '停用' },
]);

// --- Dialog State ---
const dialogVisible = ref(false);
const dialogTitle = ref('');
const form = reactive<Partial<Device>>({
  id: undefined,
  name: '',
  type: '',
  departmentId: undefined,
  status: '',
  description: '',
});
const formRef = ref<FormInstance>();
const isEdit = ref(false);

// --- Form Validation Rules ---
const rules: FormRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入设备类型', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change', type: 'number' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  description: [{ max: 255, message: '设备描述长度不能超过255个字符', trigger: 'blur' }],
};

// --- Data Fetching (Devices) ---
async function getData() {
  loading.value = true;
  try {
    const res = await deviceApi.getDevicePage(
      page.value,
      pageSize.value,
      searchText.value,
      filterDepartmentId.value,
      filterStatus.value
    );

    if (res && Array.isArray(res.records) && typeof res.total === 'number') {
      devices.value = res.records;
      total.value = res.total;

      const newTotalPages = Math.ceil(total.value / pageSize.value);
      if (page.value > newTotalPages && page.value > 0) {
        page.value = Math.max(1, newTotalPages);
      }
    } else {
      console.error("后端返回的设备列表数据结构异常:", res);
      devices.value = [];
      total.value = 0;
      ElMessage.error('获取设备列表数据格式异常');
    }
  } catch (error) {
    console.error('获取设备列表请求失败:', error);
    devices.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// --- Fetch Department List (for Selects) ---
async function fetchDepartmentListForSelect() {
  try {
    const departments = await getDepartmentList();
    if (Array.isArray(departments)) {
      departmentOptionsFlat.value = departments;
    } else {
      console.error("后端返回的完整部门列表数据结构异常:", departments);
      departmentOptionsFlat.value = [];
      ElMessage.warning('获取部门列表数据格式异常');
    }
  } catch (error) {
    console.error('获取部门列表失败:', error);
    departmentOptionsFlat.value = [];
  }
}

// Helper function to find department name by ID
const findDepartmentName = (id: number | undefined): string => {
  if (id === undefined || id === null) return '未知部门';
  const dept = departmentOptionsFlat.value.find(d => d.id === id);
  return dept ? dept.name : '未知部门';
};

// --- Pagination Handlers ---
function handlePageChange(newPage: number) {
  getData();
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize;
  page.value = 1;
  getData();
}

// --- Search & Filter Handlers ---
function handleSearch() {
  page.value = 1;
  getData();
}

function handleFilterChange() {
  page.value = 1;
  getData();
}

// --- Dialog & Form Operations ---
function openAddDialog() {
  dialogTitle.value = '新增设备';
  dialogVisible.value = true;
  isEdit.value = false;

  nextTick(() => {
    Object.assign(form, {
      id: undefined,
      name: '',
      type: '',
      departmentId: undefined,
      status: '',
      description: '',
    });
    formRef.value?.clearValidate();
  });
  if (departmentOptionsFlat.value.length === 0) {
    fetchDepartmentListForSelect();
  }
}

function openEditDialog(row: Device) {
  dialogTitle.value = '编辑设备';
  dialogVisible.value = true;
  isEdit.value = true;

  nextTick(() => {
    Object.assign(form, {
      id: row.id,
      name: row.name,
      type: row.type,
      departmentId: row.departmentId,
      status: row.status,
      description: row.description,
    });
    formRef.value?.clearValidate();
  });
  if (departmentOptionsFlat.value.length === 0) {
    fetchDepartmentListForSelect();
  }
}

function submitForm() {
  formRef.value?.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning('请检查表单项是否填写正确');
      return;
    }

    loading.value = true;

    const payload: Omit<Device, 'departmentName'> = {
      id: form.id,
      name: form.name!,
      type: form.type!,
      departmentId: form.departmentId!,
      status: form.status!,
      description: form.description!,
    };

    if (!isEdit.value) {
      delete payload.id;
    } else {
      if (payload.id === undefined) {
        ElMessage.error('编辑失败：缺少设备ID');
        loading.value = false;
        return;
      }
    }

    try {
      const success = isEdit.value
        ? await deviceApi.updateDevice(payload as Device)
        : await deviceApi.createDevice(payload as Omit<Device, 'id'>);

      if (success) {
        ElMessage.success(`${isEdit.value ? '更新' : '新增'}成功`);
        dialogVisible.value = false;
        if (!isEdit.value) {
          page.value = 1;
        }
        getData();
      } else {
        ElMessage.error(`${isEdit.value ? '更新' : '新增'}失败`);
      }
    } catch (error: any) {
      console.error(`${isEdit.value ? '更新' : '新增'}请求失败:`, error);
    } finally {
      loading.value = false;
    }
  });
}

// 确认删除设备
function confirmDelete(id: number | undefined) {
  if (id === undefined) {
    ElMessage.warning('设备ID无效，无法删除');
    return;
  }
  ElMessageBox.confirm('确定删除该设备吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
  })
    .then(async () => {
      loading.value = true;
      try {
        const success = await deviceApi.deleteDevice(id);
        if (success) {
          ElMessage.success('删除成功');
          getData();
        } else {
          ElMessage.error('删除失败');
        }
      } catch (error: any) {
        console.error('删除请求失败:', error);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
}

// 重置表单
function resetForm() {
  Object.assign(form, {
    id: undefined,
    name: '',
    type: '',
    departmentId: undefined,
    status: '',
    description: '',
  });
  formRef.value?.clearValidate();
}

// --- Lifecycle Hooks ---
onMounted(() => {
  getData();
  fetchDepartmentListForSelect();
});
</script>

<style scoped>
/* Import Inter font for modern typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Device card container */
.device-card {
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.device-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

/* Header row with search, filters, and button */
.header-row {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  /* Removed gap as el-col gutter should handle spacing */
  /* gap: 16px; */
}

/* Adjust col padding for better spacing using gutter */
.header-row > .el-col {
  /* Remove margin-bottom here if handled by gap */
  /* margin-bottom: 12px; */
  /* If not using gap, keep margin-bottom for wrapping */
  /* flex: 1; /* Optional: make columns flexible */
  /* min-width: 0; /* Allow columns to shrink */
}

/* Input and select styling */
:deep(.el-input__wrapper, .el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  background: #ffffff;
}

:deep(.el-input__wrapper:hover, .el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__inner, .el-select .el-input__inner) {
  font-size: 14px;
  color: #1f2a44;
}

:deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

/* Add button column styling */
.add-button-col {
  display: flex;
  justify-content: flex-end; /* Align button within the col */
  align-items: center; /* Vertically center button in col */
  margin-left: auto; /* <-- This pushes the column to the right */
  /* margin-bottom is already handled by header-row > .el-col */
}

/* Add button styling */
.add-button {
  background: linear-gradient(45deg, #34d399, #059669);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #ffffff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex-shrink: 0; /* Prevent button from shrinking */
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Table styling */
.device-table {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

:deep(.el-table__header-wrapper) {
  background: #f8fafc !important;
}

:deep(.el-table__header th) {
  background: #f8fafc !important;
  color: #1f2a44 !important;
  font-weight: 600 !important;
  font-size: 14px;
  padding: 14px 12px !important;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.el-table__cell) {
  padding: 12px !important;
  font-size: 14px;
  color: #374151;
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

:deep(.el-table__row:hover) {
  background: #e0f2fe !important;
}

:deep(.el-table__row--striped) {
  background: #f9fafb !important;
}

:deep(.el-table__empty-text) {
  font-size: 14px;
  color: #6b7280;
  padding: 24px;
}

/* Table action buttons */
:deep(.el-button--primary.is-link) {
  color: #2563eb;
  font-weight: 500;
  transition: color 0.2s ease;
}

:deep(.el-button--primary.is-link:hover) {
  color: #1e40af;
}

:deep(.el-button--danger.is-link) {
  color: #ef4444;
  font-weight: 500;
  transition: color 0.2s ease;
}

:deep(.el-button--danger.is-link:hover) {
  color: #b91c1c;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: #34d399 !important;
  color: #ffffff;
}

:deep(.el-pagination.is-background .el-pager li) {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: background 0.2s ease;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  background: #e0f2fe;
}

:deep(.el-pagination .btn-prev, .el-pagination .btn-next) {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

/* Dialog styling */
:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(to right, #f8fafc, #e0f2fe);
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

:deep(.el-input__wrapper, .el-textarea__inner, .el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

:deep(.el-input__wrapper:hover, .el-textarea__inner:hover, .el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-textarea__inner) {
  font-size: 14px;
  color: #1f2a44;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

:deep(.el-button--primary) {
  background: linear-gradient(45deg, #34d399, #059669);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-button:not(.el-button--primary)) {
  border-radius: 8px;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  transition: background 0.2s ease;
}

:deep(.el-button:not(.el-button--primary):hover) {
  background: #e0f2fe;
  color: #1f2a44;
}

/* Loading state */
:deep(.el-loading-mask) {
  background: rgba(255, 255, 255, 0.8);
}

:deep(.el-loading-spinner .path) {
  stroke: #34d399;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .device-card {
    padding: 16px;
  }

  .header-row > .el-col {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .add-button-col {
    justify-content: center; /* Center on small screens */
  }

  .add-button {
    width: 100%;
    text-align: center;
  }

  :deep(.el-table__cell) {
    font-size: 13px;
    padding: 10px !important;
  }

  :deep(.el-dialog) {
    width: 90% !important;
  }
}

@media (max-width: 480px) {
  :deep(.el-dialog__title) {
    font-size: 16px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
  }

  :deep(.el-pagination) {
    font-size: 12px;
  }
}
</style>