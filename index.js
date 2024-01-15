require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());
app.use(express.static('dist'))

const Person = require('./models/person');

const PORT = process.env.PORT || 3001;

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    });
});

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person);
    }).catch(error => {
        console.log(error);
        res.status(404).end();
    });
});

app.delete('/api/persons/:id', (req, res) => {
    Person.deleteOne({_id: req.params.id}).then(result => {
        res.status(204).end();
    }).catch(error => {
        res.status(204).send(err);
    });
});

app.post('/api/persons', async (req, res) => {
    if (!req.body.name || !req.body.number) return res.status(400).json({ error: 'name or number missing' });
    
    const person = new Person({
        id: Math.floor(Math.random() * 100000),
        name: req.body.name,
        number: req.body.number
    });

    if (await Person.countDocuments({name:  person.name}) > 0) {
        return res.status(400).json({ error: 'name must be unique' });
    }
    
    person.save().then(savedPerson => {
        res.json(savedPerson);
    }).catch(error => {
        console.log(error);
        res.status(400).end();
    });
});

app.put('/api/persons/:id', (req, res) => {
    Person.findOneAndUpdate({_id: req.params.id}, {number: req.body.number}, {new: true})
        .then(updatedPerson => {
            res.json(updatedPerson);
        }).catch(error => {
            res.status(400).end();
    });
});

app.get('/info', async (req, res) => {
    res.send(`<p>Phonebook has info for ${await Person.countDocuments({})} people</p><p>${new Date()}</p>`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});