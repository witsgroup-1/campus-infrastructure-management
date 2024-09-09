
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission
  
    // Get form data
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
  
    // Additional fields (if needed)
    const faculty = ''; // If you have more fields like faculty, add them here
    const is_tutor = false; // Example default values
    const is_lecturer = false; // Example default values
  
    // Create the user object
    const userData = {
      name,
      surname,
      email,
      password,
      role,
      faculty,
      is_tutor,
      is_lecturer
    };
  
    try {
      // Send user data to the server
      const response = await fetch('http://localhost:3000/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
  
      // Handle response
      if (response.ok) {
        const result = await response.json();
        alert('User signed up successfully!'); // Success message
      } else {
        const errorMessage = await response.text();
        alert(`Sign up failed: ${errorMessage}`); // Display error message
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during signup.'); // Handle fetch errors
    }
  });
  