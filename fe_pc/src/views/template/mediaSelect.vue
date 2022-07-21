<template>
  <div style="display: inline-block">
    <el-link type="primary" @click="visible = true">{{display}}</el-link>
    <el-dialog
      title="选择媒体文件"
      :visible.sync="visible"
      width="60%">

      <el-tabs type="card" v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane v-for="item in tabs" :label="item.label" :name="item.name"/>
        <media-cards :mediaType=activeName :key=activeName @confirm="handleMediaSelect"></media-cards>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import mediaCards from './mediaCards'

  export default {
    name: 'mediaSelect',

    components : {
        mediaCards
    },

    props : {
      display : {
        type : String,
      },
      tabs : {
        type : Array,
      }
    },

    data(){
      return {
        visible : false,
        activeName : this.tabs[0].name,
        media : null
      }
    },

    methods : {
      handleTabClick(tab){
        this.activeName = tab.name;
      },
      handleMediaSelect(file){
        this.media = file;
      },
      handleConfirm(){
        this.visible = false;
        this.$emit('confirm', this.media);
      }
    }
  }
</script>

<style scoped>

</style>
