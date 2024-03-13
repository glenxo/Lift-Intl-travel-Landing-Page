document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.gallery-img');
    const fullscreen = document.createElement('div');
    fullscreen.classList.add('fullscreen');
    document.body.appendChild(fullscreen);

    images.forEach(img => {
        img.addEventListener('click', function() {
            fullscreen.innerHTML = '';
            const imgClone = img.cloneNode();
            imgClone.style.cursor = 'pointer';
            imgClone.addEventListener('click', function() {
                fullscreen.style.display = 'none';
            });

            const closeButton = document.createElement('span');
            closeButton.innerHTML = '&times;';
            closeButton.classList.add('close-btn');
            closeButton.addEventListener('click', function() {
                fullscreen.style.display = 'none';
            });
            
            fullscreen.appendChild(imgClone);
            fullscreen.appendChild(closeButton);
            fullscreen.style.display = 'flex';
        });
    });
});

