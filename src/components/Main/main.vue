<template>
  <div class="employee-layout">
    <el-container style="height: 100vh;">
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <left />
      </el-aside>

      <!-- 主内容区域 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-title">员工管理系统</div>
        </el-header>

        <!-- 页面主体内容 -->
        <el-main class="main-content">
          <router-view /> 
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import left from '../left.vue'; // 侧边栏组件
</script>

<style scoped>
.sidebar {
  background-color: #2d3a4b;
  color: #fff;
  padding-top: 20px;
}

.header {
  background-color: #409EFF;
  color: white;
  display: flex;
  align-items: center;
  padding-left: 20px;
  font-size: 20px;
  font-weight: bold;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
