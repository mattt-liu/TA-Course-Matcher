require("dotenv").config();

const { json } = require("express");
const cors = require('cors');
const express = require("express");
const Joi = require("joi");
const MongoClient = require('mongodb').MongoClient;
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const app = express();
const router = express.Router();
const port = 3000;

app.use(express.json());
app.use(express.static('static'));
app.use(cors());

const uri = "mongodb+srv://node:" + process.env.DB_PASSWORD_SECRET + "@uwo-se.0zbtu.mongodb.net/SE3350-TA-Course-Matching?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/* sample code

client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

*/

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


router.route('/courses-ml')
	.post((req, res) => {

		// sanitize body with schema
		const schema = Joi.object({
			course: Joi.string().trim().required(),
			questions: Joi.array().items(Joi.string()).required()
		});
		const result = schema.validate(req.body);

		if (result.error) return res.status(400).send(result.error); //.error.details[0].message)

		return mongoClient.connect().then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("courses").find();

			// return promise that checks if that course exists
			return new Promise((resolve, reject) => {

				collection.forEach(e => {
					if (e.course.toLowerCase() === req.body.course.toLowerCase()) {
						resolve(e);
					}
				},
					() => {
						collection.close();
						reject();
					});
			})
				.then((result) => {
					// if course exists

					let newCourse = result;

					newCourse.questions = req.body.questions;

					return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").deleteOne({ _id: result._id }).then(() => {
						return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(newCourse).then(() => {
							return res.status(200).send(req.body);
						});
					});
				})
				.catch(() => {
					// if course NOT exist
					mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(req.body);

					return res.status(200).send(req.body);
				});

		})
	})

	router.route('/coursehours')
	// get all courses
		.get((req, res) => {
			
			let hours = 5;
			let prevHours = 10;
			let prevEnrol = 2;
			let enrol = 5;

			function calcHours() {

				hours = (prevHours/prevEnrol)*enrol;
			}
			
			return hours;

			res.status(200).send("Hello world");
		})

app.use('/api', router);

app.use((req, res) => {
	res.status(404).send("Page not found!");
});

app.listen(port, () => console.log(`Listening on port ${port}...`));