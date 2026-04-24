<template>
  <q-page padding>
    <div class="q-pa-md">
    <q-carousel
      animated
      v-model="slide"
      navigation
      infinite
      :autoplay="autoplay"
      arrows
      transition-prev="slide-right"
      transition-next="slide-left"
      @mouseenter="autoplay = false"
      @mouseleave="autoplay = true"
    >
      <q-carousel-slide
        :name="1"
        img-src="../assets/hero chatGPT.png"
      />
      <q-carousel-slide
        :name="2"
        img-src="../assets/teamOFT.jpeg"
      />
      <q-carousel-slide
        :name="3"
        img-src="../assets/local.jpeg"
      />
    </q-carousel>
  </div>
    <h2 class="flex flex-center">Bienvenido</h2>

    <!-- <div class="row bg-primary text-white">
      <p class="col">lorem3</p>
      <p class="col">lorem3</p>
      <p class="col">lorem3</p>
    </div> -->
  </q-page>
</template>
<script>
import { ref } from 'vue'

export default {
  setup() {
    return {
      slide: ref(1),
      autoplay: ref(true)
    }
  }
}
</script>