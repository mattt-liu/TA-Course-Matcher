require("dotenv").config();

const { json } = require("express");
const cors = require('cors');
const express = require("express");
const Joi = require("joi");
const MongoClient = require('mongodb').MongoClient;
const { resolve } = require("path");
const auth = require("./auth");

const app = express();
const router = express.Router();
const port = 3000;

app.use(express.json());
app.use('/', express.static('static'));
app.use(cors());

const uri = "mongodb+srv://node:" + process.env.DB_PASSWORD_SECRET + "@uwo-se.0zbtu.mongodb.net/SE3350-TA-Course-Matching?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoConnection = mongoClient.connect();
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
		return res.status(200).send("Hello world");
	})

router.route('/getcourses')
	.get((req, res) => {
		return mongoConnection.then(() => {
			return mongoClient.db(dbName).collection("courses").find().toArray().then((result) => {
				let newResults = []
				// remove "_id" property
				for (let r of result) {
					r._id = undefined;
					newResults.push(r);
				}
				return res.status(200).send(newResults);
			})
		})
	})
	// change if a course "requires" TA's
	.post((req, res) => {
		// course questions

		// sanitize body with schema
		const schema = Joi.object({
			course: Joi.string().trim().required(),
			requires: Joi.bool().required()
		});
		let result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);
		req.body.course = req.body.course.toUpperCase();

		return mongoConnection.then(() => {
			return mongoClient.db(dbName).collection("courses").findOne({ course: req.body.course }).then((result) => {
				// if course does NOT exist
				if (!result) {
					// add the course
					mongoClient.db(dbName).collection("courses").insertOne(req.body);
					return res.status(200).send(req.body);
				}
				// if course exists
				// modify the existing one
				let newCourse = result;
				newCourse.requires = req.body.requires;

				return mongoClient.db(dbName).collection("courses").deleteOne({ _id: result._id }).then(() => {
					return mongoClient.db(dbName).collection("courses").insertOne(newCourse).then(() => {
						return res.status(200).send(req.body);
					});
				});
			})
		})
	})

