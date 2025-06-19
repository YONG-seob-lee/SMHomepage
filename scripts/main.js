document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const navLinks = document.querySelectorAll("nav a");
    const sections = document.querySelectorAll("section");
    let lastScrollTop = 0;

    // 💡 스크롤 시 헤더 숨김 처리
    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;

        if (scrollTop > lastScrollTop && scrollTop > 80) {
            header.classList.add("hide");
        } else {
            header.classList.remove("hide");
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        // 🔥 현재 보이는 섹션에 따라 메뉴 하이라이트
        sections.forEach(section => {
            const offsetTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            const currentId = section.getAttribute("id");

            if (scrollTop >= offsetTop && scrollTop < offsetTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    const targetLink = document.querySelector(`nav a[href="#${currentId}"]`);
                    if (targetLink) {
                        targetLink.classList.add("active");
                    }
                });
            }
        });
    });

    // 🚀 메뉴 클릭 시 부드러운 이동 처리
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            const targetId = link.getAttribute("href").slice(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: "smooth"
                });
            }
        });
    });
});
