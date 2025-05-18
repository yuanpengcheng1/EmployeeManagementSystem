// src/api/departmentApi.ts

import { service } from "@/api/request";
// 导入 AxiosPromise 类型
import type { AxiosPromise } from "axios";

// 对应后端 @RequestMapping("/department")
export const DEPARTMENT_API_PREFIX = '/department';

// --- 类型定义 (请根据后端实际实体和返回结构核对并微调) ---

// 部门类型
export interface Department {
  id: number; // Long -> number
  name: string; // String
  parentId?: number; // Long -> number (可选)
  description?: string; // String (可选)
  del?: number; // Integer -> number (逻辑删除)
  createTime?: string; // Date -> string
  updateTime?: string; // Date -> string
}

// 分页返回类型 (如果部门分页接口返回 Baomidou Page<Department>)
export interface PageResult<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
    // 可能还有其他字段：orders, optimizeCountSql, searchCount
    // orders?: any[];
    // optimizeCountSql?: boolean;
    // searchCount?: boolean;
}


// --- API 函数定义 ---

/**
 * 获取所有部门列表 (用于下拉框或树形展示的数据源)
 * 对应后端 GET /department/listDepartments
 * @returns AxiosPromise<Department[]> resolved value is Department array
 *          假设后端接口返回 CommonResult<List<Department>>，拦截器会将其解包为 List<Department> (即 Department[])
 */
export const getDepartmentList = (): AxiosPromise<Department[]> => {
  // service.get 返回 AxiosPromise<CommonResult<List<Department>>>
  // 拦截器处理后，resolved value 是 List<Department> (Department[])
  return service.get<Department[]>(`${DEPARTMENT_API_PREFIX}/listDepartments`) as AxiosPromise<Department[]>; // *** 请确保这里的 URL 与后端一致 ***
};

/**
 * 分页查询部门信息
 * 对应后端 GET /department/listDepartmentsByPage
 * @param pageNum 当前页码（默认 1）
 * @param pageSize 每页数量（默认 10）
 * @returns AxiosPromise<PageResult<Department>> resolved value is PageResult<Department>
 *          假设后端接口返回 CommonResult<Page<Department>>，拦截器会将其解包为 Page<Department>
 */
export const getDepartmentPage = (
    pageNum: number = 1,
    pageSize: number = 10,
    name: string = ''
  ): AxiosPromise<PageResult<Department>> => {
    return service.get<PageResult<Department>>(`${DEPARTMENT_API_PREFIX}/listDepartmentsByPage`, {
      params: { pageNum, pageSize, name }
    });
  };
  

/**
 * 根据部门 ID 获取部门信息
 * 对应后端 GET /department/getDepartmentById
 * ** 注意：** 你的后端 `@GetMapping("/getDepartmentById") @PathVariable Long id` 接口，路径和参数不匹配。
 * 我按照前面推测的 ** Query 参数方式 ** 来写 GET /department/getDepartmentById?id={id}。
 * 如果后端实际是路径参数 GET /department/getDepartmentById/{id}，请修改这里的 URL。
 * @param id 部门 ID
 * @returns AxiosPromise<Department> resolved value is Department
 *          假设后端接口返回 CommonResult<Department>
 */
export const getDepartmentById = (id: number): AxiosPromise<Department> => {
   return service.get<Department>(`${DEPARTMENT_API_PREFIX}/getDepartmentById`, { // *** 请确保这里的 URL 与后端一致 ***
       params: { id } // 假设是 Query 参数
   }) as AxiosPromise<Department>;
};


/**
 * 创建部门信息
 * 对应后端 POST /department/create
 * @param department 要创建的部门数据 (不包含 ID, del 等)
 * @returns AxiosPromise<boolean> resolved value is boolean
 *          假设后端接口返回 CommonResult<Boolean>
 */
export const addDepartment = (department: Omit<Department, 'id' | 'del' | 'createTime' | 'updateTime'>): AxiosPromise<boolean> => {
    return service.post<boolean>(`${DEPARTMENT_API_PREFIX}/create`, department) as AxiosPromise<boolean>; // *** 请确保这里的 URL 与后端一致 ***
};

/**
 * 更新部门信息
 * 对应后端 PUT /department/updateDepartment
 * @param department 要更新的部门数据 (包含 ID, 但不包含 del 等)
 * @returns AxiosPromise<boolean> resolved value is boolean
 *          假设后端接口返回 CommonResult<Boolean>
 */
export const updateDepartment = (department: Omit<Department, 'del' | 'createTime' | 'updateTime'>): AxiosPromise<boolean> => {
     return service.put<boolean>(`${DEPARTMENT_API_PREFIX}/updateDepartment`, department) as AxiosPromise<boolean>; // *** 请确保这里的 URL 与后端一致 ***
};


/**
 * 删除部门信息 (逻辑删除)
 * 对应后端 DELETE /department/updateDepartment/{id}
 * ** 注意：** 这个路径命名 `/updateDepartment/{id}` 非常规。
 * 我按照你之前提供的后端代码，推测后端真实接口是这个路径。
 * 请务必核对后端真实接口路径是否真的是 `/department/updateDepartment/{id}`。
 * @param id 要删除的部门 ID
 * @returns AxiosPromise<boolean> resolved value is boolean
 *          假设后端接口返回 CommonResult<Boolean>
 */
export const deleteDepartment = (id: number): AxiosPromise<boolean> => {
    // 使用 service 实例发起 DELETE 请求，将 ID 包含在 URL 路径中
    return service.delete<boolean>(`${DEPARTMENT_API_PREFIX}/updateDepartment/${id}`) as AxiosPromise<boolean>; // *** 请确保这里的 URL 与后端一致 ***
};


/**
 * 根据部门名称进行模糊查询
 * 对应后端 GET /department/listDepartmentsByName?name={name}
 * @param name 要模糊查询的部门名称
 * @returns AxiosPromise<Department[]> resolved value is Department array
 */
export const searchDepartmentsByName = (name: string): AxiosPromise<Department[]> => {
    return service.get<Department[]>(`${DEPARTMENT_API_PREFIX}/listDepartmentsByName`, { // *** 请确保这里的 URL 与后端一致 ***
        params: { name } // 作为 query 参数发送
    }) as AxiosPromise<Department[]>;
};

/**
 * 获取当前部门数量
 * 对应后端 GET /department/count
 * @returns AxiosPromise<number> resolved value is number (total count)
 */
export const getDepartmentCount = (): AxiosPromise<number> => {
    return service.get<number>(`${DEPARTMENT_API_PREFIX}/count`) as AxiosPromise<number>; // *** 请确保这里的 URL 与后端一致 ***
};

// 导出相关的类型
export type { Department, PageResult };