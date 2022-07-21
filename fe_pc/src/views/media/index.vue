<template>
  <div class="app-container">
    <el-tabs type="card" v-model="activeName" @tab-click="handleClick">

      <el-tab-pane label="悬浮菜单" name="suggestion" />
      <el-tab-pane label="图片" name="image"/>
      <el-tab-pane label="视频" name="video"/>
      <el-tab-pane label="音频" name="audio"/>

      <media-cards :mediaType=activeName :key="activeName"></media-cards>
    </el-tabs>

  </div>
</template>

<script>
  import { mediaCards } from './components'

  export default {
    components:{
      mediaCards
    },
    data() {
      return {
        activeName: 'suggestion'
      };
    },
    created(){

    },
    methods: {
      handleClick(tab, event) {
        // console.log(tab, event);
        this.activeName = tab.name;
      },
    }
  }
</script>

<style scoped>
  .tab-pane-title-ctn b{
    line-height: 40px;
  }
</style>
