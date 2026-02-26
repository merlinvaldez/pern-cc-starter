import express from "express";
import { db } from "./db.js";
import { cars } from "./schema.js";
import { eq } from "drizzle-orm";

const app = express();
const PORT = 3000;

const router = express.Router();

app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello from Car API!");
});

router.get("/cars", async (req, res) => {
  const allCars = await db.select().from(cars);
  res.json(allCars);
});

router.post("/cars", async (req, res) => {
  const { make, model, year, price } = req.body;

  if (!make || !model || !year || !price) {
    return res.status(400).json({
      error: "Please provide make, model, year, and price",
    });
  }

  const [newCar] = await db
    .insert(cars)
    .values({ make, model, year, price })
    .returning();

  res.status(201).json(newCar);
});

router.put("/cars/:id", async (req, res) => {
  const carId = parseInt(req.params.id);
  const { make, model, year, price } = req.body;

  let updatedCar;

  if (make) {
    updatedCar = await db
      .update(cars)
      .set({ make: `${make}` })
      .where(eq(cars.id, carId))
      .returning();
  }
  if (model) {
    updatedCar = await db
      .update(cars)
      .set({ model: `${model}` })
      .where(eq(cars.id, carId))
      .returning();
  }
  if (year) {
    updatedCar = await db
      .update(cars)
      .set({ year: `${year}` })
      .where(eq(cars.id, carId))
      .returning();
  }
  if (price) {
    updatedCar = await db
      .update(cars)
      .set({ price: `${price}` })
      .where(eq(cars.id, carId))
      .returning();
  }

  res.json(updatedCar);
});

//TODO: Update delete route ORM query
router.delete("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Car not found" });
  }

  const deletedCar = cars.splice(carIndex, 1)[0];

  res.json({
    message: "Car deleted successfully",
    car: deletedCar,
  });
});

router.get("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const car = cars.find((c) => c.id === carId);

  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }

  res.json(car);
});

app.use("/api/v1", router);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
