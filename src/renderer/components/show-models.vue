<template>
  <div style="height: 100%; width:100%;">
    <textarea style="width:100%; height:100%" v-html="htmlTxt"></textarea>
  </div>
</template>
<script>
export default {
  props: {
    htmlTxt: String
  },
  data: () => {
    return {

    }
  }
}
</script>