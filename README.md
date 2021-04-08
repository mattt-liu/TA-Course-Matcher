# TA-Course Matching App
This web app is designed for instructors and department chair to use. It allows for a seamless TA application process that requires no interaction from the applicants. The app allows for file uploads that will automatically parse the data and produce a recommended applicant for each course.

## About
The app uses the MEAN technology stack and multiple different Node packages. For more information ask the contributors for documentation.
 - MongoDB - to store our non-relational data allowed for easy accessing and inserting of data.
 - Express.js - to create the back-end API for different endpoints.
 - Angular - to create our UI and front-end site.
 - Node.js - to run the environment for our Express.js API server.

## System Requirements

- Latest version of [Node.js](https://nodejs.org/en/)
- Latest version of [Git](https://git-scm.com/downloads)
- MongoDB database key environment variable (submitted on [OWL](https://owl.uwo.ca/portal/site/b66e33a5-bacd-4463-9d40-0b37819318df/tool/ad219718-a71f-4c97-9638-102595ad86f9?panel=Main))

## Installation
Clone the repository in the command line or downloading the via the zip file.
```bash
git clone https://github.com/mattt-liu/SE3350-TA-Course-Matching.git
```

Use package manager [NPM](https://www.npmjs.com/get-npm) to install all dependencies.
```node
npm install
```

Create the environment variable to access the database.
```bash
cat > .env
DB_PASSWORD_SECRET=YourDatabaseKeyHere
```

## Usage
Run the app on your local machine. Using the default port 3000.
```node
node index
```

Go to [localhost](http://localhost:3000) on your browser to use the app.

## Team
This app would not be possible without the hardworking members of Team 6 - "Blue Cheese"

A special thanks to:
- [Ethan Miranda](https://github.com/emiranda2)
- [Marcus Del Vecchio](https://github.com/MarcusDelvecchio)
- [Matthew Liu](https://github.com/mattt-liu)
- [Stephen Idugboe](https://github.com/sidugboe)