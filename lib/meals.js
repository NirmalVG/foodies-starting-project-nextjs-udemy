import fs from "node:fs";

const sqlite3 = require("sqlite3").verbose();
import slugify from "slugify";
import xss from "xss";

const db = new sqlite3.Database("meals.db");

async function initData() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(
                `CREATE TABLE IF NOT EXISTS meals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    slug TEXT NOT NULL UNIQUE,
                    title TEXT NOT NULL,
                    image TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    instructions TEXT NOT NULL,
                    creator TEXT NOT NULL,
                    creator_email TEXT NOT NULL   
                )`,
                (err) => {
                    if (err) {
                        console.error("Error creating table:", err.message);
                        reject(err);
                    } else {
                        resolve(); // Table creation successful
                    }
                }
            );
        });
    });
}

export async function getMeals() {
    await initData(); // Ensure the database is initialized before querying
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM meals", (err, rows) => {
            if (err) {
                console.error("Error querying meals:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export async function getMeal(slug) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM meals WHERE slug = ?", [slug], (err, row) => {
            if (err) {
                console.error("Error querying meal by slug:", err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}
export async function saveMeal(meal) {
    return new Promise(async (resolve, reject) => {
        try {
            // Generate slug and sanitize instructions
            meal.slug = slugify(meal.title, { lower: true });
            meal.instructions = xss(meal.instructions);

            // Extract image extension and construct file name
            const extension = meal.image.split(".").pop();
            const fileName = `${meal.slug}.${extension}`;

            // Create a write stream to save the image
            const stream = fs.createWriteStream(path.join(__dirname, `public/images/${fileName}`));

            // Convert image to a buffer
            const bufferedImage = Buffer.from( meal.image.arrayBuffer());

            // Write the buffer to the file
            stream.write(bufferedImage, (error) => {
                if (error) {
                    return reject(new Error("Saving image failed!"));
                }

                // Update meal's image path
                meal.image = `/images/${fileName}`;

                // Insert the meal data into the database
                db.run(
                    `INSERT INTO meals 
                    (title, summary, instructions, creator, creator_email, image, slug)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,

                    [
                        meal.title,
                        meal.summary,
                        meal.instructions,
                        meal.creator,
                        meal.creator_email,
                        meal.image,
                        meal.slug,
                    ],
                    function (err) {
                        if (err) {
                            console.error("Error saving meal:", err.message);
                            return reject(err);
                        }
                        resolve({ id: this.lastID, ...meal }); // Return the inserted meal with its ID
                    }
                );
            });
        } catch (error) {
            reject(error);
        }
    });
}
