<template>
  <div class="icons-container">
    <el-input v-model="name" style="position: relative;" clearable placeholder="请输入图标名称" @clear="filterIcons" @input.native="filterIcons">
        <i slot="suffix" class="el-icon-search el-input__icon" />
    </el-input>
    <div class="grid">
      <div v-for="item of iconList" :key="item" @click="selectedIcon(item)">
        <el-tooltip placement="top">
          <div slot="content">
            {{ generateElementIconCode(item) }}
          </div>
          <div class="icon-item">
            <i :class="'el-icon-' + item" />
            <span>{{ item }}</span>
          </div>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import elementIcons from "./element-icons";
export default {
  name: "IconSelect",
  data() {
    return {
      name:'',
      iconList:elementIcons,
    };
  },
  methods: {
    filterIcons() {
      this.iconList = elementIcons
      if (this.name) {
        this.iconList = this.iconList.filter(item => item.includes(this.name))
      }
    },
    generateElementIconCode(symbol) {
      return `<i class="el-icon-${symbol}" />`;
    },
    reset() {
      this.name = ''
      this.iconList = elementIcons
    },
    selectedIcon(name) {
      this.$emit('selected', name)
      document.body.click()
    },
  },
};
</script>

<style lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;
  .grid {
    position: relative;
    display: grid;
    height: 200px;
    overflow-y: scroll;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  .icon-item {
    margin: 30px;
    
    height: 30px;
    text-align: center;
    width: 33%;
    float: left;
    font-size: 15px;
    color: #24292e;
    cursor: pointer;
  }
  span {
    display: block;
    font-size: 10px;
    margin-top: 10px;
  }
}
</style>