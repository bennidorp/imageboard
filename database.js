const spicedPG = require("spiced-pg");

const db = spicedPG(
    process.env.DATABASE_URL ||
        "postgres:bennidorp:postgres@localhost:5432/imageboard"
);

exports.getImages = () => {
    return db.query(`SELECT * FROM images ORDER by id DESC;`);
};

exports.getImageById = (id) => {
    return db.query(`SELECT * FROM images WHERE id=$1;`, [id]);
};

exports.addImage = (username, title, url) => {
    return db.query(
        `
        INSERT INTO images
            (username, title, url)
        VALUES
            ($1, $2, $3)
        RETURNING *;`,
        [username, title, url]
    );
};
