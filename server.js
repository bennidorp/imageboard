const express = require("express");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const database = require("./database.js");
const s3 = require("./s3.js");

const app = express();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

//Multer
const diskStorage = multer.diskStorage({
    destination: (request, file, callback) => {
        const destinationDirectory = __dirname + "/uploads";
        callback(null, destinationDirectory);
    },
    filename: (request, file, callback) => {
        uidSafe(24).then((uuid) => {
            const originalExtension = path.extname(file.originalname);
            const filename = uuid + originalExtension;
            callback(null, filename);
        });
    },
});

const uploader = multer({
    limits: {
        fileSize: 5242880, // = 5MB in bytes
    },
    storage: diskStorage,
});

app.get("/api/images", (req, res) => {
    database.getImages().then((result) => {
        res.json(result.rows);
    });
});

app.get("/api/image/:id", (req, res) => {
    const { id } = req.params;

    database
        .getImageById(id)
        .then((results) => {
            if (results.rows[0]) {
                res.json({
                    success: true,
                    ...results.rows[0],
                });
            } else {
                res.status(404).json({ success: false });
            }
        })
        .catch((error) => {
            res.status(500).json({ success: false });
        });
});

app.post("/api/upload", uploader.single("file"), (req, res) => {
    s3.uploadFile(req.file)
        .then(() => {
            const { title, username } = req.body;
            const fileURL = s3.getS3URL(req.file.filename);
            return database.addImage(username, title, fileURL);
        })
        .then((results) => {
            res.json({
                success: true,
                ...results.rows[0],
            });
        })
        .catch((error) => {
            console.log("ERROR", error);
            res.status(500).json({ success: false });
        });
});

//hellooooo??
app.listen(process.env.PORT || 8080);
