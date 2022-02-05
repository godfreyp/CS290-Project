import * as exercises from './exercises_model.mjs';
import express from 'express';

const PORT = 3000;

const app = express();

app.use(express.json());

/**
 * Create a new exercise with the name, reps, weight, unit, and date
 */
 app.post('/exercises', (req, res) => {
    exercises.createExercise(req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)
        .then(exercise => {
            res.status(201).json(exercise);
        })
        .catch(error => {
            console.error(error);
            // In case of an error, send back status code 400 in case of an error.
            // A better approach will be to examine the error and send an
            // error status code corresponding to the error.
            res.status(500).json({ Error: 'Request failed' });
        });
});


/**
 * Retrive the exercise corresponding to the ID provided in the URL.
 */
 app.get('/exercises/:_id', (req, res) => {
    const exerciseId = req.params._id;
    exercises.findExerciseById(exerciseId)
        .then(exercise => { 
            if (exercise !== null) {
                res.status(200).json(exercise);
            } else {
                // Changed status to 500 in keeping with guidelines, normally 404
                res.status(500).json({ Error: 'Resource not found' });
            }         
         })
        .catch(error => {
            res.status(500).json({ Error: 'Request failed' });
        });

});

/**
 * Retrieve exercises. 
 * If the query parameters include a date, then only the exercises for that year are returned.
 * Otherwise, all exercises are returned.
 */
 app.get('/exercises', (req, res) => {
    let filter = {};
    // Is there a query parameter named year? If so add a filter based on its value.
    if(req.query.date !== undefined){
        filter = { year: req.query.date };
    }
    exercises.findExercises(filter, '', 0)
        .then(exercises => {
            res.send(exercises);
        })
        .catch(error => {
            console.error(error);
            res.send({ Error: 'Request failed' });
        });

});

/**
 * Ensures update requests meet schema requirements.
 */
app.put('/exercises/:_id', (req, res, next) => {
    const validateRepsWeight = 1
    const validateUnit = new RegExp(/^"(lbs|kgs)"$/)
    const validateDate = new RegExp(/^"(0[1-9]|1[0-2])\-(0[1-9]|1\d|2\d|3[01])\-[0-9]{2}"$/)
    var errorCount = 0
    if(JSON.stringify(req.body.name).length < 3) {
        errorCount++
    }
    if(req.body.reps[0] < validateRepsWeight) {
        errorCount++
    }
    if(req.body.weight[0] < validateRepsWeight) {
        errorCount++
    }
    if(validateUnit.test(JSON.stringify(req.body.unit)) === false || JSON.stringify(req.body.unit).length < 3) {
        errorCount++
    }
    if(validateDate.test(JSON.stringify(req.body.date)) === false || JSON.stringify(req.body.date).length < 3) {
        console.log(validateDate.test(JSON.stringify(req.body.date)))
        errorCount++
    }
    if(errorCount === 0) {
        next()
    } else {
        res.status(500).json({ Error: 'Request failed due to invalid input'})
    }
});

/**
 * Update the exercise whose id is provided in the path parameter and set
 * its name, reps, weight, unit, and date to the values provided in the body.
 */
 app.put('/exercises/:_id', (req, res) => {
    exercises.replaceExercise(req.params._id, req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)
        .then(numUpdated => {
            if (numUpdated === 1) {
                res.status(200).json({ _id: req.params._id, name: req.body.name, reps: req.body.reps, 
                    weight: req.body.weight, unit: req.body.unit, date: req.body.date })
            } else {
                // Changed status to 500 in keeping with guidelines, normally 404
                res.status(500).json({ Error: 'Resource not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ Error: 'Request failed' });
        });
});

/**
 * Delete the exercise whose id is provided in the query parameters
 */
 app.delete('/exercises/:id', (req, res) => {
    exercises.deleteById(req.params.id)
        .then(deletedCount => {
            if (deletedCount === 1) {
                res.status(204).send();
            } else {
                // Changed status to 500 in keeping with guidelines, normally 404
                res.status(500).json({ Error: 'Resource not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Request failed' });
        });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});