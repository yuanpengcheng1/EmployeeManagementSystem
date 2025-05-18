<template>
  <div class="dashboard-container" v-loading="loading">
    <!-- 仪表盘欢迎标题 (不变) -->
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-text">欢迎回来，管理员！🎉</div>
    </el-card>

    <!-- 仪表盘统计信息卡片 (不变) -->
    <div class="dashboard-cards">
      <!-- ... 员工、部门、设备统计卡片 (不变) ... -->
       <el-card class="stat-card" shadow="hover">
          <div class="stat-icon employee"> <el-icon><User /></el-icon> </div>
         <div class="stat-title">员工总数</div>
         <div class="stat-value">{{ employeeCount }}</div>
       </el-card>
       <el-card class="stat-card" shadow="hover">
          <div class="stat-icon department"> <el-icon><OfficeBuilding /></el-icon> </div>
         <div class="stat-title">部门数量</div>
         <div class="stat-value">{{ departmentCount }}</div>
       </el-card>
       <el-card class="stat-card" shadow="hover">
          <div class="stat-icon device"> <el-icon><Monitor /></el-icon> </div>
         <div class="stat-title">设备数量</div>
         <div class="stat-value">{{ deviceCount }}</div>
       </el-card>
    </div>

    <!-- 更多统计图表区域 -->
    <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
            <el-card class="chart-card" shadow="hover">
                <template #header> <div class="card-header"> <span>近一年新员工增长趋势</span> </div> </template>
                <!-- ECharts 图表容器 - 添加 ref -->
                <v-chart ref="employeeGrowthChartRef" class="chart" :option="employeeGrowthOption" autoresize />
            </el-card>
        </el-col>
        <el-col :span="12">
             <el-card class="chart-card" shadow="hover">
                <template #header> <div class="card-header"> <span>各部门员工分布</span> </div> </template>
                <!-- ECharts 图表容器 - 添加 ref -->
                <v-chart ref="departmentDistributionChartRef" class="chart" :option="departmentDistributionOption" autoresize />
            </el-card>
        </el-col>
    </el-row>

     <!-- 新增一行用于放置新的图表 -->
     <el-row :gutter="20" class="chart-row">
          <el-col :span="12">
               <el-card class="chart-card" shadow="hover">
                  <template #header> <div class="card-header"> <span>各设备类型分布</span> </div> </template>
                  <!-- ECharts 图表容器 - 添加 ref -->
                  <v-chart ref="deviceTypeDistributionChartRef" class="chart" :option="deviceTypeDistributionOption" autoresize />
              </el-card>
          </el-col>
          <el-col :span="12">
               <el-card class="chart-card" shadow="hover">
                  <template #header> <div class="card-header"> <span>员工职位分布</span> </div> </template>
                  <!-- ECharts 图表容器 - 添加 ref -->
                  <v-chart ref="employeePositionDistributionChartRef" class="chart" :option="employeePositionDistributionOption" autoresize />
              </el-card>
          </el-col>
     </el-row>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'; // 导入 nextTick
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, PieChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent
} from 'echarts/components';
import VChart from 'vue-echarts'; // 导入 VChart 组件

// 导入 Element Plus 图标 (不变)
import { User, OfficeBuilding, Monitor } from '@element-plus/icons-vue';

// 导入 API 函数
import { getEmployeeCount } from '@/api/employeeApi';
import { getDepartmentCount } from '@/api/departmentApi';
import { deviceApi } from '@/api/deviceApi';
import {
    getEmployeeGrowthData,
    getDepartmentDistributionData,
    getDeviceTypeDistributionData,
    getEmployeePositionDistributionData
} from '@/api/dashboardApi';
import type {
    EmployeeGrowthData,
    DepartmentDistributionItem,
    DeviceTypeDistributionItem,
    EmployeePositionDistributionItem
} from '@/api/dashboardApi';


// 注册 ECharts 必须的组件和图表类型 (不变)
use([
  CanvasRenderer,
  LineChart, PieChart, BarChart,
  GridComponent, TooltipComponent, TitleComponent, LegendComponent, ToolboxComponent,
  DataZoomComponent, VisualMapComponent,
]);


