const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//IF ORDER FROM ORDERS DATA EXISTS
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    res.locals.orderId = orderId;
    return next()
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

//LIST METHOD
function list(req, res) {
  //This route will respond with a list of all existing order data.
  res.json({ data: orders })
}

//VAILDATION AND ITS ERRORS
function vaildationForm(req, res, next) {
  //if validations fail, respond with a status code of 400 and an error message.
  const { data: { deliverTo, mobileNumber, dishes, quantity} = {} } = req.body

  if (!deliverTo) {
    return next({
      status: 400,
      message: 'Order must include a deliverTo',
    })
  } 
  else if (!mobileNumber) {
    return next({
      status: 400,
      message: 'Order must include a mobileNumber',
    })
  } 
  else if (!dishes) {
    return next({
      status: 400,
      message: 'Order must include a dish',
    })
  }                      
 else if (!dishes.length || !Array.isArray(dishes)) {
    return next({
      status: 400,
      message: 'Order must include at least one dish',
    })
  } 
  dishes.map((dish, index) => {
    if (
      !dish.quantity ||
      !Number.isInteger(dish.quantity) ||
      !dish.quantity > 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
      });
    }
  });
  next()
}

//CREATE METHOD
function create(req, res) {
  //This route will save the order and respond with the newly created order.
  const { data: { deliverTo, mobileNumber, dishes, quantity} = {} } = req.body;
  const newOrder = {
    id: { nextId },
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    quantity: quantity,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

//READ METHOD
function read(req,res,next) {
  res.json({ data: res.locals.order })
}

//UPDATE METHOD
function update(req, res, next) {
  const orderId = res.locals.orderId
  const { data: {id, deliverTo, mobileNumber, dishes, quantity, status } = {} } = req.body;
  if (id && orderId !== id) {
    //The update validation must include all validation and these errors messages
    next({
      status: 400,
      message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}`,
    })
  }
  else if (!status || status === 'invalid') {
    next({
      status: 400,
      message:
        'Order must have a status of pending, preparing, out-for-delivery, delivered',
    })
  } 
  else if (status === 'delivered') {
    next({
      status: 400,
      message: 'A delivered order cannot be changed',
    })
  }
  const newOrder = {
    id: orderId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes,
    quantity: quantity,
    status: status
  };

  res.json({ data: newOrder });
}
function vaildationPending(req, res, next) {
   const order = res.locals.order;
   if (order.status !== 'pending') {
     next()
   }
    next({
      status: 400,
      message: 'An order cannot be deleted unless it is pending',
    })
}
//DELETE METHOD
function destroy(req, res, next) {
  //This route will delete the order where id === :orderId 
  const order = res.locals.order;
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId)
  if (order.status !== 'pending') {
    next({
      //return 400 with an error message when it's not pending
      status: 400,
      message: 'An order cannot be deleted unless it is pending',
    })
  }
  if (index > -1) {
    orders.splice(index, 1)
  }
  res.sendStatus(204)
}


module.exports = {
  list,
  read:[orderExists, read],
  create:[vaildationForm, create],
  update:[orderExists, vaildationForm, update],
  delete:[orderExists, destroy],
  };