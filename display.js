document.addEventListener("DOMContentLoaded", function () {
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

  const slideshowItems = document.querySelectorAll("#slideshow li");
  let currentItemIndex = 0;

  function showNextItem() {
    slideshowItems[currentItemIndex].classList.remove("active");
    currentItemIndex = (currentItemIndex + 1) % slideshowItems.length;
    slideshowItems[currentItemIndex].classList.add("active");
  }

  setInterval(showNextItem, 4000); // Change slide every 3 seconds (3000 milliseconds)

  window.addEventListener("scroll", function () {
    // No effects on destination section's image
  });
});
