import { createRouter, createWebHistory } from 'vue-router'
import DashboardContent from '@/components/DashboardContent.vue'; // 添加这一行导入仪表盘内容组件
// 假设 main.vue 也放在 components/Main 目录下，并且您想用 @/ 别名
import MainLayout from '@/components/Main/main.vue';
// 假设 EmployeeManagement.vue 放在 components/Main 目录下
import EmployeeManagementPage from '@/components/EmployeeManagement.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/Login/index.vue') 
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register/index.vue')
    },
    {
      path: '/main',
      name: 'main',
      // 使用导入的 MainLayout 组件
      component: MainLayout, // 或者使用动态导入: component: () => import('@/components/Main/main.vue'),
      children: [
        {
          path: '', 
          name: 'Dashboard',
          component: DashboardContent
        },
        {
          path: 'employees',
          name: 'employees', // 建议路由名称使用帕斯卡命名法 (PascalCase)，如 EmployeeManagement
          // 使用导入的 EmployeeManagementPage 组件
          component: EmployeeManagementPage, // 或者使用动态导入: component: () => import('@/components/Main/EmployeeManagement.vue'),
        },
        {
          path: 'departments',
          name: 'DepartmentManagement',
          component: () => import('@/components/DepartmentManagement.vue'),
        },
        {
          path: 'devices',
          name: 'DeviceManagement',
          component: () => import('@/components/DeviceManagement.vue'),
        },
        {
          path: 'settings',
          name: 'SystemSettings',
          component: () => import('@/components/SystemSettings.vue'),
        }
      ]
    }
    ,
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router