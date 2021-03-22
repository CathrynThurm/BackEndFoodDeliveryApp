const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function checkExists(req, res, next) {
    const orderId = req.params.orderId
    const foundDeck = orders.find((order) => orderId === order.id)

    if(foundDeck) {
        return next()
    }
    else {
        return next({
            status: 404,
            message:  `Could not find deck with an id ${orderId}`
        })
    }
}

function validateDeliverTo(req, res, next) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    if(deliverTo) {
        return next()
    }
    else {
        return next({
            status: 400,
            message: `Field deliverTo is missing.`
        })
    }
}

function validateMobileNumber(req, res, next) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    if(mobileNumber) {
        return next()
    }
    else {
        return next({
            status:400,
            message: `Field mobileNumber is missing.`
        })
    }
}

function validateDishes(req, res, next) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    if(!dishes || dishes.length < 1 || !Array.isArray(dishes)) {
        return next({
            status: 400,
            message: `The field dishes has some problems.`
        })
    }

    else {
        dishes.forEach((dish, index) => {
            if(!dish.quantity || typeof(dish.quantity) !== 'number') {
                return next({
                    status: 400,
                    message: `A dishes quantity must be an integer with a value of at least 1.
                     Instead received ${dish.quantity} of type ${typeof(dish.quantity)},
                     at dish index ${index}.`
                })
            }
        })
        return next()
    }
        
}

function validateStatus(req, res, next) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body

    if(!status || status == 'invalid') {
        return next({
            status: 400,
            message: `Order status is required.`
        })
    }
    else {
        return next()
    }
}

function validateId(req, res, next) {
    const orderId = req.params.orderId
    const {data: {id, deliverTo, mobileNumber, status, dishes} = {}} = req.body

    if(orderId === id || id === undefined || !id) {
        return next()
    }
    else {
        next({
            status: 400,
            message: `The data id is: ${id} and can not be changed.`
        })
    }
}

function destroy(req, res, next) {
    const orderId = req.params.orderId
    const index = orders.indexOf((order) => orderId === order.id)
    const foundOrder = orders.find((order) => orderId === order.id)

    const deletedOrder = orders.splice(index, 1)

    if(foundOrder.status !== 'pending') {
        return next({
            status: 400,
            message: `Order status is not pending.`
        })
    }
    res.sendStatus(204)
}

function list(req, res) {
    res.json({data: orders})
}

function read(req, res) {
    const orderId = req.params.orderId
    const foundOrder = orders.find((order) => orderId === order.id)

    res.json({data: foundOrder})
}

function create(req, res) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    const newOrder = {
        id: orders.length + 1,
        deliverTo, mobileNumber, status, dishes
    }
    orders.push(newOrder)
    res.status(201).json({data:newOrder})
}

function update(req, res) {
    const orderId = req.params.orderId
    const foundOrder = orders.find((order) => orderId === order.id)
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body

    if(deliverTo !== foundOrder.deliverTo) {
        foundOrder.deliverTo = deliverTo
    }
    if(mobileNumber !== foundOrder.mobileNumber) {
        foundOrder.mobileNumber = mobileNumber
    }
    if(status !== foundOrder.status) {
        foundOrder.status = status
    }
    if(dishes !== foundOrder.dishes) {
        foundOrder.dishes = dishes
    }
    
    res.json({data: foundOrder})

}

module.exports = {
    list,
    read: [checkExists, read],
    create: [validateDishes, validateDeliverTo, validateMobileNumber, create],
    destroy: [checkExists, destroy],
    update: [checkExists, validateId, validateDeliverTo,
         validateMobileNumber, validateDishes,
         validateStatus, update]
}
