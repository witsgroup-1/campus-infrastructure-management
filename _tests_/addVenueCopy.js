// addVenueCopy.js

const apiKey = 'QGbXcci4doXiHamDEsL0cBLjXNZYGCmBUmjBpFiITsNTLqFJATBYWGxKGzpxhd00D5POPOlePixFSKkl5jXfScT0AD6EdXm6TY0mLz5gyGXCbvlC5Sv7SEWh7QO6PewW';

export async function fetchVenues() {
  try {
    const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/venues', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const venues = await response.json();
      return venues;
    } else {
      console.error('Failed to fetch venues');
      return [];
    }
  } catch (error) {
    console.error('Error fetching venues:', error);
    return [];
  }
}

export function displayVenues(venues) {
  const venuesList = document.getElementById("venues-list");
  if (venuesList) {
    venuesList.innerHTML = '';
    venues.forEach(venue => {
      const venueBlock = createVenueBlock(venue.Name, venue.Capacity, venue.Category, venue.Features, venue.Building, venue.id);
      venuesList.appendChild(venueBlock);
    });
  }
  return venuesList ? venuesList.children : [];
}

export function createVenueBlock(name, capacity, category, features, building, id) {
  const block = document.createElement('div');
  block.classList.add('bg-gray-200', 'p-4', 'rounded-md', 'mb-2', 'cursor-pointer');
  block.innerHTML = `
    <strong class="text-[#003B5C]">Name: ${name}</strong><br>
    <small class="text-gray-500">Capacity: ${capacity}</small><br>
    <small class="text-gray-500">Category: ${category}</small><br>
    <small class="text-gray-500">Features: ${features}</small><br>
    <small class="text-gray-500">Building: ${building}</small>
  `;
  return block;
}

export async function addVenue(venue) {
  try {
    const response = await fetch('https://campus-infrastructure-management.azurewebsites.net/api/venues', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(venue)
    });

    return response.ok;
  } catch (error) {
    console.error('Error adding venue:', error);
    return false;
  }
}

export function initVenueManagement() {
  document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("venue-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }

    const venues = await fetchVenues();
    displayVenues(venues);
  });
}

export async function handleFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const capacity = document.getElementById("capacity").value;
  const category = document.getElementById("category").value;
  const features = document.getElementById("features").value;
  const building = document.getElementById("building").value;

  const venue = {
    Name: name,
    Capacity: capacity,
    Category: category,
    Features: features,
    Building: building,
    Booked: false
  };

  const success = await addVenue(venue);
  if (success) {
    alert('Venue added successfully');
    event.target.reset();
    const venues = await fetchVenues();
    displayVenues(venues);
  } else {
    alert('Failed to add venue');
  }
}