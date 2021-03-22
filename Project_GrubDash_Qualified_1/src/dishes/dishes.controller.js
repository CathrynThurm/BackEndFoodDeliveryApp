const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function validateName(req, res, next) {
    const {data : {name} ={}} = req.body;
    if(name) {
        return next()
    }
    else {
        next({
            status: 400,
            message: "A 'name' property is required."
        })
    }
}

function validateDescription(req, res, next) {
    const {data : {description} ={}} = req.body;
    if(description) {
        return next()
    }
    else {
        next({
            status: 400,
            message: "A 'description' property is required."
        })
    }
}


function validateImage(req, res, next) {
    const {data : {image_url} ={}} = req.body;
    if(image_url) {
        return next()
    }
    else {
        next({
            status: 400,
            message: "An 'image_url' property is required."
        })
    }
}

function validatePrice(req, res, next) {
    const {data : {price} ={}} = req.body;
    if(!price || price < 0 || typeof price !== 'number') {
        next({
            status: 400,
            message: "A 'price' property is required."
        })
    }
    else {
        return next()
    }
}

function checkExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId)

    if(foundDish) {
        return next()
    }
    else {
        next({
            status: 404,
            message: `A dish with that id does not exist: ${dishId}`
        })
    }
}

function validateId(req, res, next) {
    const dishId = req.params.dishId;
    const {data : {id, name, description, price, image_url} = {}} = req.body

    if(dishId === id || id === undefined || !id) {
        return next()
    }
    else {
        next({
            status: 400,
            message: `The data id is: ${id} and can not be changed.`
        })
    }
}


function list(req, res) {
    res.json( {data: dishes})
}

function read(req, res) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId)
    res.json({data:foundDish})
}

function create (req, res) {
    const {data : {name, description, price, image_url} = {}} = req.body
    const newDish = {
        id: dishes.length + 1,
        name, description, price, image_url
    }
    dishes.push(newDish)
    res.status(201).json({data: newDish})
}

function update(req, res) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId)

    const {data : {name, description, price, image_url} = {}} = req.body
    
    if(foundDish.name !== name) {
        foundDish.name = name
    }
    if (foundDish.description !== description) {
        foundDish.description = description
    }
    if(foundDish.price !== price) {
        foundDish.price = price
    }
    if(foundDish.image_url !== image_url) {
        foundDish.image_url = image_url
    }

    res.json({data:foundDish})
}

function destroy (req, res) {
    const {dishId} = req.params
    const index = dishes.findIndex((dish) => dish.id === dishId) 

    const deletedDish = dishes.splice(index, 1)
    res.sendStatus(204)
}

module.exports = {
    list,
    read: [checkExists, read],
    create: [validatePrice, validateName, validateDescription, validateImage, create],
    update: [checkExists, validateName, validateDescription,validatePrice, validateImage, validateId, update],
    destroy
}
