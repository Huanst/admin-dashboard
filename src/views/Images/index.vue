<template>
  <div class="images-container">
    <!-- 临时简化版本，先只显示图片列表 -->
    <ImageList />
  </div>
</template>

<script setup>
import ImageList from './List.vue'
</script>

<style scoped>
.images-container {
  height: 100%;
}
</style>