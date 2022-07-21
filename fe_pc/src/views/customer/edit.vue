<template>
  <div class="app-container">
    <el-row>
      <el-page-header @back="goBack" content="编辑客户信息"/>
    </el-row>
    <el-row>
      <el-card class="form-card">
        <el-form ref="form" :model="form" :rules="rules" label-width="120px">
          <el-form-item label="客户名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="form.address"></el-input>
          </el-form-item>
          <el-form-item label="联系人姓名" prop="contact.name">
            <el-input v-model="form.contact.name"></el-input>
          </el-form-item>
          <el-form-item label="联系人电话" prop="contact.mobile">
            <el-input v-model="form.contact.mobile"></el-input>
          </el-form-item>
          <el-form-item label="联系人邮箱" prop="contact.email">
            <el-input v-model="form.contact.email"></el-input>
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
  import { add,getOne } from '@/api/customer'

  export default {
    name: 'index',
    data(){
      return {
        form : {
          name : '',
          address : '',
          contact : {
            name : '',
            mobile : '',
            email : ''
          }
        },

        rules : {
          name : [{required: true, message: '请填写客户名称', trigger: 'blur'}],
          contact : {
            name : [{required: true, message: '请填写联系人姓名', trigger: 'blur'}],
            mobile : [
              {required: true, message: '请填写电话号码', trigger: 'blur'},
              {pattern : /^[0-9]*$/, message: '联系电话格式不正确', trigger:'blur'}],
            email : [
              {required: true, message: '请填写联系人邮箱', trigger: 'blur'},
              {type : 'email', message: '邮箱格式不正确', trigger:'blur'}]
          },
        }
      }
    },
    beforeRouteEnter(to, from, next) {
      let id = to.query.id
      next(vm => {
        if (id !== undefined) {
          //获取已存在card，覆盖form
          getOne(id).then((resp) => {
            vm.form = resp
          })
        }
      })
    },
    methods: {
      goBack(){
        this.$router.push({ path: '/customer/index' })
      },
      async handleSave(){
        try{
          await this.$refs.form.validate();
        }catch(err){
          this.$message.error('请按照提示修正表单内容');
          return;
        }
        let result = await add(this.form);
        this.goBack();
      }
    },
  }
</script>

<style scoped>
 .form-card{
   margin-top: 20px;
   width: 40%;
 }
</style>
