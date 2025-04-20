const slideContainer = document.getElementById('slide-container');
const totalSlides = slideContainer.children.length;
let currentIndex = 0;

function showSlide(index) {
  slideContainer.style.transform = `translateX(-${index * 400}px)`;
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % totalSlides;
  showSlide(currentIndex);
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
  showSlide(currentIndex);
}

// Auto-slide every 3 seconds
setInterval(nextSlide, 3000);

 

const projectList = document.getElementById('project-list');
const totalItems = projectList.children.length;

// ฟังก์ชันเลื่อนไปข้างหน้า
function nextSlide() {
    if (currentIndex < totalItems - 1) {
        currentIndex++;
    } else {
        currentIndex = 0; // กลับไปที่รายการแรกเมื่อถึงสุดท้าย
    }
    updateSliderPosition();
}

// ฟังก์ชันเลื่อนไปถอยหลัง
function prevSlide() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = totalItems - 1; // กลับไปที่รายการสุดท้ายเมื่อถึงแรก
    }
    updateSliderPosition();
}

// ฟังก์ชันปรับตำแหน่งของ slider
function updateSliderPosition() {
    const slideWidth = projectList.children[0].offsetWidth;
    projectList.style.transform = `translateX(-${currentIndex * (slideWidth + 20)}px)`;
}



function prevSlide() {
    const slider = document.querySelector('.slider');
    slider.scrollBy({ left: -320, behavior: 'smooth' });
}

function nextSlide() {
    const slider = document.querySelector('.slider');
    slider.scrollBy({ left: 320, behavior: 'smooth' });
}
