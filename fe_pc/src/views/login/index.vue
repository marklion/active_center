<template>
<div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">

        <div class="title-container">
            <h3 class="title">管理平台</h3>
        </div>
        <el-tabs v-model="activeName" stretch>

            <el-tab-pane label="手机号登录" name="0">
                <el-form-item prop="phone">
                    <span class="svg-container">
                        <svg-icon icon-class="phone" />
                    </span>
                    <el-input ref="phone" v-model="loginForm.phone" placeholder="手机号" name="phone" type="tel" tabindex="1" />
                </el-form-item>
                <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="phone_login">登 录</el-button>
            </el-tab-pane>
            <el-tab-pane label="验证码登录" name="1">
                <el-form-item prop="phone">
                    <span class="svg-container">
                        <svg-icon icon-class="phone" />
                    </span>
                    <el-input ref="phone" v-model="loginForm.phone" placeholder="手机号" name="phone" type="tel" tabindex="1" />
                </el-form-item>
                <el-row type="flex" align="middle">
                    <el-col :span="16">
                        <el-form-item prop="verify_code">
                            <span class="svg-container">
                                <svg-icon icon-class="phone" />
                            </span>
                            <el-input ref="verify" v-model="loginForm.verify_code" placeholder="验证码" :maxlength="6" name="verify_code" type="text" tabindex="1">
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-button type="warning" size="mini" :disabled="verify_disabled" @click="send_verify_code">发送验证码</el-button>
                    </el-col>
                </el-row>
                <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="verify_login">登 录</el-button>
            </el-tab-pane>
            <el-tab-pane label="密码登录" name="2">
                <el-form-item prop="username">
                    <span class="svg-container">
                        <svg-icon icon-class="user" />
                    </span>
                    <el-input ref="username" v-model="loginForm.username" placeholder="Username" name="username" type="text" tabindex="1" auto-complete="on" />
                </el-form-item>
                <el-form-item prop="password">
                    <span class="svg-container">
                        <svg-icon icon-class="password" />
                    </span>
                    <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType" placeholder="Password" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
                    <span class="show-pwd" @click="showPwd">
                        <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                    </span>
                </el-form-item>
                <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登 录</el-button>
            </el-tab-pane>
        </el-tabs>
        <div class="tips">
            <!--        <span style="margin-right:20px;">username: admin</span>-->
            <!--        <span> password: any</span>-->
        </div>

    </el-form>
</div>
</template>

<script>
import {
    validUsername
} from '@/utils/validate'
export default {
    name: 'Login',
    data() {
        const validateUsername = (rule, value, callback) => {
            if (!validUsername(value)) {
                callback(new Error('Please enter the correct user name'))
            } else {
                callback()
            }
        }
        const validatePassword = (rule, value, callback) => {
            if (value.length < 6) {
                callback(new Error('The password can not be less than 6 digits'))
            } else {
                callback()
            }
        }
        return {
            verify_disabled: false,
            activeName: '0',
            loginForm: {
                username: 'zcadmin',
                password: '',
                phone: '',
                verify_code: ''
            },
            loginRules: {
                username: [{
                    required: true,
                    trigger: 'blur'
                }],
                password: [{
                    required: true,
                    trigger: 'blur',
                    validator: validatePassword
                }]
            },
            loading: false,
            passwordType: 'password',
            redirect: undefined,
        }
    },
    watch: {
        $route: {
            handler: function (route) {
                this.redirect = route.query && route.query.redirect
            },
            immediate: true
        }
    },
    methods: {
        verify_login: function () {
            this.loading = true
            this.$store.dispatch('user/verify_login', {
                phone: this.loginForm.phone,
                code: this.loginForm.verify_code
            }).then(() => {
                this.$router.push({
                    path: this.redirect || '/'
                })
                this.loading = false
            }).catch((err) => {
                this.$message(err);
                this.loading = false
            })
        },
        send_verify_code: function () {
            this.$store.dispatch('user/send_sms_code', this.loginForm.phone).then(() => {
                this.verify_disabled = true;
                this.$message("短信发送成功");
                setTimeout(() => {
                    this.verify_disabled = false;
                }, 60000);
            }).catch(() => {
                this.$message("短信发送失败")
            });
        },
        showPwd() {
            if (this.passwordType === 'password') {
                this.passwordType = ''
            } else {
                this.passwordType = 'password'
            }
            this.$nextTick(() => {
                this.$refs.password.focus()
            })
        },
        phone_login: function () {
            this.loading = true
            this.$store.dispatch('user/phone_login', this.loginForm.phone).then(() => {
                this.$router.push({
                    path: this.redirect || '/'
                })
                this.loading = false
            }).catch((err) => {
                this.$message(err);
                this.loading = false
            })

        },
        handleLogin() {
            this.$refs.loginForm.validate(valid => {
                if (valid) {
                    this.loading = true
                    this.$store.dispatch('user/login', this.loginForm).then(() => {
                        this.$router.push({
                            path: this.redirect || '/'
                        })
                        this.loading = false
                    }).catch(() => {
                        this.loading = false
                    })
                } else {
                    console.log('error submit!!')
                    return false
                }
            })
        }
    },
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
    .login-container .el-input input {
        color: $cursor;
    }
}

/* reset element-ui css */
.login-container {
    .el-input {
        display: inline-block;
        height: 47px;
        width: 85%;

        input {
            background: transparent;
            border: 0px;
            -webkit-appearance: none;
            border-radius: 0px;
            padding: 12px 5px 12px 15px;
            color: $light_gray;
            height: 47px;
            caret-color: $cursor;

            &:-webkit-autofill {
                box-shadow: 0 0 0px 1000px $bg inset !important;
                -webkit-text-fill-color: $cursor !important;
            }
        }
    }

    .el-form-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        color: #454545;
    }
}
</style>

<style lang="scss" scoped>
$bg:#2a7a85;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
    min-height: 100%;
    width: 100%;
    background-color: $bg;
    overflow: hidden;

    .login-form {
        position: relative;
        width: 520px;
        max-width: 100%;
        padding: 160px 35px 0;
        margin: 0 auto;
        overflow: hidden;
    }

    .tips {
        font-size: 14px;
        color: #fff;
        margin-bottom: 10px;

        span {
            &:first-of-type {
                margin-right: 16px;
            }
        }
    }

    .svg-container {
        padding: 6px 5px 6px 15px;
        color: $dark_gray;
        vertical-align: middle;
        width: 30px;
        display: inline-block;
    }

    .title-container {
        position: relative;

        .title {
            font-size: 26px;
            color: $light_gray;
            margin: 0px auto 40px auto;
            text-align: center;
            font-weight: bold;
        }
    }

    .show-pwd {
        position: absolute;
        right: 10px;
        top: 7px;
        font-size: 16px;
        color: $dark_gray;
        cursor: pointer;
        user-select: none;
    }

}
</style>
