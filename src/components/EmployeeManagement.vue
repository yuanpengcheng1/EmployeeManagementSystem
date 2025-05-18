<template>
  <el-card class="employee-card" v-loading="loading">
    <el-row justify="space-between" align="middle" class="header-row">
      <el-input
        v-model="searchText"
        placeholder="请输入员工姓名"
        clearable
        class="search-input"
        @input="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="openAddDialog" class="add-button">
        <el-icon><Plus /></el-icon>
        新增员工
      </el-button>
    </el-row>

    <el-table
      :data="employees"
      border
      stripe
      class="employee-table"
      :header-cell-style="{ 'background-color': '#f5f7fa', 'font-weight': 'bold' }"
      empty-text="暂无员工数据"
    >
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column prop="name" label="姓名" width="120" />
      <!-- Display Department Name -->
      <!-- Assumes employee data returned by getEmployeePage includes departmentName -->
      <!-- If not, uncomment the find logic below and remove prop="departmentName" if it's not there -->
      <el-table-column prop="departmentName" label="部门" width="120">
         <template #default="scope">
             {{ departmentOptions.find(d => d.id === scope.row.departmentId)?.name || '未知' }}
         </template> 
      </el-table-column>
      <el-table-column prop="position" label="职位" width="160" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="hireDate" label="入职日期" width="120" />
      <el-table-column prop="phone" label="电话" width="120" />


      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="scope">
          <el-button type="primary" link size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="confirmDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @closed="resetForm" append-to-body>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="ID" v-if="isEdit">
             <el-input v-model="form.id" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入员工姓名" />
        </el-form-item>
        <!-- Department Select -->
        <el-form-item label="部门" prop="departmentId">
          <el-select v-model="form.departmentId" placeholder="请选择部门" style="width: 100%;">
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="form.position" placeholder="请输入员工职位" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入员工邮箱" />
        </el-form-item>
         <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker
                  v-model="form.hireDate"
                  type="date"
                  placeholder="选择入职日期"
                  style="width: 100%;"
                  value-format="YYYY-MM-DD"
              ></el-date-picker>
          </el-form-item>
          <el-form-item label="电话" prop="phone">
               <el-input v-model="form.phone" placeholder="请输入员工电话" />
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
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

// 导入部门 API 函数和类型
import { getDepartmentList } from '@/api/departmentApi' // <-- 导入 getDepartmentList
// Import employee API functions
import {
  getEmployeePage,
  addEmployee as addEmployeeApi,
  updateEmployee as updateEmployeeApi,
  deleteEmployee as deleteEmployeeApi,
} from '@/api/employeeApi';

// Define types used in this component
// Interface for the flattened department data used in el-select options
// 与后端 Department 实体结构一致，因为后端返回的就是扁平列表
// 如果需要，可以添加其他字段，如 del, createTime, updateTime 等，但对于下拉框只需要 id 和 name
interface DepartmentOption {
    id: number;
    name: string;
    // parentId?: number; // 根据后端返回的结构，可以加上
    // description?: string;
}


// Interface for Employee data (不变)
interface Employee {
    id?: number;
    name: string;
    position: string;
    email: string;
    hireDate: string | null;
    phone: string;
    departmentId?: number;
    departmentName?: string; // Assuming backend returns this for table display
}


// --- State Variables ---
const employees = ref<Employee[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(5);
const searchText = ref(''); // <-- 员工姓名搜索
const loading = ref(false);
// const departmentTree = ref<Department[]>([]) // <-- 删除这个不需要的变量

// --- 移除硬编码部门数据和扁平化函数 ---
// const rawDepartmentData = [...] // 删除
// function flattenDepartments(...) // 删除


// --- Department Options State (Flattened) ---
// 这个 ref 将存储从 API 获取的所有部门列表，用于员工表单中的部门下拉框
// 类型改为 DepartmentOption[] 或直接 Department[] (如果后端返回结构一致)
const departmentOptions = ref<DepartmentOption[]>([]); // <-- 使用这个作为下拉框数据源


// --- Helper function to find department name by ID ---
// Requires departmentOptions to be populated by fetchDepartmentListForSelect
const findDepartmentName = (id: number | undefined): string => {
     if (id === undefined || id === null) return '未知部门'; // 处理 undefined 或 null
     // 如果后端返回的 departmentId 可能是 0 表示顶级，这里也需要处理，但员工通常有所属部门
     // if (id === 0) return '顶级部门'; // 如果员工 departmentId 可以为 0
     const dept = departmentOptions.value.find(d => d.id === id);
     return dept ? dept.name : '未知部门';
};


// --- Dialog State (不变) ---
const dialogVisible = ref(false);
const dialogTitle = ref('');
const form = reactive<Employee>({
    id: undefined, name: '', position: '', email: '', hireDate: '', phone: '', departmentId: undefined, // Add department ID to form state
});
const formRef = ref<FormInstance>();
const isEdit = ref(false);

// --- Form Validation Rules (不变) ---
const rules: FormRules = {
  name: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入员工职位', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入员工邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式错误', trigger: ['blur', 'change'] }
  ],
   hireDate: [{ required: true, message: '请选择入职日期', trigger: 'change' }],
   phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }],
   departmentId: [{ required: true, message: '请选择部门', trigger: 'change', type: 'number' }],
};

