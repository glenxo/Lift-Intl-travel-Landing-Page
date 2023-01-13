window.addEventListener("resize", () => {
  if (window.innerWidth >= 1200) {
    menu.classList.remove("fa-times");
    header.classList.remove("active");
    document.body.classList.remove("active");
  }next
});

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

document.addEventListener("DOMContentLoaded", function() {
  let currentImg = null;
  const images = document.querySelectorAll("img");
  images.forEach(function(img) {
    img.addEventListener("click", function() {
      if (currentImg) {
        currentImg.style.filter = "none";
      }
      img.style.filter = "blur(1px)";
      currentImg = img;
    });
  });
});



