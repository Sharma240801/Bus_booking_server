import dotenv from "dotenv";
import mongoose from "mongoose";
import { buses, generateSeats, locations } from "./seedData.js";

import Bus from "./models/bus.js";

dotenv.config();

const generateRandomTime = (baseTime) => {
  //Generates random hour and minutes
  const hour = Math.floor(Math.random() * 12) + 6;
  const minute = Math.random() > 0.5 ? 30 : 0;

  const dateTime = new Date(baseTime);
  dateTime.setHours(hour, minute, 0, 0);

  return dateTime;
};

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Bus.deleteMany();
    console.log("Old Bus data deleted!");

    const busesToInsert = [];

    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations?.length; j++) {
        const from = locations[i];
        const to = locations[j];

        const baseDate = new Date();

        for (let dayoffset = 0; dayoffset < 7; dayoffset++) {
          const travelDate = new Date(baseDate);
          travelDate.setDate(travelDate.getDate() + dayoffset);

          const returnDate = new Date(travelDate);
          returnDate.setDate(returnDate.getDate() + 1);

          buses.forEach((bus) => {
            const departureTime = generateRandomTime(travelDate);
            const arrivalTime = generateRandomTime(travelDate);
            const duration = Math.floor(
              (arrivalTime - departureTime) / (1000 * 60)
            );
            busesToInsert.push({
              busId: `${bus.busId}_${from}_${to}_${dayoffset}`,
              from,
              to,
              departureTime,
              arrivalTime,
              duration: duration,
              availableSeats: 28,
              price: bus.price,
              originalPrice: bus.originalPrice,
              company: bus.company,
              busType: bus.busType,
              rating: bus.rating,
              totalReviews: bus.totalReviews,
              badges: bus.badges,
              seats: generateSeats(),
            });

            busesToInsert.push({
              busId: `${bus.busId}_${from}_${to}_${dayoffset + i}`,
              from,
              to,
              departureTime,
              arrivalTime,
              duration: duration,
              availableSeats: 28,
              price: bus.price,
              originalPrice: bus.originalPrice,
              company: bus.company,
              busType: bus.busType,
              rating: bus.rating,
              totalReviews: bus.totalReviews,
              badges: bus.badges,
              seats: generateSeats(),
            });
          });
        }
      }
    }

    await Bus.insertMany(busesToInsert);
  } catch (error) {
    console.log("Error seeding Database : ", error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();