// --- Data Fetching (Employees) ---
async function getData() {
  loading.value = true;
  try {
    // Call API to get employee page with search text
    // ** 确保 getEmployeePage 支持 name 参数，并且后端接口 /employee/page 也支持 **
    const res = await getEmployeePage(page.value, pageSize.value, searchText.value); // <-- 传递 searchText

    // Process API response
    if (res && Array.isArray(res.records) && typeof res.total === 'number') {
      employees.value = res.records;
      total.value = res.total;

      // Page adjustment logic if current page is empty after filter/delete
      const newTotalPages = Math.ceil(total.value / pageSize.value);
       if (page.value > newTotalPages && page.value > 0) {
           page.value = Math.max(1, newTotalPages);
           // If page changed, getData will be called again via @current-change
       }

    } else {
      console.error("后端返回的员工列表数据结构异常:", res);
      employees.value = [];
      total.value = 0;
      ElMessage.error('获取员工列表数据格式异常');
    }
  } catch (error) {
    console.error('获取员工列表请求失败:', error);
    ElMessage.error('获取员工列表失败，请稍后再试');
    employees.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

// --- Fetch Department List (for Department Select) ---
// *** 新增或修改这个函数来调用 API 获取部门列表 ***
async function fetchDepartmentListForSelect() {
    try {
        // 调用获取所有部门的 API (getDepartmentList)
        const departments = await getDepartmentList(); // <-- 调用 getDepartmentList API
        if (Array.isArray(departments)) {
            // 后端返回的就是扁平列表，直接赋值
            // 确保 DepartmentOption 接口与后端返回的部门对象结构兼容 (至少包含 id 和 name)
            departmentOptions.value = departments as DepartmentOption[];
             console.log('获取部门列表成功:', departmentOptions.value); // 打印查看数据
        } else {
             console.error("后端返回的部门列表数据结构异常:", departments);
             departmentOptions.value = [];
             ElMessage.warning('获取部门列表数据格式异常');
        }
    } catch (error) {
        console.error('获取部门列表失败:', error);
        ElMessage.error('获取部门列表失败，请稍后再试');
        departmentOptions.value = [];
    }
}


// --- Pagination Handlers (不变) ---
function handlePageChange(newPage: number) {
    page.value = newPage;
    getData();
}

function handleSizeChange(newSize: number) {
    pageSize.value = newSize;
    page.value = 1;
    getData();
}

// --- Search Handler ---
// Triggered on input and clear. Resets page to 1 and fetches data.
function handleSearch() {
  page.value = 1; // Start from the first page for search results
  getData(); // Call getData to refresh employee list with search text
}

// --- Dialog & Form Operations ---
function openAddDialog() {
  dialogTitle.value = '新增员工';
  dialogVisible.value = true;
  isEdit.value = false;

  // Reset form data and clear validation *after* dialog is shown
  nextTick(() => {
     Object.assign(form, {
        id: undefined, name: '', position: '', email: '', hireDate: '', phone: '',
        departmentId: undefined, // Reset department ID
     });
     formRef.value?.clearValidate();
  });
   // 确保部门列表已加载，如果没加载就去获取
   if (departmentOptions.value.length === 0) {
       fetchDepartmentListForSelect();
   }
}


function openEditDialog(row: Employee) {
  dialogTitle.value = '编辑员工';
  dialogVisible.value = true;
  isEdit.value = true;

  // Populate form with row data
  nextTick(() => { // Use nextTick here too for safety before setting data & clearing validation
      Object.assign(form, {
         id: row.id, name: row.name, position: row.position, email: row.email, hireDate: row.hireDate, phone: row.phone,
         departmentId: row.departmentId, // Assign department ID from row
      });
      formRef.value?.clearValidate();
  });
   // 确保部门列表已加载，如果没加载就去获取
   if (departmentOptions.value.length === 0) {
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

    // Build payload based on form data
    // Omit departmentName as it's for display only
    const payload: Omit<Employee, 'departmentName'> = {
         id: form.id, name: form.name!, position: form.position!, email: form.email!,
         hireDate: form.hireDate, phone: form.phone!,
         departmentId: form.departmentId, // Include departmentId
    };

    // If adding, remove id from payload
    if (!isEdit.value) {
        delete payload.id;
    } else {
        // If editing, id must be present
        if (payload.id === undefined) {
             ElMessage.error('编辑失败：缺少员工ID');
             loading.value = false;
             return;
         }
    }


    try {
      // Call the appropriate API function
      const success = isEdit.value
        ? await updateEmployeeApi(payload as Employee) // Update needs ID
        : await addEmployeeApi(payload as Omit<Employee, 'id'>); // Add doesn't need ID

      // API success handling
      // Assuming API functions return boolean true on success and throw on error/business failure
      if (success) {
        ElMessage.success(`${isEdit.value ? '更新' : '新增'}成功`);
        dialogVisible.value = false; // Close dialog
         if (!isEdit.value) {
            page.value = 1; // Go to first page after adding
         }
        getData(); // Refresh employee list
        // Optionally refetch department list if adding/editing employees affects department names/existence
        // fetchDepartmentListForSelect(); // Usually not necessary here
      } else {
           // This branch might be hit if backend returns code 200 but data is false
           ElMessage.error(`${isEdit.value ? '更新' : '新增'}失败`);
      }

    } catch (error: any) {
      console.error(`${isEdit.value ? '更新' : '新增'}请求失败:`, error);
      // Assuming interceptor shows detailed error message
      // ElMessage.error(`提交失败: ${error.message || '请求错误'}`);
    } finally {
      loading.value = false;
    }
  });
}


function confirmDelete(id: number | undefined) {
  if (id === undefined) {
      ElMessage.warning('员工ID无效，无法删除');
      return;
  }
  ElMessageBox.confirm('确定删除该员工吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  })
    .then(async () => {
        loading.value = true;
        try {
            // Call delete API
            const success = await deleteEmployeeApi(id);
             if (success) {
                 ElMessage.success('删除成功');
                 getData(); // Refresh employee list
             } else {
                 ElMessage.error('删除失败');
             }

        } catch (error: any) {
             console.error('删除请求失败:', error);
             // Assuming interceptor shows detailed error message
             // ElMessage.error(`删除失败: ${error.message || '请求错误'}`);
        } finally {
             loading.value = false;
        }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
}

// Reset form and validation when dialog closes
function resetForm() {
    Object.assign(form, {
       id: undefined, name: '', position: '', email: '', hireDate: '', phone: '',
       departmentId: undefined, // Reset department ID
    });
    formRef.value?.clearValidate();
}

// --- Lifecycle Hooks ---
onMounted(() => {
  // *** 重要：先获取部门列表，再获取员工列表（如果需要部门名称在员工列表加载时就显示） ***
  // 如果部门列表加载失败不影响员工列表显示，可以并行获取
  fetchDepartmentListForSelect().then(() => { // 获取部门列表成功后
      getData(); // 获取员工列表
  }).catch(() => {
      // 即使部门列表获取失败，也尝试加载员工列表
      getData();
  });
   // 或者直接并行获取，如果员工表格不依赖部门列表加载完成
   // fetchDepartmentListForSelect();
   // getData();
});
</script>

<style scoped>
/* Import Inter font for modern typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Employee card container */
.employee-card {
  padding: 24px;
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
  font-family: 'Inter', sans-serif;
}

.employee-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

/* Header row with search and button */
.header-row {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

/* Search input */
.search-input {
  max-width: 280px;
  margin-bottom: 12px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
  background: #ffffff;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__inner) {
  font-size: 14px;
  color: #1f2a44;
}

:deep(.el-input__inner::placeholder) {
  color: #9ca3af;
}

/* Add button */
.add-button {
  background: linear-gradient(45deg, #34d399, #059669);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #ffffff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Table styling */
.employee-table {
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

:deep(.el-input__wrapper, .el-textarea__inner, .el-select .el-input__wrapper, .el-date-editor.el-input) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

:deep(.el-input__wrapper:hover, .el-textarea__inner:hover, .el-select .el-input__wrapper:hover, .el-date-editor.el-input:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-textarea__inner, .el-date-editor .el-input__inner) {
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
  stroke: #34d399; /* Green spinner */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .employee-card {
    padding: 16px;
  }

  .search-input {
    max-width: 100%;
  }

  .header-row {
    flex-direction: column;
    align-items: stretch;
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