document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.getElementById('menu-icon');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');

    const getSidebarWidth = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1024) {
            return '20%'; // For large screens (desktops)
        } else if (screenWidth >= 768) {
            return '33%'; // For medium screens (tablets)
        } else {
            return '50%'; // For small screens (mobile)
        }
    };

    menuIcon.addEventListener('click', () => {
        sidebar.style.width = getSidebarWidth(); // Set sidebar width dynamically
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.width = '0'; 
    });

    window.addEventListener('resize', () => {
        if (sidebar.style.width !== '0') {
            sidebar.style.width = getSidebarWidth();
        }
    });
});
