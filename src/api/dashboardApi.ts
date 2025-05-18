// src/api/dashboardApi.ts

import { service } from "@/api/request";
import type { AxiosPromise } from "axios";

// --- 类型定义 (对应后端 DashboardController 返回的数据结构) ---

// 近一年新员工增长趋势数据结构 (不变)
export interface EmployeeGrowthData {
    months: string[]; // 月份列表，例如 ["一月", "二月", ...]
    newHires: number[]; // 对应月份的新增员工数列表
}

// 各部门员工分布数据结构 (用于饼图) (不变)
export interface DepartmentDistributionItem {
    name: string; // 部门名称
    value: number; // 员工数量
}

// --- 新增设备类型分布数据结构 ---
// 对应后端 /dashboard/deviceTypeDistribution 接口返回
// 结构与 DepartmentDistributionItem 相同，但语义不同
export interface DeviceTypeDistributionItem {
    name: string; // 设备类型
    value: number; // 数量
}

// --- 新增员工职位分布数据结构 ---
// 对应后端 /dashboard/employeePositionDistribution 接口返回
export interface EmployeePositionDistributionItem {
    name: string; // 职位名称
    value: number; // 员工数量
}


// 对应后端 @RequestMapping("/dashboard")
const DASHBOARD_API_PREFIX = '/dashboard';

// --- API 函数定义 ---

// ... (getEmployeeGrowthData 和 getDepartmentDistributionData 函数 - 不变) ...
/**
 * 获取近一年新员工增长趋势数据
 * 对应后端 GET /dashboard/employeeGrowth
 */
export const getEmployeeGrowthData = (): AxiosPromise<EmployeeGrowthData> => {
  return service.get<EmployeeGrowthData>(`${DASHBOARD_API_PREFIX}/employeeGrowth`) as AxiosPromise<EmployeeGrowthData>;
};

/**
 * 获取各部门员工分布数据
 * 对应后端 GET /dashboard/departmentDistribution
 */
export const getDepartmentDistributionData = (): AxiosPromise<DepartmentDistributionItem[]> => {
  return service.get<DepartmentDistributionItem[]>(`${DASHBOARD_API_PREFIX}/departmentDistribution`) as AxiosPromise<DepartmentDistributionItem[]>;
};


/**
 * 获取各设备类型分布数据
 * 对应后端 GET /dashboard/deviceTypeDistribution
 * @returns AxiosPromise<DeviceTypeDistributionItem[]>
 */
export const getDeviceTypeDistributionData = (): AxiosPromise<DeviceTypeDistributionItem[]> => { // <-- 新增 API 函数
  return service.get<DeviceTypeDistributionItem[]>(`${DASHBOARD_API_PREFIX}/deviceTypeDistribution`) as AxiosPromise<DeviceTypeDistributionItem[]>; // *** 确保 URL 与后端一致 ***
};

/**
 * 获取员工职位分布数据
 * 对应后端 GET /dashboard/employeePositionDistribution
 * @returns AxiosPromise<EmployeePositionDistributionItem[]>
 */
export const getEmployeePositionDistributionData = (): AxiosPromise<EmployeePositionDistributionItem[]> => { // <-- 新增 API 函数
  return service.get<EmployeePositionDistributionItem[]>(`${DASHBOARD_API_PREFIX}/employeePositionDistribution`) as AxiosPromise<EmployeePositionDistributionItem[]>; // *** 确保 URL 与后端一致 ***
};


// 导出相关的类型 (新增并导出新的类型)
export type {
    EmployeeGrowthData,
    DepartmentDistributionItem,
    DeviceTypeDistributionItem,
    EmployeePositionDistributionItem // <-- 导出新的类型
};