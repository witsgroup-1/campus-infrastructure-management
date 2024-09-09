require('dotenv').config();
const express = require('express');
const { app, db, auth,createUserWithEmailAndPassword } = require("../src/firebaseInit.js");
const { collection, addDoc, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc } = require("firebase/firestore");
const usersRouter = express.Router();

async function fetchUserBookings(userId) {
    try {
      const response = await fetch(`/Bookings/user/${userId}`);
      if (!response.ok) {
        throw new Error('Error fetching bookings');
      }
      const bookings = await response.json();
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  // Function to display bookings or "no upcoming bookings" message
  function displayBookings(bookings) {
    const bookingsContainer = document.getElementById('bookings-container');
    const noBookingsMessage = document.getElementById('no-bookings-message');

    // Clear any existing bookings
    bookingsContainer.innerHTML = '';

    if (bookings.length === 0) {
      // No bookings, show the "no upcoming bookings" message and image
      bookingsContainer.classList.add('hidden');
      noBookingsMessage.classList.remove('hidden');
    } else {
      // Limit to 3 bookings
      const bookingsToDisplay = bookings.slice(0, 3);

      // Hide "no upcoming bookings" message
      bookingsContainer.classList.remove('hidden');
      noBookingsMessage.classList.add('hidden');

      // Populate HTML structure
      bookingsToDisplay.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.classList.add('w-11/12', 'h-16', 'bg-gray-200', 'rounded-lg');
        bookingElement.textContent = `Booking ID: ${booking.id} - Date: ${booking.date}`; // Customize with actual booking details
        bookingsContainer.appendChild(bookingElement);
      });
    }
  }

  // Get bookings and display them
  async function loadUserBookings(userId) {
    const bookings = await fetchUserBookings(userId);
    displayBookings(bookings);
  }

  // Example userId (replace with actual userId)
  const userId = 'exampleUserId';
  loadUserBookings(userId);