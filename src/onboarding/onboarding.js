document.addEventListener('DOMContentLoaded', () => {
    const finishBtn = document.getElementById('finishBtn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            alert('Onboarding Complete!');
        });
    } else {
        console.error('Element with ID "finishBtn" not found.');
    }
});
