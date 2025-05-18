import { service } from "@/api/request"; // 确保路径正确引入你的 Axios 实例
import type { AxiosPromise } from "axios";
// 假设你的 types.ts 文件中定义了 Department 接口
// import type { Department } from "./types"; // 如果 Department 在 types.ts 中

// 员工类型（根据后端字段和前端需求更新）
// 添加了 departmentId 和 departmentName 字段，与 Vue 组件中的 Employee 接口保持一致
export interface Employee {
  id?: number; // 可选，创建时没有
  name: string;
  gender: string;
  age: number;
  position: string;
  // 注意：后端字段如果是 departmentId (number 类型)，
  // 这里应该用 departmentId?: number;
  // 如果后端返回的是 department name (string 类型)，
  // 并且你在表格中显示的是这个 name，则需要 departmentName?: string;
  // 根据你在 Vue 组件中的 Employee 接口，我们使用 departmentId 和 departmentName
  departmentId?: number;
  departmentName?: string; // 如果后端分页接口返回部门名称，用于表格显示

  phone: string;
  email: string;

  // 如果后端 Employee 实体中还有其他字段，例如创建时间、更新时间等，也应在此添加
  // createTime?: string; // 假设是字符串格式
  // updateTime?: string;
}

// 分页返回类型（与后端 Baomidou Page 结构对应）
export interface PageResult<T> {
  records: T[]; // 数据列表
  total: number; // 总记录数
  size: number; // 每页大小
  current: number; // 当前页码
  pages: number; // 总页数
  // 添加其他可能的字段，如 orders, optimizeCountSql 等，如果你的后端返回了这些
  // orders?: any[];
  // optimizeCountSql?: boolean;
  // searchCount?: boolean;
}

// 创建员工
// 后端接收 Employee 实体，可能不包含 ID
export function addEmployee(data: Omit<Employee, 'id' | 'departmentName'>): AxiosPromise<boolean> {
  // Omit<Employee, 'id' | 'departmentName'> 表示 data 是 Employee 类型，但移除了 id 和 departmentName 字段
  // 因为 departmentName 是前端用于显示的，通常不需要传给后端创建接口
  // 并且创建时 ID 是由后端生成的
  return service.post("/employee/add", data);
}

// 更新员工
// 后端接收 Employee 实体，通常包含 ID
export function updateEmployee(data: Omit<Employee, 'departmentName'>): AxiosPromise<boolean> {
   // Omit<Employee, 'departmentName'> 表示 data 是 Employee 类型，移除了 departmentName 字段
   // 因为 departmentName 是前端用于显示的，通常不需要传给后端更新接口
  return service.put("/employee/update", data);
}

// 删除员工
// 后端删除接口通常只接收 ID
export function deleteEmployee(id: number): AxiosPromise<boolean> {
  return service.delete(`/employee/delete/${id}`); // 确保这里的 URL 和后端 @DeleteMapping 路径一致
}

// 查询单个员工
export function getEmployeeById(id: number): AxiosPromise<Employee> {
  return service.get(`/employee/${id}`); // 确保这里的 URL 和后端 @GetMapping 路径一致
}

// 获取所有员工列表（不分页）- 用于特殊场景，如导出所有数据
export function getEmployeeList(): AxiosPromise<Employee[]> {
  return service.get("/employee/list"); // 确保这里的 URL 和后端 @GetMapping 路径一致
}

// ** 修改这里：分页查询员工，支持按姓名模糊搜索 **
// 这个函数是 Vue 组件中 getData 调用的
export function getEmployeePage(
  pageNum = 1,
  pageSize = 10,
  name?: string // <--- 添加一个可选的 name 参数
): AxiosPromise<PageResult<Employee>> {

  const params: { pageNum: number; pageSize: number; name?: string } = {
    pageNum,
    pageSize,
  };

  if (name && name.trim() !== '') {
    params.name = name.trim(); // 发送前可以去除首尾空格
  }

  // 使用你的 service 实例发起 GET 请求
  // *** 请确保这里的 URL "/employee/page" 是你后端支持姓名模糊搜索的分页接口地址 ***
  // *** 并且这个接口能够接收一个名为 "name" 的查询参数 ***
  return service.get<PageResult<Employee>>("/employee/page", { // <--- 确保这个 URL 正确
    params // 将包含 pageNum, pageSize 和可选 name 的参数对象传递给后端
  });
}


// 按姓名模糊查询 (如果这个接口仅用于非分页搜索，且后端有这样的接口，可以保留；否则通常不需要这个单独的函数)
// 在你的场景下，getData 已经将搜索逻辑集成到了分页查询中，所以这个函数可能不再需要被直接调用。
// 它的后端接口 "/employee/search/name" 可能是一个独立的不带分页的搜索接口。
/*
export function searchEmployeeByName(name: string): AxiosPromise<Employee[]> {
  return service.get("/employee/search/name", {
    params: { name }
  });
}
*/

// 按职位查询 (类似姓名查询，如果后端有单独的不带分页的职位搜索接口，可以保留)
/*
export function searchEmployeeByPosition(position: string): AxiosPromise<Employee[]> {
  return service.get("/employee/search/position", {
    params: { position }
  });
}
*/

// 查询员工总数
export function getEmployeeCount(): AxiosPromise<number> {
  return service.get("/employee/count"); // 确保这里的 URL 和后端 @GetMapping 路径一致
}

// 导出相关的类型
export type { Employee, PageResult };