<template>
  <div class="app-container" id="a">
    <h1>引导页</h1>
    <el-button icon="el-icon-question" type="primary" @click.prevent.stop="guide">
      Show Guide
    </el-button>
    <el-button  type="primary" @click="show">
       Guide
    </el-button>   
  </div>
</template>

<script>
import Driver from "driver.js"; // import driver.js
import "driver.js/dist/driver.min.css"; // import driver.js css
import steps from "./steps";

export default {
  name: "Guide",
  data() {
    return {
      driver: null,
    };
  },
  mounted() {
    this.driver = new Driver({
      doneBtnText: "完成", // Text on the final button
      closeBtnText: "关闭", // Text on the close button for this step
      stageBackground: "#fff", // Background color for the staged behind highlighted element
      nextBtnText: "下一步", // Next button text for this step
      prevBtnText: "上一步", // Previous button text for this step
    });
  },
  methods: {
    guide() {
      this.driver.defineSteps(steps);
      this.driver.start();
    },
    show(){
      this.driver.highlight('#a')
    }
  },
};
</script>
