<template>
  <div class="sidebar">
    <div class="logo">侧边栏</div>
    <el-menu
      :default-active="$route.path"
      router
      class="menu"
      background-color="transparent"
      text-color="#aeb3c3"
      active-text-color="#ffd04b"
      :collapse="false"
    >
      <!-- 添加主页菜单项 -->
      <el-menu-item index="/main" class="menu-item">
        <el-icon class="menu-icon"><HomeFilled /></el-icon>
        <span class="menu-text">主页</span>
      </el-menu-item>

      <!-- 现有的员工管理菜单项 -->
      <el-menu-item index="/main/employees" class="menu-item">
        <el-icon class="menu-icon"><User /></el-icon>
        <span class="menu-text">员工管理</span>
      </el-menu-item>
      <el-menu-item index="/main/departments" class="menu-item">
        <el-icon class="menu-icon"><OfficeBuilding /></el-icon>
        <span class="menu-text">部门管理</span>
      </el-menu-item>
      <el-menu-item index="/main/devices" class="menu-item">
        <el-icon class="menu-icon"><Monitor /></el-icon>
        <span class="menu-text">设备管理</span>
      </el-menu-item>
      <el-menu-item index="/main/settings" class="menu-item">
        <el-icon class="menu-icon"><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
// 导入 Element Plus 图标
import { User, Setting, OfficeBuilding, HomeFilled, Monitor } from '@element-plus/icons-vue'
</script>

<style scoped>

.sidebar {
  width: 220px;
  /* height: 100vh; 如果需要固定高度，请取消注释 */
  background: linear-gradient(135deg, #2d3a4b 0%, #1f2a38 100%);
  padding: 20px 0;
  box-shadow: 3px 0 15px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.logo {
  font-family: 'Arial', sans-serif;
  font-size: 22px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.menu {
  border-right: none;
}

.menu-item {
  height: 50px;
  line-height: 50px;
  border-radius: 10px;
  margin: 6px 15px;
  padding: 0 15px !important;
  transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #fff;
   /* transform: translateX(3px); */
}

.menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffd04b;
  font-weight: bold;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(to bottom, #409EFF, #66b1ff);
    border-radius: 0 4px 4px 0;
    transition: background 0.3s ease;
  }
}

.menu-icon {
  margin-right: 10px;
}



.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

</style>