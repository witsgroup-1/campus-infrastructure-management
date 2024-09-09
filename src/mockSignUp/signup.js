
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission
  
    // Get form data
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const faculty = document.getElementById('faculty').value; // If you have more fields like faculty, add them here
    const is_tutor = false;
    const is_lecturer = false;

    //check for lecturer.
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

    const url = 'https://campus-infrastructure-management.azurewebsites.net/api/users/signup'
    try {
      // Send user data to the server
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.API_KEY_1,
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
  