router.route('/coursehours')
	// post course hours
	.post((req, res) => {
		// sanitize body with schema
		const schema = Joi.object({
			course: Joi.string().trim().required(),
			previousHours: Joi.number().required(),
			previousEnroll: Joi.number().required(),
			currentEnroll: Joi.number().required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		let hours = Math.round((req.body.previousHours / req.body.previousEnroll) * req.body.currentEnroll);
		req.body.course = req.body.course.toUpperCase();

		return mongoConnection.then(() => {

			return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").findOne({ course: req.body.course })
				.then(result => {

					// if course NOT exist
					// add course
					if (!result) {

						let newCourse = req.body;
						newCourse.hours = hours;

						mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(newCourse);
						return res.status(200).send(req.body);
					}
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

		req.body.course = req.body.course.toUpperCase();

		return mongoConnection.then(() => {

			return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").findOne({ course: req.body.course }).then((result) => {

				if (!result) {
					// if course doest NOT exist
					mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(req.body);

					return res.status(200).send(req.body);
				}
				// if course exists

				let newCourse = result;

				// don't add duplicate questions
				let noDuplicates = []
				for (let q of req.body.questions) {
					if (!result.questions.includes(q)) noDuplicates.push(q);
				}
				newCourse.questions = newCourse.questions.concat(noDuplicates);

				return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").deleteOne({ _id: result._id }).then(() => {
					return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(newCourse).then(() => {
						return res.status(200).send(req.body);
					});
				});
			})
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

		mongoConnection.then(() => {
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
					newApp.hours = row.hours;

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

router.route("/login")
	.get(auth.authenticateToken, (req, res) => {

		return mongoConnection.then(() => {
			return mongoClient.db(dbName).collection("users").findOne({ email: req.user.email }).then(user => {
				if (!user.verified) return res.status(401).json({ "message": "User not verified!" })
				return res.status(200).json({ "email": user.email });
			});
		}).catch(err => {
			res.status(500).json(err);
			console.log(err);
		});
	})
	.post((req, res) => {
		let schema = Joi.object({
			email: Joi.string().trim().email({ tlds: { allow: false } }).max(256).required(), // tlds default is true (verifies with IANA list)
			password: Joi.string().required()
		});
		let result = schema.validate(req.body);
		if (result.error) return res.status(400).json(result.error);

		return mongoConnection.then(() => {
			return mongoClient.db(dbName).collection("users").findOne({ email: req.body.email }).then(user => {
				if (!user) return res.status(401).json({ message: "Email does not exist" });
				if (!user.verified) return res.status(401).json({ message: "User not verified!" });
				if (req.body.password !== user.password) return res.status(401).json({ message: "Incorrect password" });

				let token = auth.signToken({
					email: user.email,
					admin: user.admin,
					verified: user.verified
				});
				return res.status(200).json({ "accessToken": token });
			});
		}).catch(err => res.status(500).json(err));
	});

router.route("/signup")
	.post((req, res) => {

		// sanitize body with schema
		let schema = Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().required()
		});
		let result = schema.validate(req.body);
		if (result.error) return res.status(400).json(result.error);

		req.body.verified = false;
		req.body.admin = false;

		// check email does not exist
		return mongoConnection.then(() => {
			mongoClient.db(dbName).collection("users").findOne({ email: req.body.email }).then(user => {
				// reject if email exists 
				if (user) return res.status(400).json({ message: "E-mail already exists!" });
				mongoClient.db(dbName).collection("users").insertOne(req.body);
				return res.status(201).json({ message: "Success" });
			});
		});
	});

router.route("/users")
	.get(auth.authenticateToken, (req, res) => {
		// admin gets list of users

		// only admin access
		if (!req.user) return res.status(401).json({ message: "401: Unauthorized" });
		if (!req.user.admin) return res.status(403).json({ message: "403: Forbidden" });

		return mongoConnection.then(() => {
			let collection = mongoClient.db(dbName).collection("users").find();
			// create array of users
			return new Promise((resolve, reject) => {
				let users = [];
				collection.forEach(e => {
					let u = {
						email: e.email,
						admin: e.admin,
						verified: e.verified
					}
					users.push(u)
				}, () => {
					collection.close();
					resolve(users);
				})
			}).then(users => {
				// return array of users
				return res.status(200).json(users);
			});
		})
	})
	.post(auth.authenticateToken, (req, res) => {
		// admin can verify a user

		// only admin modify
		if (!req.user) return res.status(401).json({ message: "401: Unauthorized" });
		if (!req.user.admin) return res.status(403).json({ message: "403: Forbidden" });

		// sanitize body
		let schema = Joi.object({
			email: Joi.string().email().required(),
			verified: Joi.bool().required()
		});
		let result = schema.validate(req.body);
		if (result.error) return res.status(400).json(result.error);

		return mongoConnection.then(() => {
			return mongoClient.db(dbName).collection("users").findOne({ email: req.body.email }).then(user => {
				if (!user) return res.status(404).json({ message: "E-mail not found!" });

				let newUser = user;
				newUser.verified = req.body.verified;

				return mongoClient.db(dbName).collection("users").deleteOne({ _id: user._id }).then(() => {
					mongoClient.db(dbName).collection("users").insertOne(newUser);
					return res.status(200).json({ message: "Success" });
				});
			});
		})
	})

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

		return mongoConnection.then(() => {

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

		return mongoConnection.then(() => {
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

		return mongoConnection.then(() => {
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

		return mongoConnection.then(() => {
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

		return mongoConnection.then(() => {
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

		return mongoConnection.then(() => {

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
			}).then((result) => {
				if (!result) {
					// if course NOT exist
					mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(req.body);
					return res.status(200).send(req.body);
				}

				// if course exists
				let newCourse = result;
				newCourse.qualifications = req.body.qualifications;

				return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").deleteOne({ _id: result._id }).then(() => {
					return mongoClient.db("SE3350-TA-Course-Matching").collection("courses").insertOne(newCourse).then(() => {
						return res.status(200).send(req.body);
					});
				});
			})
		})
	});
router.route('/getquestions')
	.get((req, res) => {
		return mongoConnection.then(() => {

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
		return mongoConnection.then(() => {

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

//post TA Hours
router.route('/replaceTAhours')
	.post((req, res) => {

		const schema = Joi.object({
			name: Joi.string().trim().required(),
			hours: Joi.number().required(),
			course: Joi.string().trim().required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error); //.error.details[0].message)
		return mongoConnection.then(() => {
			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("assigned").find();

			// return promise that checks if that course exists
			return new Promise((resolve, reject) => {

				collection.forEach(e => {
					if (e.name.toLowerCase() === req.body.name.toLowerCase() && e.course.toLowerCase() === req.body.course.toLowerCase()) {
						resolve(e);
					}
				},
					() => {
						collection.close();
						reject();
					});
			})
				.then((result) => {
					// if TA exists
					let newTA = result;
					newTA.hours = req.body.hours;
					return mongoClient.db("SE3350-TA-Course-Matching").collection("assigned").deleteOne({ _id: result._id }).then(() => {
						return mongoClient.db("SE3350-TA-Course-Matching").collection("assigned").insertOne(newTA).then(() => {
							return res.status(200).send(req.body);
						});
					});
				})
				.catch(() => {
					// if TA NOT exist
					res.status(404).send('Not found');
				});
		})
	})


//get TA Hours

router.route('/getTAhours')
	.get((req, res) => {
		return mongoConnection.then(() => {

			let collection = mongoClient.db("SE3350-TA-Course-Matching").collection("assigned").find();


			return new Promise((resolve, reject) => {
				let TAs = [];
				collection.forEach(e => {

					TAs.push(e)

				},
					() => {
						collection.close();
						resolve(TAs);
					});
			})
				.then((result) => {
					return res.status(200).send(result)
				})
		})
	});

router.route('/course-data')
	.post((req, res) => {
		/**
		 * post course set up info
		 */

		// sanitize body 
		const schema = Joi.object({
			course: Joi.string().trim().required(),
			name: Joi.string().trim().required(),
			lectureHours: Joi.number().required(),
			labHours: Joi.number(),
			sections: Joi.number().required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		// format body
		if (!req.body.labHours) req.body.labHours = 0;
		req.body.course = req.body.course.trim().toUpperCase();
		req.body.name = req.body.name.trim().toUpperCase();

		return mongoConnection.then(() => {
			mongoClient.db(dbName).collection("courses").findOne({ course: req.body.course }).then(result => {

				// add if course does not exist
				if (!result) {
					mongoClient.db(dbName).collection("courses").insertOne(req.body);
					return res.status(200).json(req.body);
				}

				// update existing course 
				let newCourse = result;
				newCourse.name = req.body.name;
				newCourse.lectureHours = req.body.lectureHours;
				newCourse.labHours = req.body.labHours;
				newCourse.sections = req.body.sections;
				mongoClient.db(dbName).collection("courses").deleteOne({ _id: result._id }).then(() => {
					mongoClient.db(dbName).collection("courses").insertOne(newCourse);
					return res.status(200).json(req.body);
				});
			});
		});
	});

// add/modify instructors
router.route('/instructors')
	.get(auth.authenticateToken, (req, res) => {
		return mongoConnection.then(() => {
			return mongoClient.db(dbName).collection("instructor-rankings").find().toArray().then(data => {
				return res.status(200).send(data);
			});
		})
	})
	.post(auth.authenticateToken, (req, res) => {
		// sanitize body 
		const schema = Joi.object({
			instructor: Joi.string().trim().required(),
			course: Joi.string().trim().required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		// format body
		req.body.course = req.body.course.trim().toUpperCase();

		// save to database
		return mongoConnection.then(() => {
			mongoClient.db(dbName).collection("instructor-rankings").findOne({ instructor: req.body.instructor }).then(result => {

				// add if course does not exist
				if (!result) {
					mongoClient.db(dbName).collection("instructor-rankings").insertOne(req.body);
					return res.status(200).json(req.body);
				}

				// update existing course 
				let newInstructor = result;
				newInstructor.course = req.body.course;
				mongoClient.db(dbName).collection("instructor-rankings").deleteOne({ _id: result._id }).then(() => {
					mongoClient.db(dbName).collection("instructor-rankings").insertOne(newInstructor);
					return res.status(200).json(req.body);
				});
			});
		});
	})

router.route("/add-instructor")
	.post(auth.authenticateToken, (req, res) => {
		// sanitize body 
		const schema = Joi.object({
			instructor: Joi.string().trim().required(),
			email: Joi.string().email().required()
		});
		const result = schema.validate(req.body);
		if (result.error) return res.status(400).send(result.error);

		// save to database
		return mongoConnection.then(() => {
			mongoClient.db(dbName).collection("instructor-rankings").findOne({ instructor: req.body.instructor }).then(result => {

				// add if course does not exist
				if (!result) {
					mongoClient.db(dbName).collection("instructor-rankings").insertOne(req.body);
					return res.status(200).json(req.body);
				}

				// update existing course 
				let newInstructor = result;
				newInstructor.email = req.body.email;

				mongoClient.db(dbName).collection("instructor-rankings").deleteOne({ _id: result._id }).then(() => {
					mongoClient.db(dbName).collection("instructor-rankings").insertOne(newInstructor);
					return res.status(200).json(req.body);
				});
			});
		});
	})

// #########

app.use('/api', router);

app.listen(port, () => console.log(`Listening on port ${port}...`));