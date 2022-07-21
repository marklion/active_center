<template>
  <div>
    <div v-if="type== 1">
      <img :src="url" class="media-ctn" :height="height">
    </div>
    <div v-else-if="type==2">
      <video class="media-ctn" :src="url" controls></video>
    </div>
    <div v-else-if="type==3">
      <el-row>
        <el-col :span="6"><img :src="thumbnail" width="100%"></el-col>
        <el-col :span="18">
          {{name}}
          <audio class="media-ctn" controls>
              <source :src="url" type="audio/mp3">
          </audio>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'media',
    props:{
      height : {type : String},
      type : {type : Number},
      url : {type : String},
      name : {type : String},
      thumbnail : {type : String}
    },
    data(){
      return {

      }
    }
  }
</script>

<style scoped>
  .media-ctn{
    width:100%
  }
</style>
