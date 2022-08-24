const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");
const app = express();
app.use(express.json());

let database = null;

const dbPath = path.join(__dirname, "moviesData.db");

const intializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running with http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db error : ${e.message}`);
    process.exit(1);
  }
};

intializeDbAndServer();

// get API 1

const convertDbObjToResponse = (Obj) => {
  return {
    movieName: Obj.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    
            SELECT
              *
            FROM
            movie`;

  const movies = await database.all(getMoviesQuery);
  response.send(
    movies.map((movie) => {
      return convertDbObjToResponse(movie);
    })
  );
});

//get (specific movie)

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//post (create a movie)

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const postMovieQuery = `
             INSERT INTO movie
               (director_id, movie_name, lead_actor)
            VALUES (${directorId},'${movieName}','${leadActor}')`;

  await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//put (update specific movie)

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
          UPDATE
            movie
           
           SET
             director_id = ${directorId},
             movie_name = '${movieName}',
             lead_actor = '${leadActor}'

          WHERE
             movie_id = ${movieId}
            `;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete (specific movie)

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteMovieQuery = `DELETE 

     from
       movie

     WHERE 
       movie_id = ${movieId}
      `;

  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// get (get all directors)

const convertDirectorDbObjToResponse = (Obj) => {
  return {
    directorId: Obj.director_id,
    directorName: Obj.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    
            SELECT
              *
            FROM
            director`;

  const directors = await database.all(getDirectorsQuery);
  response.send(
    directors.map((director) => {
      return convertDirectorDbObjToResponse(director);
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getMoviesDirectorQuery = `
         SELECT
          movie_name
         from
          movie 
         WHERE
           director_id = ${directorId}`;

  const movies = await database.all(getMoviesDirectorQuery);
  response.send(
    movies.map((movie) => {
      return {
        movieName: movie.movie_name,
      };
    })
  );
});

module.exports = app;
