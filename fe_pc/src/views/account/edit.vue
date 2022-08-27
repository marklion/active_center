<template>
  <div class="app-container">
    <el-row>
      <el-page-header @back="goBack" :content=title />
    </el-row>
    <el-row>
      <el-card class="form-card">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="账号" prop="account">
            <el-input v-model="form.account"></el-input>
          </el-form-item>

          <div v-if="!id">
            <el-form-item label="密码" prop="pwd">
              <el-input type="password" v-model="form.pwd"></el-input>
            </el-form-item>
            <el-form-item label="密码确认" prop="pwd2">
              <el-input type="password" v-model="form.pwd2"></el-input>
            </el-form-item>
          </div>

          <el-form-item label="账号名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="form.mobile"></el-input>
          </el-form-item>
          <el-form-item label="归属俱乐部" prop="club">
            <el-select v-model="form.club" placeholder="请选择" @change="getVisibleRoles">
              <el-option
                v-for="item in clubList"
                :key="item._id"
                :label="item.name || '无归属'"
                :value="item._id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择">
              <el-option
                v-for="item in roleList"
                :key="item._id"
                :label="item.name"
                :value="item._id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注" prop="comment">
            <el-input v-model="form.comment"></el-input>
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
  import { add, getById } from '@/api/account'
  import * as roleApi from '@/api/role'
  import * as clubApi from '@/api/club'

  export default {
    name: 'index',
    data(){
      return {
        id : '',
        clubList : [],
        roleList : [],

        form : {
          account : '',
          pwd : '',
          pwd2 : '',
          name : '',
          club : '',
          role : '',
          mobile : '',
          comment : ''
        },

        rules : {
          account : [{required: true, message: '请填写账号', trigger: 'blur'}],
          pwd : [
            {required: true, message: '请填写密码', trigger: 'blur'},
            {min: 6, message: '密码长度不少于6位', trigger: 'blur'}
            ],
          pwd2 : [{required: true, message: '请再次确认密码', trigger: 'blur'}],
          name :[{required: true, message: '请填写账号名称', trigger: 'blur'}],
          mobile :[
            {required: true, message: '请填写电话号码', trigger: 'blur'},
            {pattern : /^[0-9]*$/, message: '联系电话格式不正确', trigger:'blur'}],
          contact : {
            name : [{required: true, message: '请填写联系人姓名', trigger: 'blur'}],
            email : [
              {required: true, message: '请填写联系人邮箱', trigger: 'blur'},
              {type : 'email', message: '邮箱格式不正确', trigger:'blur'}]
          },
          club : [{required: true, message:'请选择归属俱乐部',trigger: 'blur'}],
          role : [{required: true, message:'请选择账号角色',trigger: 'blur'}],
        }
      }
    },

    computed : {
      title(){
        if(this.id){
          return '编辑账号'
        }else{
          return '新建账号'
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      let id = to.query.id
      next(vm => {
        vm.id = id;

        // roleApi.getList().then(roles => {
        //   vm.roleList = roles
        // })
        clubApi.getList().then(clubs => {
          vm.clubList = clubs
        })
        if (id !== undefined) {
          //获取已存在user info，覆盖form
          getById(id).then(async resp => {
            vm.roleList = await roleApi.getList({club : resp.club})
            vm.form = resp;
          })
        }
      })
    },
    methods: {
      goBack(){
        this.$router.push({ path: '/account/index' })
      },
      async handleSave(){
        try{
          await this.$refs.form.validate();
        }catch(err){
          this.$message.error('请按照提示修正表单内容');
          return;
        }
        let result = await add({
          _id : this.id,
          account : this.form.account,
          pwd : this.form.pwd,
          name : this.form.name,
          club : this.form.club,
          role : this.form.role,
          mobile : this.form.mobile,
        });
        this.goBack();
      },
      async getVisibleRoles(clubId){
        this.roleList = await roleApi.getList({club : clubId});
      }
    },
  }
</script>

<style scoped>
@media screen and (max-width: 800px){
  .form-card{
    margin-top: 20px;
    width: 100%;
  }
}

@media screen and (min-width: 800px){
  .form-card{
    margin-top: 20px;
    width: 50%;
  }
}

</style>
