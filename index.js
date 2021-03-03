require("dotenv").config();

const { json } = require("express");
const cors = require('cors');
const express = require("express");
const Joi = require("joi");
const MongoClient = require('mongodb').MongoClient;

const app = express();
const router = express.Router();
const port = 3000;

app.use(express.json());
app.use('/', express.static('static'));
app.use(cors());

const uri = "mongodb+srv://node:" + process.env.DB_PASSWORD_SECRET + "@uwo-se.0zbtu.mongodb.net/SE3350-TA-Course-Matching?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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

router.route('/getcourses')
	.get((req, res) => {
		return mongoClient.connect().then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("courses").find();

			// return promise that checks if that course exists
			return new Promise((resolve, reject) => {
				let courses = [];
				collection.forEach(e => {
					if (e.requires) {
						courses.push(e)
					}
				},
					() => {
						collection.close();
						resolve(courses);
					});
			})
				.then((result) => {
					return res.status(200).send(result)
				})
		})
	});

router.route('/coursehours')
	// post course hours
	.post((req, res) => {
		// sanitize body with schema
		const schema = Joi.object({
			course: Joi.string().trim().required(),
			prevHours: Joi.number().required(),
			prevEnrol: Joi.number().required(),
			enrol: Joi.number().required()
		});
		const result = schema.validate(req.body);

		if (result.error) return res.status(400).send(result.error); //.error.details[0].message)

		let hours = (req.body.prevHours / req.body.prevEnrol) * req.body.enrol;

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

					newCourse.hours = hours;

					return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").deleteOne({ _id: result._id }).then(() => {
						return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(newCourse).then(() => {
							return res.status(200).send(req.body);
						});
					});
				})
				.catch(() => {
					// if course NOT exist

					let newCourse = req.body;

					newCourse.hours = hours;

					mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(newCourse);

					return res.status(200).send(req.body);
				});

		})
	});

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

app.use('/api', router);

app.listen(port, () => console.log(`Listening on port ${port}...`));

router.route('/assign')
	.post((req, res) => {
		// TODO: matt - change to posting rankings
		// sanitize body with schema

		const schema = Joi.object({
			course: Joi.string().trim().required(),
			name: Joi.string().trim().required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		return mongoClient.connect().then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("assigned-applicants").find();

			// check course is not assigned
			return new Promise((resolve, reject) => {

				collection.forEach(e => {
					if (e.course.toLowerCase() === req.body.course.toLowerCase()) {
						reject();
					}
				},
					() => {
						collection.close();
						resolve();
					});
			})
				.then(() => {
					// assign course

					let newCourse = result;

					newCourse.questions = req.body.questions;

					return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").deleteOne({ _id: result._id }).then(() => {
						return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(newCourse).then(() => {
							return res.status(200).send(req.body);
						});
					});
				})
				.catch(() => {
					// course has been assigned already
					return res.status(400).send("Course/applicant is already assigned");
				});
		})
	})

router.route('/applicant-rankings/:name')
	.get((req, res) => {

		return mongoClient.connect().then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("applicant-rankings").find();

			return new Promise((resolve, reject) => {

				collection.forEach(e => {
					if (e.name.toLowerCase() === req.params.name.toLowerCase()) {
						resolve(e);
					}
				},
					() => {
						collection.close();
						reject();
					});
			})
				.then(result => {

					function checkAssigned(courses) {
						// check if applicant is already assigned
						let assignees = mongoClient.db("SE3350-TA-Course-Matching").collection("assigned-applicants").find();
						let assigned = [];
						return new Promise((resolve, reject) => {
							assignees.forEach(e => {
								for (let course of courses) {
									if (e.course.toLowerCase() === course.toLowerCase()) {
										assigned.push(true);
									}
									else assigned.push(false);
								}
							},
								() => {
									collection.close();
									resolve(assigned);
								});
						});
					}

					return checkAssigned(result.appliedCourses).then(assigned => {

						let applicants = [];
						for (let i = 0; i < result.appliedCourses.length; i++) {

							let a = {
								name: result.appliedCourses[i],
								assigned: assigned[i]
							}

							applicants.push(a);
						}
						return res.status(200).send(JSON.stringify(applicants));

					})
				})
				.catch(err => {
					console.log(err)
					return res.status(404).send("Course not found");
				});
		})
	})
	.post((req, res) => {

	})

router.route('/instructor-rankings/:course')
	.get((req, res) => {

		return mongoClient.connect().then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("instructor-rankings").find();

			return new Promise((resolve, reject) => {

				collection.forEach(e => {
					if (e.course.toLowerCase() === req.params.course.toLowerCase()) {
						resolve(e);
					}
				},
					() => {
						collection.close();
						reject();
					});
			})
				.then((result) => {

					function checkAssigned(names) {
						// check if applicant is already assigned
						let assignees = mongoClient.db("SE3350-TA-Course-Matching").collection("assigned-applicants").find();
						let assigned = [];
						return new Promise((resolve, reject) => {
							assignees.forEach(e => {
								for (let name of names) {
									if (e.name.toLowerCase() === name.toLowerCase()) {
										assigned.push(true);
									}
									else assigned.push(false);
								}
							},
								() => {
									collection.close();
									resolve(assigned);
								});
						});
					}


					return checkAssigned(result.rankings).then(assigned => {

						let applicants = [];
						for (let i = 0; i < result.rankings.length; i++) {

							let a = {
								name: result.rankings[i],
								assigned: assigned[i]
							}

							applicants.push(a);
						}
						return res.status(200).send(JSON.stringify(applicants));

					})
				})
				.catch(() => {
					return res.status(404).send("Course not found");
				});
		})
	})
	.post((req, res) => {
		// TODO: matt - change to posting rankings
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

// req.body format = { course: "some-course", qualifications: "some text here" }
router.route('/courses-insert-qualifications')
	.post((req, res) => {

		// sanitize body with schema
		const schema = Joi.object({
			course: Joi.string().trim().required(),
			qualifications: Joi.string().trim().required()
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

					newCourse.qualifications = req.body.qualifications;

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
	});