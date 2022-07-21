<template>
  <el-dialog
    title="修改密码"
    :visible.sync="visible"
    :width="width"
    destroy-on-close
    @close='closeDialog'
    @open='openDialog'
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :modal-append-to-body="false">

    <el-form :model="form" :rules="rules" ref="form">
      <el-form-item label="当前密码" :label-width="formLabelWidth" prop="curPwd">
        <el-input type="password" v-model="form.curPwd" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="新密码" :label-width="formLabelWidth" prop="newPwd">
        <el-input type="password" v-model="form.newPwd" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="新密码确认" :label-width="formLabelWidth" prop="confirmPwd">
        <el-input type="password" v-model="form.confirmPwd" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {resetPwd} from '@/api/account'

  export default {
    name: 'passwordReset',
    props : ['id'],
    data() {
      return {
        visible: false,
        width: '35%',
        formLabelWidth: '120px',
        form: {
          curPwd: '',
          newPwd: '',
          confirmPwd: ''
        },
        rules: {
          curPwd: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
          newPwd: [
            { required: true, message: '请输入新的密码', trigger: 'blur' },
            { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
          ],
          confirmPwd: [
            { required: true, trigger: 'blur', validator: this.confirmPassword }
          ]
        }
      }
    },
    methods: {
      closeDialog() {
        // this.$emit('resetDefaultKey')
      },
      openDialog() {
      },
      submitForm() {
        this.$refs.form.validate(async valid => {
          if (valid) {
            try{
              let resp = await resetPwd(this.id, this.form)
              this.visible = false
              this.$message({
                type: 'success',
                message: '修改成功!'
              });
            }catch(err){
              return false
            }
          } else {
            return false
          }
        })
      },
      show() {
        this.visible = true
      },
      confirmPassword(rule, value, callback) {
        if (this.form.newPwd !== value) {
          callback(new Error('密码验证不一致'))
        } else {
          callback()
        }
      }
    }
  }
</script>

<style scoped>

</style>
