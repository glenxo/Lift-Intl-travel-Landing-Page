

const swiper = new Swiper('.swiper', {
    direction: 'horizontal',
    loop: true,
  
    // If we need pagination
    pagination: {
      el: '.swiper-pagination',
    },
  
    // Navigation arrows
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  
    // And if we need scrollbar
    scrollbar: {
      el: '.swiper-scrollbar',
    },
  });

(function () {
  const parallaxElements = document.querySelectorAll(".parallax");
  function parallax() {
    const scrollTop = window.pageYOffset;
    for (let i = 0; i < parallaxElements.length; i++) {
      const element = parallaxElements[i];
      const speed = element.getAttribute("data-parallax-speed");
      element.style.backgroundPositionY = scrollTop * speed + "px";
    }
  }

  window.addEventListener("scroll", parallax);
})();
