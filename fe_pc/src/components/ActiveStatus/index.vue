<template>
  <el-button size="mini" round
             :type="getActiveStatus().type">
    {{getActiveStatus().text}}
  </el-button>
</template>

<script>
export default {
  name: "activeStatus",

  props:{
    active : {type : Object}
  },

  methods: {
    getActiveStatus(){
      let result = {type : 'success', text: ''}
      let now = new Date().toISOString();
      if(this.active.status > 0){
        result.type = 'danger'
        result.text = '已停止'
      }else if(now >= this.active.bet_start_time && now <= this.active.bet_end_time){
        result.type = 'success'
        result.text = '报名中'
      }else if(now < this.active.bet_start_time){
        result.type = 'warning'
        result.text = '未开启'
      }else if(now > this.active.bet_end_time){
        result.type = 'danger'
        result.text = '已截止'
      }else{
        result.type = 'default'
        result.text = '未知'
      }
      return result;
    }
  }
}
</script>

<style scoped>

</style>
