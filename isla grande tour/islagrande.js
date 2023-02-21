window.addEventListener("resize", () => {
    if (window.innerWidth >= 1200) {
      menu.classList.remove("fa-times");
      header.classList.remove("active");
      document.body.classList.remove("active");
    }next
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