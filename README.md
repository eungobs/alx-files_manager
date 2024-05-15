Files Manager API

This repository contains an API for managing files and users. Below are the details of the tasks completed in this project along with instructions on how to run and use the API.

Tasks
0. Redis Utils
File: utils/redis.js
Description: Contains a class RedisClient for interacting with Redis.
Functionality:
Constructor for creating a Redis client.
isAlive() function to check if the connection to Redis is successful.
get(key) asynchronous function to retrieve a value from Redis based on the provided key.
set(key, value, duration) asynchronous function to set a value in Redis with an expiration time.
del(key) asynchronous function to delete a value from Redis based on the provided key.
1. MongoDB Utils
File: utils/db.js
Description: Contains a class DBClient for interacting with MongoDB.
Functionality:
Constructor for creating a MongoDB client.
isAlive() function to check if the connection to MongoDB is successful.
nbUsers() asynchronous function to get the number of documents in the users collection.
nbFiles() asynchronous function to get the number of documents in the files collection.
2. First API
File: server.js, routes/index.js, controllers/AppController.js
Description: Implements the first API endpoints using Express.
Endpoints:
GET /status returns the status of Redis and MongoDB.
GET /stats returns the number of users and files in the database.
3. Create a New User
File: routes/index.js, controllers/UsersController.js
Description: Adds an endpoint to create a new user in the database.
Endpoint:
POST /users creates a new user in the database with email and password.
4. Authenticate a User
File: routes/index.js, controllers/AuthController.js
Description: Implements user authentication and token generation.
Endpoints:
GET /connect signs in the user and generates an authentication token.
GET /disconnect signs out the user and deletes the token.
GET /users/me retrieves user information based on the token.
5. First File
File: routes/index.js, controllers/FilesController.js
Description: Adds functionality to upload files to the server and store them in the database.
Endpoint:
POST /files uploads a new file to the server and stores its metadata in the database.
6. Get and List Files
File: routes/index.js, controllers/FilesController.js
Description: Implements endpoints to retrieve and list files.
Endpoints:
GET /files/:id retrieves file metadata based on the ID.
GET /files retrieves a list of files based on pagination and parentId.
7. File Publish/Unpublish
File: routes/index.js, controllers/FilesController.js
Description: Adds functionality to publish or unpublish files.
Endpoints:
PUT /files/:id/publish sets a file to be public.
PUT /files/:id/unpublish sets a file to be private.
8. File Data
File: routes/index.js, controllers/FilesController.js
Description: Implements an endpoint to retrieve file data.
Endpoint:
GET /files/:id/data retrieves the content of a file based on the ID.
9. Image Thumbnails
Description: Generates thumbnails for images uploaded to the server.
Background Processing: Thumbnail generation is processed in the background using Bull queue.
Worker: A worker process (worker.js) is responsible for generating thumbnails.
Endpoint Update: Updated GET /files/:id/data endpoint to accept a query parameter for thumbnail size.
Setup and Usage
Clone the repository:

git clone https://github.com/<username>/alx-files_manager.git
Install dependencies:

cd alx-files_manager
npm install
Set environment variables (if necessary).

Start the server:

npm run start-server
Use the API endpoints as described above.
Requirements
Node.js
MongoDB
Redis
npm
curl (for testing)
Author
