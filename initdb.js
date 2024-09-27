const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("meals.db");

const dummyMeals = [
    {
        title: "Juicy Cheese Burger",
        slug: "juicy-cheese-burger",
        image: "/images/burger.jpg",
        summary:
            "A mouth-watering burger with a juicy beef patty and melted cheese, served in a soft bun.",
        instructions: `
          1. Prepare the patty:
          Mix 200g of ground beef with salt and pepper. Form into a patty.

          2. Cook the patty:
          Heat a pan with a bit of oil. Cook the patty for 2-3 minutes each side, until browned.

          3. Assemble the burger:
          Toast the burger bun halves. Place lettuce and tomato on the bottom half. Add the cooked patty and top with a slice of cheese.

          4. Serve:
          Complete the assembly with the top bun and serve hot.
        `,
        creator: "John Doe",
        creator_email: "johndoe@example.com",
    },
    // Add more meals here as needed
];

async function initData() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create the table if it doesn't exist
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
                        console.log("Table 'meals' created or already exists.");

                        // Check if the table is empty before inserting
                        db.get(
                            "SELECT COUNT(*) as count FROM meals",
                            (err, row) => {
                                if (err) {
                                    console.error(
                                        "Error checking meals table count:",
                                        err.message
                                    );
                                    reject(err);
                                } else if (row.count === 0) {
                                    console.log("Inserting dummy data...");

                                    const insertStmt = db.prepare(
                                        `INSERT INTO meals (slug, title, image, summary, instructions, creator, creator_email) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                        (err) => {
                                            if (err) {
                                                console.error(
                                                    "Error preparing insert statement:",
                                                    err.message
                                                );
                                                reject(err);
                                            } else {
                                                for (const meal of dummyMeals) {
                                                    insertStmt.run(
                                                        meal.slug,
                                                        meal.title,
                                                        meal.image,
                                                        meal.summary,
                                                        meal.instructions,
                                                        meal.creator,
                                                        meal.creator_email,
                                                        (err) => {
                                                            if (err) {
                                                                console.error(
                                                                    "Error inserting meal:",
                                                                    err.message
                                                                );
                                                            }
                                                        }
                                                    );
                                                }

                                                insertStmt.finalize((err) => {
                                                    if (err) {
                                                        console.error(
                                                            "Error finalizing insert statement:",
                                                            err.message
                                                        );
                                                        reject(err);
                                                    } else {
                                                        console.log(
                                                            "Dummy data inserted successfully."
                                                        );
                                                        resolve();
                                                    }
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    console.log(
                                        "Table 'meals' already contains data. No need to insert dummy data."
                                    );
                                    resolve();
                                }
                            }
                        );
                    }
                }
            );
        });
    });
}

export async function getMeals() {
    await initData(); // Ensure database initialization
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM meals", (err, rows) => {
            if (err) {
                console.error("Error querying meals:", err.message);
                reject(err);
            } else {
                console.log("Retrieved meals:", rows);
                resolve(rows);
            }
        });
    });
}
