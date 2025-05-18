
import { service } from "@/api/request";
import type { AxiosPromise } from "axios";

export interface Device {
  id?: number;
  name: string;
  type: string;
  departmentId: number;
  status: string;
  description: string;
}

// 分页返回结构体
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}


const DEVICE_API_PREFIX = "/device";

export const deviceApi = {
  // ✅ 分页+条件查询（支持name/departmentId/status）
  getDevicePage(
    pageNum: number = 1,
    pageSize: number = 10,
    name?: string,
    departmentId?: number,
    status?: string
  ): AxiosPromise<PageResult<Device>> {
    return service.get(`${DEVICE_API_PREFIX}/list/page/condition`, {
      params: { pageNum, pageSize, name, departmentId, status }
    });
  },

  // ✅ 新建设备
  createDevice(device: Device): AxiosPromise<boolean> {
    return service.post(`${DEVICE_API_PREFIX}/create`, device);
  },

  // ✅ 更新设备
  updateDevice(device: Device): AxiosPromise<boolean> {
    return service.put(`${DEVICE_API_PREFIX}/update`, device);
  },

  // ✅ 删除设备
  deleteDevice(id: number): AxiosPromise<boolean> {
    return service.delete(`${DEVICE_API_PREFIX}/delete/${id}`);
  },

  // ✅ 获取单个设备
  getDeviceById(id: number): AxiosPromise<Device> {
    return service.get(`${DEVICE_API_PREFIX}/get/${id}`);
  },

  // ✅ 获取所有设备
  listAllDevices(): AxiosPromise<Device[]> {
    return service.get(`${DEVICE_API_PREFIX}/list`);
  },

  // ✅ 根据名称模糊搜索（不分页）
  searchDevicesByName(name: string): AxiosPromise<Device[]> {
    return service.get(`${DEVICE_API_PREFIX}/list/name`, { params: { name } });
  },

  // ✅ 根据类型精确查找
  searchDevicesByType(type: string): AxiosPromise<Device[]> {
    return service.get(`${DEVICE_API_PREFIX}/list/type`, { params: { type } });
  },

  // ✅ 统计
  getDeviceCount(): AxiosPromise<number>{
    return service.get<number>(`${DEVICE_API_PREFIX}/count`); // *** 请确保这里的 URL (/count) 与后端一致 ***
  }
};
