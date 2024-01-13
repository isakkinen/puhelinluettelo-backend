const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://einoiisko:${password}@full-stack-open.wvnjgof.mongodb.net/puhelinluetteloApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    Person.find({}).then(res => {
        res.forEach(person => {
            console.log(person)
        })
        mongoose.connection.close()
    })
}
else if (process.argv.length < 5) {
    console.log('give name and number as arguments')
    process.exit(1)
}

Person.create({
    name: process.argv[3],
    number: process.argv[4]
}).then(res => {
    console.log(`added ${res.name} number ${res.number} to phonebook`)
    mongoose.connection.close()
})