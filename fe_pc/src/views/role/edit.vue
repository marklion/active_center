<template>
  <div class="app-container">
    <el-row>
      <el-page-header @back="goBack" content="角色设置"/>
    </el-row>
  </div>
</template>

<script>
  export default {
    name: 'index',
    data(){
      return {
        input3 : '客户管理'
      }
    },
    methods : {
      goBack() {
        this.$router.push({ path: '/role/index' })
      },
    }
  }
</script>

<style scoped>

</style>
