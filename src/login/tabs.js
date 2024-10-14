document.addEventListener('DOMContentLoaded', () => {
    // Tab functionality
    const witsTab = document.getElementById('witsTab');
    const nonWitsTab = document.getElementById('nonWitsTab');
    const witsContent = document.getElementById('witsContent');
    const nonWitsContent = document.getElementById('nonWitsContent');
  
    witsTab.addEventListener('click', () => {
      witsTab.classList.add('border-blue-500');
      nonWitsTab.classList.remove('border-blue-500');
      witsContent.classList.remove('hidden');
      nonWitsContent.classList.add('hidden');
    });
  
    nonWitsTab.addEventListener('click', () => {
      nonWitsTab.classList.add('border-blue-500');
      witsTab.classList.remove('border-blue-500');
      nonWitsContent.classList.remove('hidden');
      witsContent.classList.add('hidden');
    });
  
    // Toggle password visibility
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
  
    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye-slash');
    });
  });
  