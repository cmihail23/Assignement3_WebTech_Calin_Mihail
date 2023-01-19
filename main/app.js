const express = require('express')
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'my.db'
})

let FoodItem = sequelize.define('foodItem', {
    name: Sequelize.STRING,
    category: {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories: Sequelize.INTEGER
}, {
    timestamps: false
})


const app = express()
// TODO
app.use(express.json())
app.get('/create', async (req, res) => {
    try {
        await sequelize.sync({ force: true })
        for (let i = 0; i < 10; i++) {
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories: 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({ message: 'created' })
    }
    catch (err) {
        console.warn(err.stack)
        res.status(500).json({ message: 'server error' })
    }
})

app.get('/food-items', async (req, res) => {
    try {
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch (err) {
        console.warn(err.stack)
        res.status(500).json({ message: 'server error' })
    }
})

app.post('/food-items', async (req, res) => {
    try {
        if (req.body == null || Object.keys(req.body).length === 0) {
            console.warn(req.body)
            res.status(400).send({ "message": "body is missing" })
        }
        else {
            if ('name' in req.body == false || 'category' in req.body == false || 'calories' in req.body == false) {
                res.status(400).send({ "message": "malformed request" })
            } else {
                console.warn(req.body)
                if (req.body.calories < 0) {
                    res.status(400).send({ "message": "calories should be a positive number" })
                } else if (['MEAT', 'DAIRY', 'VEGETABLE'].some(c => c == req.body.category) == false) {
                    res.status(400).send({ "message": "not a valid category" })
                }
                else {
                    const item = FoodItem.build(req.body)
                    item.save();
                    res.status(201).send({ "message": "created" })
                }
            }
        }
    }
    catch (err) {
        console.warn(err.stack)
    }
})

module.exports = app