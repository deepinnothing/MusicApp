__MusicApp__ is a modern music streaming-like application made by @deepinnothing, @helena-kaszubowska and @SzymSw as a study project at the University of Gdańsk. The primary features are:
- Browsing and searching for music albums
- User authentication and authorization
- Personal music library management
- Role-based access control (admin/user)
- Adding/removing albums and tracks to/from the personal library

The backend is a REST API developed using ASP.NET MVC (C#), MongoDB, and JWT-based authentication. The API provides functionalities to manage users, music tracks, and albums, supporting operations like data retrieval, user authentication, and resource management.

The frontend is based on the React and Tailwind CSS frameworks ([click here for more information](https://github.com/deepinnothing/MusicApp/tree/master/music-app-frontend#readme)). Note that not every endpoint is implemented in the frontend app.

The application's API uses environment variables for configuration. They can be changed in `Properties/launchSettings.json`

The API is organized into the following key components:
- Models
  -  Contain object representations of entities stored in the MongoDB database.
  -  These classes define the schema and relationships of data within the system.
- Controllers
  -  Map the API routes to specific HTTP methods (GET, POST, PUT, PATCH, DELETE, etc.)
  -  Include classes and methods that handle the logic for incoming requests.
  -  Controllers process input, interact with the data layer (via Models), and return appropriate responses.
  -  Act as the interface layer between the frontend client and the API logic.
- Services
  -  Abstract some API logic to avoid boilerplate in the controllers and facilitate the proccess of separating this logic into another project if necessary

The API includes two separate projects which communicate with each other through the RabbitMQ service:
- __MusicAppAPI__ - the primary project that is responsible for most essential functions of the app.
- __MusicAppAnalytics__ - provides some analytics through the RabbitMQ service, for example, the number of album views and the number of track downloads.

## API Endpoints
On local host use: `http://localhost:5064/api/` or `https://localhost:7074/api/` (`http://localhost:5048/api/` for __MusicAppAnalytics__)

### User-related
| Method | Route                   | Description                                     | Access Level    |
|--------|-------------------------|-------------------------------------------------|-----------------|
| POST   | /sign-up                | registers new users                             | Everyone        |
| POST   | /sign-in                | logins into user account                        | Everyone        |
| PATCH  | /user/give-admin-rights | grants a user admin rights by email             | Admin           |

### Album-related
| Method | Route                  | Description                                      | Access Level    |
|--------|------------------------|--------------------------------------------------|-----------------|
| GET    | /albums                | returns an array of all the albums               | Everyone        |
| GET    | /albums/{id}           | returns an album by id                           | Everyone        |
| PUT    | /albums/{id}           | updates (replaces) album info specified by id    | Admin           |
| POST   | /albums/               | adds a new album and returns its URI             | Admin           |
| DELETE | /albums/{id}           | deletes the album specified by id                | Admin           |
| GET    | /albums/search?{query=}| searches for albums and artists with names that start with {query} | Everyone        |

### Track-related
| Method | Route                  | Description                                      | Access Level    |
|--------|------------------------|--------------------------------------------------|-----------------|
| GET    | /tracks                | returns an array of all the tracks               | Everyone        |
| GET    | /tracks/search?{query=}| searches for tracks and artists with names that start with {query} | Everyone        |
| POST   | /tracks/{id}/upload    | uploads a FLAC file to the server and stores it in the server's local file system | Admin           |
| GET    | /tracks/{id}/download  | downloads a FLAC file from the server for the specified track | Everyone           |

### Library-related
| Method | Route                  | Description                                      | Access Level       |
|--------|------------------------|--------------------------------------------------|--------------------|
| GET    | /library/tracks        | returns an array of tracks in the user's library | Authenticated User |
| POST   | /library/tracks        | adds a new track to the user's library           | Authenticated User |
| DELETE | /library/tracks        | removes a track from the user's library          | Authenticated User |
| GET    | /library/albums        | returns an array of albums in the user's library | Authenticated User |
| POST   | /library/albums        | adds a new album to the user's library           | Authenticated User |
| DELETE | /library/albums        | removes an album from the user's library         | Authenticated User |

### Analytics-related
| Method | Route                  | Description                                      | Access Level       |
|--------|------------------------|--------------------------------------------------|--------------------|
| GET    | /analytics/top-albums  | returns top albums by views (top-10 by default)            | Everyone |
| GET    | /analytics/top-tracks  | returns top tracks by downloads (top-100 by default)       | Everyone |

The endpoints can be tested with Swagger or frontend (not that the frontend does not implement all the endpoints)

__API Considerations:__
-  Endpoints related to login, registration, and displaying tracks and albums on the "home" page are accessible without authorization.
-  Endpoints for managing a user’s own library are accessible only to authenticated users via JWT.
-  Endpoints for managing the general database of tracks and albums are accessible only to authenticated users with an admin role via JWT.
-  The UserController has a special endpoint for granting admin roles to other users (by email), as only the first registered user automatically becomes an admin.
-  Although tracks are stored in a separate MongoDB collection, they cannot be managed directly. This is only possible through album management.
-  Tracks exist only within the context of an album: adding an album adds its contained tracks, modifying an album modifies/adds/removes its tracks, and deleting an album removes all associated tracks.
-  Album modification occurs by completely replacing the album.
-  Some object properties are used situationally (e.g., only during communication with the database).
-  IDs are automatically generated by MongoDB when objects are added to the database.
-  Uploading/downloading FLAC files is only possible with known track IDs.