// --- 统计数据 (不变) ---
const employeeCount = ref(0);
const departmentCount = ref(0);
const deviceCount = ref(0);
const loading = ref(false);

// ====== 图表数据和配置 (不变) ======
const employeeGrowthOption = ref({
    title: { text: '近一年新员工增长趋势', left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
    tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: [] }, yAxis: { type: 'value', axisLabel: { formatter: '{value} 人' } },
    series: [{ name: '新增员工', type: 'line', data: [], smooth: true }]
});

const departmentDistributionOption = ref({
    title: { text: '各部门员工分布', left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' }, legend: { orient: 'vertical', left: 'left', data: [] },
    series: [{ name: '员工人数', type: 'pie', radius: '50%', center: ['60%', '60%'], data: [], emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }, label: { formatter: '{b}: {c} ({d}%)' } }]
});

const deviceTypeDistributionOption = ref({
    title: { text: '各设备类型分布', left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' }, legend: { orient: 'vertical', left: 'left', data: [] },
    series: [{ name: '设备数量', type: 'pie', radius: '50%', center: ['60%', '60%'], data: [], emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }, label: { formatter: '{b}: {c} ({d}%)' } }]
});

const employeePositionDistributionOption = ref({
    title: { text: '员工职位分布', left: 'center', textStyle: { fontSize: 14, fontWeight: 'normal' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } }, grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: [], axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { formatter: '{value} 人' } },
    series: [{ name: '员工数量', type: 'bar', data: [], itemStyle: { color: '#5470C6' }, label: { show: true, position: 'top' } }],
    dataZoom: [{ type: 'inside', start: 0, end: 100 }, { type: 'slider', show: true, start: 0, end: 100, handleSize: '3%' }]
});

// --- 新增：图表容器的 ref 变量 ---
const employeeGrowthChartRef = ref<any>(); // 员工增长图表 ref
const departmentDistributionChartRef = ref<any>(); // 部门分布图表 ref
const deviceTypeDistributionChartRef = ref<any>(); // 设备类型分布图表 ref
const employeePositionDistributionChartRef = ref<any>(); // 员工职位分布图表 ref


