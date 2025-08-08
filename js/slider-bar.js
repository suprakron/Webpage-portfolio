document.addEventListener("DOMContentLoaded", function () {
  const slideContainer = document.getElementById('slide-container');

  if (!slideContainer) {
    console.warn("slide-container not found");
    return;
  }

  const slides = slideContainer.children;
  const totalSlides = slides.length;
  let currentIndex = 0;

  function showSlide(index) {
    const slideWidth = slides[0].offsetWidth;
    slideContainer.style.transform = `translateX(-${index * slideWidth}px)`;
  }

  function goToNextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    showSlide(currentIndex);
  }

  function goToPrevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    showSlide(currentIndex);
  }

  // เริ่มแสดง slide แรก
  showSlide(currentIndex);

  // Auto-slide ทุก 3 วินาที
  setInterval(goToNextSlide, 3000);

  // ปุ่มควบคุม (ถ้ามีใน HTML)
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");

  if (nextBtn) nextBtn.addEventListener("click", goToNextSlide);
  if (prevBtn) prevBtn.addEventListener("click", goToPrevSlide);
});
