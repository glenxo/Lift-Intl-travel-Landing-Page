let navbar = document.querySelector('.header .flex .navbar');


document.querySelector('#menu-btn').onclick = () =>{
   navbar.classList.toggle('active');
}


window.onscroll = () =>{
   navbar.classList.remove('active');
}



document.querySelectorAll('input[type="number"]').forEach(inputNumber => {

   inputNumber.oninput = () =>{

      if(inputNumber.value.length > inputNumber.maxLength) inputNumber.value = inputNumber.value.slice(0, inputNumber.maxLength);

   };

});




AOS.init({

   duration: 100,

   delay: 50,

});

document.addEventListener("DOMContentLoaded", function () {
    const slideshowItems = document.querySelectorAll('#slideshow li');
    let currentItemIndex = 0;
  
    function showNextItem() {
      slideshowItems[currentItemIndex].classList.remove('active');
      currentItemIndex = (currentItemIndex + 1) % slideshowItems.length;
      slideshowItems[currentItemIndex].classList.add('active');
    }
  
    setInterval(showNextItem, 4000); // Change slide every 3 seconds (3000 milliseconds)
  
    window.addEventListener("scroll", function () {
      // No effects on destination section's image
    });
  });