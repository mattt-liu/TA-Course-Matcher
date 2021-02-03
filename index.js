const { json } = require("express");
const express = require("express");
const Joi = require("joi");
const cors = require('cors');

const app = express();
const router = express.Router();
const port = 3000;

app.use(express.json());
app.use('/', express.static('static'));
app.use(cors());

// ######## logs ########
	app.use((req, res, next) => {
	    console.log(`${req.method} request for ${req.url}`);
	    next();
	});

// ######## routes ########

	router.route('/test')
	// get all courses
		.get((req, res) => {
			res.status(200).send("Hello world");
		})

app.use('/api', router);

app.listen(port, () => console.log(`Listening on port ${port}...`));