// ====== 数据获取函数 ======
async function fetchDashboardData() {
  loading.value = true;
  try {
    // --- 并发获取所有统计数字和图表数据 ---
    const [
      employeeCountRes, departmentCountRes, deviceCountRes,
      employeeGrowthDataRes, departmentDistributionDataRes,
      deviceTypeDistributionDataRes, employeePositionDistributionDataRes
    ] = await Promise.all([
      getEmployeeCount(), getDepartmentCount(), deviceApi.getDeviceCount(),
      getEmployeeGrowthData(), getDepartmentDistributionData(),
      getDeviceTypeDistributionData(), getEmployeePositionDistributionData(),
    ]);

    // --- 更新统计数字 (不变) ---
    employeeCount.value = employeeCountRes;
    departmentCount.value = departmentCountRes;
    deviceCount.value = deviceCountRes;

    // --- 使用 nextTick 和手动 resize 更新图表数据 ---
    nextTick(() => { // <-- 数据更新包裹在 nextTick 中
        // 更新新员工增长趋势图表
        if (employeeGrowthDataRes && Array.isArray(employeeGrowthDataRes.months) && Array.isArray(employeeGrowthDataRes.newHires)) {
            employeeGrowthOption.value.xAxis.data = employeeGrowthDataRes.months;
            employeeGrowthOption.value.series[0].data = employeeGrowthDataRes.newHires;
             employeeGrowthChartRef.value?.resize(); // <-- 手动 resize
        } else {
            console.warn('获取新员工增长趋势数据格式异常', employeeGrowthDataRes);
            employeeGrowthOption.value.xAxis.data = [];
            employeeGrowthOption.value.series[0].data = [];
        }

        // 更新各部门员工分布图表
        if (Array.isArray(departmentDistributionDataRes)) {
            departmentDistributionOption.value.legend.data = departmentDistributionDataRes.map(item => item.name);
            departmentDistributionOption.value.series[0].data = departmentDistributionDataRes;
            departmentDistributionChartRef.value?.resize(); // <-- 手动 resize
        } else {
            console.warn('获取各部门员工分布数据格式异常', departmentDistributionDataRes);
            departmentDistributionOption.value.legend.data = [];
            departmentDistributionOption.value.series[0].data = [];
        }

         // 更新各设备类型分布图表 (饼图)
         if (Array.isArray(deviceTypeDistributionDataRes)) {
            deviceTypeDistributionOption.value.legend.data = deviceTypeDistributionDataRes.map(item => item.name);
            deviceTypeDistributionOption.value.series[0].data = deviceTypeDistributionDataRes;
            deviceTypeDistributionChartRef.value?.resize(); // <-- 手动 resize
         } else {
             console.warn('获取各设备类型分布数据格式异常', deviceTypeDistributionDataRes);
             deviceTypeDistributionOption.value.legend.data = [];
             deviceTypeDistributionOption.value.series[0].data = [];
         }

         // 更新员工职位分布图表 (柱状图)
          if (Array.isArray(employeePositionDistributionDataRes)) {
             employeePositionDistributionOption.value.xAxis.data = employeePositionDistributionDataRes.map(item => item.name);
             employeePositionDistributionOption.value.series[0].data = employeePositionDistributionDataRes.map(item => item.value);
             employeePositionDistributionChartRef.value?.resize(); // <-- 手动 resize
          } else {
             console.warn('获取员工职位分布数据格式异常', employeePositionDistributionDataRes);
             employeePositionDistributionOption.value.xAxis.data = [];
             employeePositionDistributionOption.value.series[0].data = [];
          }
    }); // <-- nextTick 结束

  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    // 错误时清空所有数据
    employeeCount.value = 0; departmentCount.value = 0; deviceCount.value = 0;
    employeeGrowthOption.value.xAxis.data = []; employeeGrowthOption.value.series[0].data = [];
    departmentDistributionOption.value.legend.data = []; departmentDistributionOption.value.series[0].data = [];
    deviceTypeDistributionOption.value.legend.data = []; deviceTypeDistributionOption.value.series[0].data = [];
    employeePositionDistributionOption.value.xAxis.data = []; employeePositionDistributionOption.value.series[0].data = [];

  } finally {
    loading.value = false;
  }
}

// ====== 生命周期钩子 (不变) ======
onMounted(() => {
  fetchDashboardData();
});

</script>

<style scoped>
/* Import a modern Google Font for better typography */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Root container for the dashboard */
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%); /* Subtle gradient background */
  min-height: calc(100vh - 64px); /* Adjusted for typical header/footer */
  font-family: 'Inter', sans-serif; /* Modern, clean font */
}

/* Welcome card */
.welcome-card {
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden; /* Prevent content overflow */
}

.welcome-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.welcome-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2a44; /* Darker, professional text color */
  padding: 16px;
  text-align: center;
  background: linear-gradient(to right, #e0f7fa, #e8f0fe); /* Light gradient for warmth */
}

/* Stats cards grid */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 24px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

/* Stat icons with modern gradients and animations */
.stat-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-icon.employee {
  background: linear-gradient(45deg, #34d399, #059669); /* Green gradient */
}

.stat-icon.department {
  background: linear-gradient(45deg, #fbbf24, #d97706); /* Amber gradient */
}

.stat-icon.device {
  background: linear-gradient(45deg, #60a5fa, #2563eb); /* Blue gradient */
}

.stat-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-title {
  font-size: 15px;
  font-weight: 500;
  color: #6b7280; /* Muted gray for secondary text */
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1f2a44;
  letter-spacing: -0.5px; /* Tighten spacing for large numbers */
}

/* Chart rows */
.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb; /* Subtle divider */
}

/* Chart container */
.chart {
  height: 360px; /* Slightly taller for better chart visibility */
  width: 100%;
  padding: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .dashboard-cards {
    grid-template-columns: 1fr; /* Stack cards on smaller screens */
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 28px;
  }

  .chart {
    height: 300px; /* Reduce chart height on mobile */
  }
}

@media (max-width: 480px) {
  .welcome-text {
    font-size: 18px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .card-header {
    font-size: 16px;
  }
}
</style>