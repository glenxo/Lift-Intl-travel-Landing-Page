document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("menuBtn");
    const navbar = document.getElementById("navbar");

    menuBtn.addEventListener("click", function () {
        // Toggle the navigation menu's visibility
        if (navbar.style.display === "block") {
            navbar.style.display = "none";
        } else {
            navbar.style.display = "block";
        }
    });
});
