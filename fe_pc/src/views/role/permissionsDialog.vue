<template>
  <div>
    <el-dialog title="分配权限" :visible.sync="permissionsDialog.show" width="20%" destroy-on-close @close='closeDialog' @open='openDialog'
               :close-on-click-modal="false" :close-on-press-escape="false" :modal-append-to-body="false">
      <el-tree :data="data"
               default-expand-all
               :check-strictly='isCheck'
               show-checkbox
               node-key="key" :default-checked-keys="defaultkey"
               :props="defaultProps" ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="permissionsDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="giveRules">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'menus'
    ]),
  },
    props: ['permissionsDialog', 'defaultkey'],
  data() {
    return {
      data: [],
      isCheck: false,
      defaultProps: {
        children: 'children',
        label: 'title'
        // label: function(data, node){
        //   return (data.meta && data.meta.title) || data.path || '--'
        // }
      }
    }
  },
  methods: {
    closeDialog() {
      this.$emit('resetDefaultKey')
    },
    openDialog() {
      let data = [];
      this.extractMeta(this.menus, data)
      this.data = data;
    },

    extractMeta(arr, result = []){
      arr.forEach(item => {
        if(!item.meta && !item.children){
          return;
        }
        if( !item.meta && item.children){
          Array.prototype.push.apply(result, this.extractMeta(item.children));
        }
        if(item.meta && !item.children){
          result.push(item.meta);
        }
        if(item.meta && item.children){
          item.meta.children = this.extractMeta(item.children)
          result.push(item.meta);
        }
      })
      return result;
    },

    giveRules() {
      console.log(this.$refs.treeRef.getCheckedKeys());
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      this.$emit('giveRules', keys)
    }
  }
}
</script>

<style>
</style>
