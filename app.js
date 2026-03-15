require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
let mongoose = require("mongoose");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var rolesRouter = require("./routes/roles");

var app = express();

function isTruthy(value) {
    return ["1", "true", "yes", "on"].includes(
        String(value || "").toLowerCase(),
    );
}

function getMongoUri() {
    if (process.env.MONGODB_URI) {
        return process.env.MONGODB_URI;
    }

    if (process.env.LOCAL_MONGODB_URI) {
        return process.env.LOCAL_MONGODB_URI;
    }

    let username = process.env.DB_USERNAME || "quan";
    let password = process.env.DB_PASSWORD;
    let cluster = process.env.DB_CLUSTER || "cluster0.dszx297.mongodb.net";
    let dbName = process.env.DB_NAME || "test";

    if (!password) {
        return "mongodb://127.0.0.1:27017/ntptudm_1003";
    }

    return `mongodb+srv://${username}:${encodeURIComponent(password)}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
}

async function connectToDatabase() {
    if (isTruthy(process.env.SKIP_DB)) {
        console.warn("Skipping MongoDB connection because SKIP_DB is enabled.");
        return;
    }

    let mongoUri = getMongoUri();
    let fallbackMongoUri = process.env.MONGODB_URI_FALLBACK;

    if (!mongoUri) {
        console.error(
            "MongoDB config is missing. Set MONGODB_URI, LOCAL_MONGODB_URI, or Atlas variables in .env",
        );
        return;
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            family: 4,
        });
        console.log("connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.error(
            "If you are using MongoDB Compass with local MongoDB, make sure the MongoDB service is running. If you are using Atlas, verify IP allowlist, cluster status, and TLS/network access.",
        );

        if (fallbackMongoUri) {
            try {
                await mongoose.connect(fallbackMongoUri, {
                    serverSelectionTimeoutMS: 5000,
                    family: 4,
                });
                console.log("connected to fallback database");
                return;
            } catch (fallbackError) {
                console.error(
                    "Fallback MongoDB connection failed:",
                    fallbackError.message,
                );
            }
        }
    }
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/roles", rolesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/roles", rolesRouter);
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/categories", require("./routes/categories"));

mongoose.connection.on("disconnected", () => {
    console.log("disconnected");
});
mongoose.connection.on("error", (error) => {
    console.error("MongoDB error:", error.message);
});

connectToDatabase();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
