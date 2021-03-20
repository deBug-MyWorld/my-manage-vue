module.exports = {
  lintOnSave: false,
  devServer:{
    port:8083,
    open:true,
    proxy:{
      '/api':{
        target:'http://localhost:8081',
        changeOrigin:true,
        pathRewrite:{
          '/api': ''
        }
      }
    }
  }
}