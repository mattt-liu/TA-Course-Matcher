require("dotenv").config();

const { json } = require("express");
const cors = require('cors');
const express = require("express");
const Joi = require("joi");
const MongoClient = require('mongodb').MongoClient;
const { resolve } = require("path");

const app = express();
const router = express.Router();
const port = 3000;

app.use(express.json());
app.use('/', express.static('static'));
app.use(cors());

const uri = "mongodb+srv://node:" + process.env.DB_PASSWORD_SECRET + "@uwo-se.0zbtu.mongodb.net/SE3350-TA-Course-Matching?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = "SE3350-TA-Course-Matching";

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
		// TODO: redo to encorporate hours calculation

		let course = req.params.course.toUpperCase();

		return mongoClient.connect().then(() => {
			// get instructor rankings
			return mongoClient.db(dbName).collection("instructor-rankings").findOne({ course }).then(instRankings => {
				// get course's hours
				return mongoClient.db(dbName).collection("courses").findOne({ course }).then(courseObject => {
					// check course is not fully assigned (i.e. total = 10 hours, assigned = 5 hours)
					let courseHours = mongoClient.db(dbName).collection("assigned").find({ course });
					return new Promise((resolve, reject) => {
						let hoursAssigned = 0;
						courseHours.forEach(e => {
							hoursAssigned += e.hours;
						}, () => {
							courseHours.close();
							let totalHours = courseObject.hours;
							if (hoursAssigned >= totalHours) reject();
							else resolve(hoursAssigned);
						});
					}).then(courseHoursAssigned => {
						// get applicants' assigned hours
						let promises = [];
						for (let i = 0; i < instRankings.rankings.length; i++) {
							let p = mongoClient.db(dbName).collection("assigned").findOne({ name: instRankings.rankings[i] });
							promises.push(p);
						}
						return Promise.all(promises).then(appHours => {
							// get applicants' total hours 
							let promises2 = [];
							for (let i = 0; i < instRankings.rankings.length; i++) {
								let name = instRankings.rankings[i];
								let p = mongoClient.db(dbName).collection("applicant-rankings").findOne({ name: name });
								promises2.push(p);
							}
							return Promise.all(promises2).then(appTotHours => {
								// determine if applicants have hours remaining to be assigned

								let appHoursLeft = []
								for (let i = 0; i < appTotHours.length; i++) {
									let hoursLeft = 0;
									if (appHours[i]) {
										hoursLeft = appTotHours[i].hours - appHours[i].hours;
									}
									else hoursLeft = appTotHours[i].hours;
									let applicant = {
										name: instRankings.rankings[i],
										hoursLeft: hoursLeft
									}
									appHoursLeft.push(applicant);
								}
								return res.status(200).send(appHoursLeft);
							})
						})
					})
				})
			})
		})
	})
	.post((req, res) => {
		// TODO: matt - change to posting rankings
		// sanitize body with schema

		const schema = Joi.object({
			name: Joi.string().trim().max(64).required(),
			hours: Joi.number().integer().min(0).required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		let course = req.params.course.toUpperCase();
		return mongoClient.connect().then(() => {
			// get instructor rankings
			return mongoClient.db(dbName).collection("instructor-rankings").findOne({ course }).then(instRankings => {
				// get course's hours
				return mongoClient.db(dbName).collection("courses").findOne({ course }).then(courseObject => {
					// check course is not fully assigned (i.e. total = 10 hours, assigned = 5 hours)
					let courseHours = mongoClient.db(dbName).collection("assigned").find({ course });
					return new Promise((resolve, reject) => {
						let hoursAssigned = 0;
						courseHours.forEach(e => {
							hoursAssigned += e.hours;
						}, () => {
							courseHours.close();
							let totalHours = courseObject.hours;
							if (hoursAssigned >= totalHours) reject();
							else resolve(hoursAssigned);
						});
					}).then(courseHoursAssigned => {
						// get applicants' assigned hours
						let promises = [];
						for (let i = 0; i < instRankings.rankings.length; i++) {
							let p = mongoClient.db(dbName).collection("assigned").findOne({ name: instRankings.rankings[i] });
							promises.push(p);
						}
						return Promise.all(promises).then(appHours => {
							// get applicants' total hours 
							let promises2 = [];
							for (let i = 0; i < instRankings.rankings.length; i++) {
								let name = instRankings.rankings[i];
								let p = mongoClient.db(dbName).collection("applicant-rankings").findOne({ name: name });
								promises2.push(p);
							}
							return Promise.all(promises2).then(appTotHours => {
								// determine if applicants have hours remaining to be assigned

								let appHoursLeft = []
								for (let i = 0; i < appTotHours.length; i++) {
									let hoursLeft = 0;
									if (appHours[i]) {
										hoursLeft = appTotHours[i].hours - appHours[i].hours;
									}
									else hoursLeft = appTotHours[i].hours;
									let applicant = {
										name: instRankings.rankings[i],
										hoursLeft: hoursLeft
									}
									appHoursLeft.push(applicant);
								}

								let assignedApp = appHoursLeft.find(e => e.name.toLowerCase() === req.body.name.toLowerCase());

								if (!assignedApp) return res.status(404).send("Applicant not found!");
								if (assignedApp.hoursLeft == 0) return res.status(400).send("Applicant already assigned!");
								if (req.body.hours > assignedApp.hoursLeft) return res.status(400).send("Applicant insufficient hours!");

								return mongoClient.db(dbName).collection("assigned").findOne({name: assignedApp.name, course: course}).then(checkAssigned => {

									// insert if it does not exist
									if (!checkAssigned) {
										let newAssignee = req.body;
										newAssignee.course = course;
										return mongoClient.db(dbName).collection("assigned").insertOne(newAssignee).then(() => {
											return res.status(200).send(newAssignee);
										});
									}
									// update if it does exist
									else {
										let newAssignee = req.body;
										newAssignee.course = course;
										newAssignee.hours += assignedApp.hoursLeft;
										return mongoClient.db(dbName).collection("assigned").deleteOne({ _id: checkAssigned._id }).then(() => {
											return mongoClient.db(dbName).collection("assigned").insertOne(newAssignee).then(() => {
												return res.status(200).send(newAssignee);
											});
										});
									}
								})
							})
						})
					})
				})
			})
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