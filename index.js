const { json } = require("express");
const express = require("express");
const Joi = require("joi");
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const app = express();
const router = express.Router();
const port = 3000;

app.use(express.json());
app.use('/', express.static('static'));
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
					// if course exists

					
					return res.status(200).send(result)
				})
				

		})
	})

app.use('/api', router);

app.listen(port, () => console.log(`Listening on port ${port}...`));