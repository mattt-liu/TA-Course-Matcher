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
		// course questions

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

router.route('/add-applicants')
	.post((req, res) => {
		// add applicant answers 
		const schema = Joi.array().items(Joi.object({
			course: Joi.string().min(4).required(),
			name: Joi.string().required(),
			email: Joi.string().required(),
			status: Joi.number().required(),
			hours: Joi.number().required(),
			ranking: Joi.number().required(),
			answers: Joi.array().items(Joi.string().required()).required()
		})).required();
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		mongoClient.connect().then(() => {
			// combine apps into array of apps
			let combinedApps = [];
			for (let row of req.body) {
				let newApp = {
					name: row.name,
					email: row.email,
					hours: row.hours,
					status: row.status,
					answers: [],
					appliedCourses: []
				}
				// get index of existing applicnat
				let index = undefined;
				for (let j = 0; j < combinedApps.length; j++) {
					// console.log(combinedApps[j].name, row.name, combinedApps[j].name === row.name);
					if (combinedApps[j].name === row.name) {
						index = j;
						break;
					}
				}
				// applicant does not exist
				if (index === undefined) {
					newApp.appliedCourses[row.ranking - 1] = row.course;
					newApp.answers[row.ranking - 1] = row.answers;
					combinedApps.push(newApp);
				}
				// applicant exists
				else {
					let app = combinedApps[index];
					newApp.appliedCourses = app.appliedCourses;
					newApp.answers = app.answers;
					newApp.hours = app.hours;

					newApp.appliedCourses[row.ranking - 1] = row.course;
					newApp.answers[row.ranking - 1] = row.answers;
					newApp.hours += row.hours;

					combinedApps[index] = newApp;
				}
			}

			// find and replace
			let promises = [];
			for (let app of combinedApps) {
				promises.push(mongoClient.db(dbName).collection("applicant-rankings").findOne({ name: app.name }));
			}

			Promise.all(promises).then(applicants => {
				for (let i = 0; i < applicants.length; i++) {
					// applicant does not exist
					if (!applicants[i]) {
						mongoClient.db(dbName).collection("applicant-rankings").insertOne(combinedApps[i]);
					}
					// applicant exists
					else {
						mongoClient.db(dbName).collection("applicant-rankings").deleteOne({ _id: applicants[i]._id }).then(() => {
							mongoClient.db(dbName).collection("applicant-rankings").insertOne(combinedApps[i]);
						});
					}
				}
			});
			res.status(200).send();
		})

		res.status(200).send(req.body);
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

		let name = req.params.name.substr(0, 1).toUpperCase() + req.params.name.substr(1).toLowerCase(); // format name

		return mongoClient.connect().then(() => {
			// get applicant's rankings
			return mongoClient.db(dbName).collection("applicant-rankings").findOne({ name }).then(appRankings => {
				if (!appRankings) return res.status(400).send("Not a valid applicant!")
				// check applicant has hours left (i.e. total = 10 hours, assigned = 5 hours)
				let appHours = mongoClient.db(dbName).collection("assigned").find({ name });
				return new Promise((resolve, reject) => {
					let hoursAssigned = 0;
					appHours.forEach(e => {
						hoursAssigned += e.hours;
					}, () => {
						appHours.close();
						let totalHours = appRankings.hours;
						if (hoursAssigned >= totalHours) reject();
						else resolve(hoursAssigned);
					});
				}).then(appHoursAssigned => {
					// get courses' total hours
					let promises = [];
					for (let i = 0; i < appRankings.appliedCourses.length; i++) {
						let p = mongoClient.db(dbName).collection("courses").findOne({ course: appRankings.appliedCourses[i].toUpperCase() });
						promises.push(p);
					}
					return Promise.all(promises).then(courseTotHours => {
						// get courses' assigned hours 
						let promises2 = [];
						for (let i = 0; i < appRankings.appliedCourses.length; i++) {
							let name = appRankings.appliedCourses[i];
							let p = mongoClient.db(dbName).collection("assigned").find({ course: appRankings.appliedCourses[i].toUpperCase() });
							promises2.push(p);
						}
						return Promise.all(promises2).then(courseHours => {
							// determine if applicants have hours remaining to be assigned

							let courseHoursLeft = []
							for (let i = 0; i < courseTotHours.length; i++) {
								let p = new Promise((resolve, reject) => {
									if (courseHours[i]) {
										let hoursAlreadyUsed = 0;
										courseHours[i].forEach(e => {
											hoursAlreadyUsed += e.hours;
										}, () => {
											let hoursLeft = courseTotHours[i].hours - hoursAlreadyUsed;
											let applicant = {
												course: appRankings.appliedCourses[i],
												hoursLeft: hoursLeft
											}
											resolve(applicant);
										})
									}
									else {
										let hoursLeft = courseTotHours[i].hours;
										let applicant = {
											course: appRankings.rankings[i],
											hoursLeft: hoursLeft
										}
										resolve(applicant);
									}
								})
								courseHoursLeft.push(p);
							}

							return Promise.all(courseHoursLeft).then(courseHoursLeft => {
								return res.status(200).send(courseHoursLeft);
							})
						})
					})
				}).catch(() => res.status(400).send("Applicant fully assigned!"));
			})
		})
	})
	.post((req, res) => {
		const schema = Joi.object({
			course: Joi.string().trim().max(64).required(),
			hours: Joi.number().integer().min(0).required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		let name = req.params.name.substr(0, 1).toUpperCase() + req.params.name.substr(1).toLowerCase(); // format name

		return mongoClient.connect().then(() => {
			// get applicant's rankings
			return mongoClient.db(dbName).collection("applicant-rankings").findOne({ name }).then(appRankings => {
				// check applicant has hours left (i.e. total = 10 hours, assigned = 5 hours)
				let appHours = mongoClient.db(dbName).collection("assigned").find({ name });
				return new Promise((resolve, reject) => {
					let hoursAssigned = 0;
					appHours.forEach(e => {
						hoursAssigned += e.hours;
					}, () => {
						appHours.close();
						let totalHours = appRankings.hours;
						if (hoursAssigned >= totalHours) reject();
						else resolve(hoursAssigned);
					});
				}).then(appHoursAssigned => {
					// get courses' total hours
					let promises = [];
					for (let i = 0; i < appRankings.appliedCourses.length; i++) {
						let p = mongoClient.db(dbName).collection("courses").findOne({ course: appRankings.appliedCourses[i].toUpperCase() });
						promises.push(p);
					}
					return Promise.all(promises).then(courseTotHours => {
						// get courses' assigned hours 
						let promises2 = [];
						for (let i = 0; i < appRankings.appliedCourses.length; i++) {
							let name = appRankings.appliedCourses[i];
							let p = mongoClient.db(dbName).collection("assigned").find({ course: appRankings.appliedCourses[i].toUpperCase() });
							promises2.push(p);
						}
						return Promise.all(promises2).then(courseHours => {
							// determine if applicants have hours remaining to be assigned

							let courseHoursLeft = []
							for (let i = 0; i < courseTotHours.length; i++) {
								let p = new Promise((resolve, reject) => {
									if (courseHours[i]) {
										let hoursAlreadyUsed = 0;
										courseHours[i].forEach(e => {
											hoursAlreadyUsed += e.hours;
										}, () => {
											let hoursLeft = courseTotHours[i].hours - hoursAlreadyUsed;
											let applicant = {
												course: appRankings.appliedCourses[i],
												hoursLeft: hoursLeft
											}
											resolve(applicant);
										})
									}
									else {
										let hoursLeft = courseTotHours[i].hours;
										let applicant = {
											course: appRankings.rankings[i],
											hoursLeft: hoursLeft
										}
										resolve(applicant);
									}
								})
								courseHoursLeft.push(p);
							}

							return Promise.all(courseHoursLeft).then(courseHoursLeft => {
								let assignedCourse = courseHoursLeft.find(e => e.course.toLowerCase() === req.body.course.toLowerCase());

								if (!assignedCourse) return res.status(404).send("Course not found!");
								if (assignedCourse.hoursLeft == 0) return res.status(400).send("Course already assigned!");
								if (req.body.hours > assignedCourse.hoursLeft) return res.status(400).send("Course insufficient hours!");

								return mongoClient.db(dbName).collection("assigned").findOne({ name: name, course: assignedCourse.course.toUpperCase() }).then(checkAssigned => {

									// insert if it does not exist
									if (!checkAssigned) {
										let newAssignee = req.body;
										newAssignee.name = name;
										return mongoClient.db(dbName).collection("assigned").insertOne(newAssignee).then(() => {
											return res.status(200).send(newAssignee);
										});
									}
									// update if it does exist
									else {
										let newAssignee = req.body;
										newAssignee.name = name;
										newAssignee.hours += checkAssigned.hours;
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
				})//.catch(() => res.status(400).send("Applicant fully assigned!"));
			})
		})
	})

router.route('/instructor-rankings/:course')
	.get((req, res) => {

		let course = req.params.course.toUpperCase();

		return mongoClient.connect().then(() => {
			// get instructor rankings
			return mongoClient.db(dbName).collection("instructor-rankings").findOne({ course }).then(instRankings => {
				if (!instRankings) return res.status(404).send("Course not found");
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
							let p = mongoClient.db(dbName).collection("assigned").find({ name: instRankings.rankings[i] });
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
									let p = new Promise((resolve, reject) => {
										if (appHours[i]) {
											let hoursAlreadyUsed = 0;
											appHours[i].forEach(e => {
												hoursAlreadyUsed += e.hours;
											}, () => {
												let hoursLeft = appTotHours[i].hours - hoursAlreadyUsed;
												let applicant = {
													name: instRankings.rankings[i],
													hoursLeft: hoursLeft,
													status: appTotHours[i].status,
												}
												resolve(applicant);
											})
										}
										else {
											let hoursLeft = appTotHours[i].hours;
											let applicant = {
												name: instRankings.rankings[i],
												hoursLeft: hoursLeft,
												status: appTotHours[i].status,
											}
											resolve(applicant);
										}
									})
									appHoursLeft.push(p);
								}
								return Promise.all(appHoursLeft).then(hoursLeft => {
									return res.status(200).send(hoursLeft);
								})
							})
						})
					})
						.catch(() => res.status(400).send("Course is fully assigned!"));
				})
			})
		})
	})
	.post((req, res) => {
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
				if (!instRankings) return res.status(404).send("Course not found");
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
							let p = mongoClient.db(dbName).collection("assigned").find({ name: instRankings.rankings[i] });
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
									let p = new Promise((resolve, reject) => {
										if (appHours[i]) {
											let hoursAlreadyUsed = 0;
											appHours[i].forEach(e => {
												hoursAlreadyUsed += e.hours;
											}, () => {
												let hoursLeft = appTotHours[i].hours - hoursAlreadyUsed;
												let applicant = {
													name: instRankings.rankings[i],
													hoursLeft: hoursLeft
												}
												resolve(applicant);
											})
										}
										else {
											let hoursLeft = appTotHours[i].hours;
											let applicant = {
												name: instRankings.rankings[i],
												hoursLeft: hoursLeft
											}
											resolve(applicant);
										}
									})
									appHoursLeft.push(p);
								}
								return Promise.all(appHoursLeft).then(appHoursLeft => {
									let assignedApp = appHoursLeft.find(e => e.name.toLowerCase() === req.body.name.toLowerCase());

									if (!assignedApp) return res.status(404).send("Applicant not found!");
									if (assignedApp.hoursLeft == 0) return res.status(400).send("Applicant already assigned!");
									if (req.body.hours > assignedApp.hoursLeft) return res.status(400).send("Applicant insufficient hours!");

									return mongoClient.db(dbName).collection("assigned").findOne({ name: assignedApp.name, course: course }).then(checkAssigned => {

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
											newAssignee.hours += checkAssigned.hours;
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
						.catch(() => res.status(400).send("Course is fully assigned!"));
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
router.route('/getquestions')
	.get((req, res) => {
		return mongoClient.connect().then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("courses").find();

			// return promise that checks if that course exists
			return new Promise((resolve, reject) => {
				let courses = [];
				collection.forEach(e => {
					if (e.questions) {
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

	router.route('/getapplicants') //Get the applicants and their answers to each question
	.get((req, res) => {
		return mongoClient.connect().then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("applicant-rankings").find();

			// return promise that checks if that course exists
			return new Promise((resolve, reject) => {
				let applicants = [];
				collection.forEach(e => {
					if (true) {
						applicants.push(e)
					}
				},
					() => {
						collection.close();
						resolve(applicants);
					});
			})
				.then((result) => {
					return res.status(200).send(result)
				})
		})
	});