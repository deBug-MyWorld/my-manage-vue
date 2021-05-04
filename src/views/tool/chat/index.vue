<template>
  <div class="app-container">
    <div class="chating">
      <div class="chating-message">
        <div
          style="font-size: 15px; font-weight: bold; margin: 10px 0px 0px 10px"
        >
          请选择聊天对象
          <el-select
            v-model="value"
            placeholder="请选择"
            size="small"
            @change="handleChange"
          >
            <el-option
              v-for="item in onlineList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value === user.username"
            ></el-option>
          </el-select>
        </div>
        <el-divider></el-divider>
        <div id="show">
          <ul style="list-style-type: none; padding: 0">
            <li v-for="message in chatRoom.get(toUser)" :key="message.id">
              <!-- 聊天 目标用户 -->
              <div v-if="message.sendUser == toUser">
                <div class="container2">
                  <div class="img-location">
                    <img :src="message.avatar" class="imgsize" />
                  </div>
                  <div class="chat-bubble chat-bubble-left">
                    {{ message.message }}
                  </div>
                </div>
              </div>
              <!-- 聊天 当前用户 -->
              <div v-else>
                <div class="container1">
                  <div class="chat-bubble chat-bubble-right">
                    {{ message.message }}
                  </div>
                  <div class="img-location">
                    <img :src="message.avatar" class="imgsize" />
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <el-divider></el-divider>
        <div class="chating-end">
          <el-row>
            <el-popover
              placement="top-start"
              width="300"
              trigger="click"
            >
              <div class="emojiBox">
                <li
                  class="emojiList"
                  v-for="(item, index) in emojis"
                  :key="index"
                  @click="handleEmoji(item)"
                >
                  {{ item.text }}
                </li>
              </div>
              <i
                class="el-icon-picture-outline-round"
                style="cursor: pointer"
                slot="reference"
              ></i>
            </el-popover>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-position"
              style="float: right"
              :disabled="sendFlag"
              plain
              @click="send"
              >发送</el-button
            >
          </el-row>
          <el-input
            type="textarea"
            rows="2"
            v-model="input"
            placeholder="请输入聊天内容"
          ></el-input>
        </div>
      </div>
      <div class="chating-group">
        <div
          style="
            font-size: 15px;
            font-weight: bold;
            text-align: left;
            margin: 10px 0px 0px 10px;
            height: 32px;
          "
        >
          当前聊天人数:{{ talkList.length }}
        </div>
        <el-divider></el-divider>
        <div id="talkList" v-if="talkList.length != 0">
          <ul
            style="list-style-type: none; text-align: left; padding-left: 5px"
          >
            <li
              v-for="talk in talkList"
              :key="talk.id"
              :class="
                talk.sendUser == toUser ? 'selectShow-show' : 'selectShow'
              "
              @click="selectTalker(talk)"
            >
              <div class="talker-info">
                <img :src="talk.avatar" class="imgsize" />
                <div style="margin: 10px 0px 0px 10px">{{ talk.sendUser }}</div>
                <el-badge is-dot v-if="talk.newMessage"></el-badge>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <audio src="@/assets/audio/msg.mp3" ref="hintAudio" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      path: "ws://localhost:8081/websocket/",
      socket: "",
      value: "",
      sendUser: "",
      toUser: "",
      chatRoom: new Map("", []), // 维护的是当前人与目标对象的聊天信息，由于聊天信息没有持久化到数据库，所以用Map维护
      onlineList: [], // 聊天室所有的用户
      sendFlag: true, // 初始时没有选用户，不能发送
      input: "",
      talkList: [], // 与当前用户聊天的人数
      timer: "",
      emojis: "",
    };
  },
  computed: {
    ...mapGetters(["user"]),
  },
  mounted() {
    this.sendUser = this.user.username;
    this.init();
    const emojis = [
      "😀",
      "😄",
      "😅",
      "🤣",
      "😂",
      "😉",
      "😊",
      "😍",
      "😘",
      "😜",
      "😝",
      "😏",
      "😒",
      "🙄",
      "😔",
      "😴",
      "😷",
      "🤮",
      "🥵",
      "😎",
      "😮",
      "😰",
      "😭",
      "😱",
      "😩",
      "😡",
      "💀",
      "👽",
      "🤓",
      "🥳",
      "😺",
      "😹",
      "😻",
      "🤚",
      "💩",
      "👍",
      "👎",
      "👏",
      "🙏",
      "💪",
    ];
    this.emojis = emojis.map((emoji) => ({ text: emoji }));
  },
  beforeDestroy() {
    this.onbeforeunload();
    clearTimeout(this.timer);
  },
  methods: {
    handleEmoji(item) {
      this.input += item.text
    },
    handleChange() {
      this.toUser = this.value;
      this.sendFlag = false;
    },
    selectTalker(talk) {
      this.sendFlag = false;
      talk.newMessage = false;
      this.toUser = talk.sendUser;
      this.value = this.toUser;
    },
    init: function () {
      if (typeof WebSocket === "undefined") {
        alert("您的浏览器不支持socket");
      } else {
        this.socket = new WebSocket(this.path + this.sendUser);
        // 监听socket连接
        this.socket.onopen = this.open;
        // 监听socket错误信息
        this.socket.onerror = this.error;
        // 监听socket消息
        this.socket.onmessage = this.getMessage;
        // 监听socket关闭
        this.socket.onclose = this.close;
        //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
        window.onbeforeunload = this.onbeforeunload;
      }
    },
    open: function () {
      console.log("socket连接成功");
      this.$message.success("socket连接成功");
    },
    error: function () {
      console.log("连接错误");
      this.$message.error("连接错误");
    },
    getMessage: function (msg) {
      var tmp = JSON.parse(msg.data);
      console.log(tmp);
      if (tmp.type === 3) {
        // 在线列表更新
        this.updateOnlineList(tmp.onlineUser);
      } else if (tmp.type === 2) {
        // 群发
        this.updateOnlineList(tmp.onlineUser);
        // 聊天室成员退出
        var exist = false; // 该用户是否在聊天列表
        this.talkList.some((item, i) => {
          if (item.sendUser === tmp.closeUser) {
            exist = true;
            this.talkList.splice(i, 1);
            //在数组的some方法中，如果return true，就会立即终止这个数组的后续循环
            return true;
          }
        });
        if (exist) {
          this.$refs.hintAudio.play();
          console.log("用户" + tmp.closeUser + "离开了");
          this.$alert("用户" + tmp.closeUser + "离开了", "提示", {
            confirmButtonText: "确定",
            callback: (action) => {
              this.sendFlag = true;
              this.chatRoom.delete(tmp.closeUser);
            },
          });
        }
      } else {
        // 私发
        //聊天成员进来,加入并显示在成员框中
        this.$refs.hintAudio.play();
        var newTalk = true;
        this.talkList.some((item, i) => {
          if (item.sendUser === tmp.sendUser) {
            item.newMessage = true;
            newTalk = false;
          }
        });
        if (newTalk) {
          this.talkList.push({
            sendUser: tmp.sendUser,
            id: new Date().getTime(),
            avatar: tmp.avatar,
            newMessage: true, //聊天成员进来，显示小红点
          });
        }
        console.log(this.talkList);
        this.showMessage(tmp);
      }
    },
    updateOnlineList(onlineUser) {
      this.onlineList = [];
      onlineUser.forEach((online) => {
        this.onlineList.push({
          value: online,
          label: online,
        });
      });
    },
    send: function () {
      var params = {
        sendUser: this.sendUser,
        toUser: this.toUser,
        message: this.input,
        avatar: this.user.avatar,
        type: 0,
      };
      this.socket.send(JSON.stringify(params));
      this.showMessage(params);
      this.input = "";
    },
    showMessage(params) {
      var show = document.getElementById("show");
      var user = params.type == 0 ? params.toUser : params.sendUser;
      if (this.chatRoom.get(user) == null) {
        this.chatRoom.set(user, []);
      }
      this.chatRoom.get(user).push({
        sendUser: params.sendUser,
        avatar: params.avatar,
        message: params.message,
        id: new Date().getTime(),
      });
      // 使用Map数据结构只能这样更新
      this.chatRoom = new Map(this.chatRoom);
      console.log(this.chatRoom);
      this.timer = setTimeout(() => {
        show.scrollTop = show.scrollHeight;
      }, 100);
    },
    close: function () {
      console.log("socket已经关闭");
      this.$message.success("socket已经关闭");
    },
    onbeforeunload() {
      if (this.socket != "") {
        this.socket.close();
        this.sendFlag = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.chating {
  width: 1000px;
  margin: 0 auto;
  height: 600px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  .chating-message {
    width: 79%;
    height: 100%;
    float: left;
  }
  #show {
    margin-left: 8px;
    width: 98%;
    height: 360px;
    overflow-y: auto;
  }
  .chating-end {
    border-radius: 10px;
    margin: 10px;
  }
}
/* 聊天气泡样式 */
.chat-bubble {
  position: relative;
  margin: 12px;
  padding: 5px 8px;
  word-break: break-all;
  background: #fff;
  border: 1px solid #989898;
  border-radius: 5px;
  max-width: 180px;
}
.chat-bubble-right:before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  right: -20px;
  top: 5px;
  border: 10px solid;
  border-color: transparent transparent transparent #989898;
}
.chat-bubble-right:after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  right: -16px;
  top: 7px;
  border: 8px solid;
  border-color: transparent transparent transparent #ffffff;
}
.chat-bubble-left:before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  left: -20px;
  top: 5px;
  border: 10px solid;
  border-color: transparent #989898 transparent transparent;
}
.chat-bubble-left:after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  left: -16px;
  top: 7px;
  border: 8px solid;
  border-color: transparent #ffffff transparent transparent;
}
.imgsize {
  width: 60px;
  height: 60px;
  border-radius: 50px;
}
.container1 {
  display: flex;
  justify-content: flex-end;
}
.container2 {
  display: flex;
  justify-content: flex-start;
}

.chating-group {
  width: 20%;
  height: 100%;
  float: right;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  #talkList li :hover {
    background-color: aliceblue;
  }
  .selectShow-show {
    background-color: rgb(231, 231, 231);
  }
  .selectShow {
    background-color: white;
  }
  .talker-info {
    display: flex;
    margin-top: 5px;
    cursor: pointer;
  }
}
.emojiBox{
    display: flex;
    flex-wrap: wrap;
    .emojiList{
        list-style-type: none;
        cursor: pointer;
    }
}

</style>