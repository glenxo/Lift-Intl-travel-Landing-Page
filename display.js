
const swiper = new Swiper(".swiper", {
    direction: "horizontal",
    loop: true,
    pagination: {
      el: ".swiper-pagination",
    },
    navigation: {
      prevEl: ".swiper-button-next",
      nextEl: ".swiper-button-prev",
      },
    scrollbar: {
      el: ".swiper-scrollbar",
    },
  });