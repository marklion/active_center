<template>
  <div class="app-container">
    <el-row>
      <el-page-header @back="goBack" :content=title />
    </el-row>
    <el-row>
      <el-card class="form-card">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="比赛名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="参与范围" prop="involved_leader">
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
            <div style="margin: 15px 0;"></div>
            <el-checkbox-group v-model="form.involved_leader" @change="handleInvolvedLeaderChange">
              <el-checkbox v-for="leader in leaderList" :label="leader._id" :key="leader._id">{{leader.name}}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="下注时间" prop="bet_time_range">
            <el-date-picker
              v-model="form.bet_time_range"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00']">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="比赛时间" prop="start_time">
            <el-date-picker
              v-model="form.start_time"
              type="datetime"
              placeholder="选择日期时间">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="赛事模板" prop="template">
            <el-select v-model="form.template" placeholder="请选择">
              <el-option
                v-for="item in templateList"
                :key="item._id"
                :label="item.name || '未选择'"
                :value="item._id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <el-input
              type="textarea"
              v-model="form.comment"
              show-word-limit
              :maxlength="200"
              :autosize="{ minRows: 2, maxRows: 4}"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-row>
  </div>
</template>

<script>
  import { getList } from '@/api/template'
  import { getClubLeaders } from '@/api/account'
  import { create } from '@/api/active'

  export default {
    name: 'active_edit_view',
    data(){
      return {
        id : '',
        checkAll : false,
        isIndeterminate : true,
        templateList : [],
        leaderList : [],

        form : {
          name : '',
          involved_leader: [],
          bet_time_range : [],
          bet_start_time : '',
          bet_end_time : '',
          start_time : '',
          comment : '',
          template : '',
        },

        rules : {
          name : [{required: true, message: '请填写比赛名称', trigger: 'blur'}],
          involved_leader : [
            {type: 'array', required: true, message: '请至少选择一支参赛团队', trigger: 'blur'},
          ],
          bet_time_range : [
            {type: 'array', required: true, message: '请选择投注时间', trigger: 'blur'}
          ],
          start_time :[
            {type: 'date',  required: true, message: '请选择比赛开始时间', trigger: 'change'}
          ],
          template : [{required: true, message:'请选择本次比赛赛事模板',trigger: 'change'}]
        }
      }
    },

    computed : {
      title(){
        if(this.id){
          return '编辑比赛详情'
        }else{
          return '新建比赛'
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      let id = to.query.id
      next(vm => {
        vm.id = id;
        // if (id !== undefined) {
        //   //获取已存在user info，覆盖form
        //   getById(id).then(async resp => {
        //     vm.roleList = await roleApi.getList({club : resp.club})
        //     vm.form = resp;
        //   })
        // }
      })
    },
    async created() {
      this.templateList = await getList();
      this.leaderList = await getClubLeaders();
    },
    methods: {
      goBack(){
        this.$router.push({ path: '/active/index' })
      },
      handleCheckAllChange(val){
        this.form.involved_leader = val ? this.leaderList.map(leader => leader._id) : [];
        this.isIndeterminate = false;
      },
      handleInvolvedLeaderChange(value){
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.leaderList.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.leaderList.length;
      },
      async handleSave(){
        try{
          await this.$refs.form.validate();
        }catch(err){
          this.$message.error('请按照提示修正表单内容');
          return;
        }
        let result = await create({
          name : this.form.name,
          involved_leader : this.form.involved_leader,
          bet_start_time : this.form.bet_time_range[0],
          bet_end_time : this.form.bet_time_range[1],
          start_time : this.form.start_time,
          comment : this.form.comment,
          template : this.form.template
        });
        this.goBack();
      },
    },
  }
</script>

<style scoped>
 .form-card{
   margin-top: 20px;
   width: 600px;
 }
</style>
