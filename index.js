require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { unknownEndpoint, errorHandler } = require('./middleware')
const cors = require('cors')
const app = express()

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Person = require('./models/person')

const PORT = process.env.PORT || 3001

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) return res.json(person)
    else return res.status(404).end()
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.deleteOne({ _id: req.params.id }).then(result => {
    res.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', async (req, res, next) => {
  if (!req.body.name || !req.body.number) return res.status(400).json({ error: 'name or number missing' })

  const person = {
    name: req.body.name,
    number: req.body.number
  }

  if (await Person.countDocuments({ name: person.name }) > 0) {
    return res.status(400).json({ error: 'name must be unique' })
  }

  Person.create(person, { runValidators: true, context: 'save' }).then(savedPerson => {
    res.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  Person.findOneAndUpdate(
    { _id: req.params.id },
    { number: req.body.number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    }).catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

app.get('/info', async (req, res) => {
  res.send(`<p>Phonebook has info for ${await Person.countDocuments({})} people</p><p>${new Date()}</p>`)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
