export async function createSchedule(userId, courseId, roomId, daysOfWeek, startDate, endDate, startTime, recurring, endTime) {
    const scheduleData = {
        userId,
        courseId,
        roomId,
        daysOfWeek,
        startTime,
        endTime,
        startDate,
        recurring,
        endDate
    };

    const response = await fetch('http://localhost:3000/api/schedules', {
        method: 'POST',
        headers: {
            'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
    });

    if (!response.ok) {
        throw new Error('Error creating schedule');
    }
    return await response.json(); 
}

export async function createBookingsForRecurring(userId, roomId, startDate, startTime, endTime, purpose, recurring, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Create only a single booking if not recurring
    if (recurring === 'false') {
        await createBooking(userId, roomId, startDate, startTime, endTime, purpose);
        return;
    }
    
    // Create bookings for each week if recurring is true
    else{
        let currentDate = start;
        while (currentDate <= end) {
            const date = currentDate.toISOString().split('T')[0]; // Format date as 'YYYY-MM-DD'
            await createBooking(userId, roomId, date, startTime, endTime, purpose);
            currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
        }
    }
}

// POST single booking
export async function createBooking(userId, roomId, date, start_time, end_time, purpose) {
    const bookingData = {
        userId,
        roomId,
        start_time,
        end_time,
        date,
        purpose,
        status: 'Pending', // Add status if necessary
        venueId: roomId // Assuming venueId and roomId are the same
    };

    console.log(bookingData); // Log booking data for debugging

    try {
        const response = await fetch('http://localhost:3000/api/Bookings', {
            method: 'POST',
            headers: {
                'x-api-key': 'kpy8PxJshr0KqzocQL2ZZuZIcNcKVLUOwuS8YVnogqSZNCvKcFHJa8kweD0sP8JlUOhWStMuKNCKf2ZZVPoGZjzNiWUodIVASAaOfcVNKb2bFapQ5L9a2WKzCTBWSfMG',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (jsonError) {
                errorData = await response.text();
            }
            console.error(`Booking creation failed with status ${response.status}:`, errorData);
            throw new Error(`Error creating booking: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`Booking created successfully:`, result);
    } catch (error) {
        console.error('Error occurred during booking creation:', error);
    }
}


