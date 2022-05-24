const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//IF DISH FROM DISHES DATA EXISTS
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    res.locals.dishId = dishId;
    return next()
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}
//VAILDATION AND ITS ERRORS
function vaildationForm(req, res, next) {
  //if validations fail, respond with a status code of 400 and its error message.
  const { data: { name, description, price, image_url } = {} } = req.body

  if (!name) {
    return next({
      status: 400,
      message: 'Dish must include a name',
    })
  } 
  else if (!description) {
    return next({
      status: 400,
      message: 'Dish must include a description',
    })
  } 
  else if (!price) {
    return next({
      status: 400,
      message: 'Dish must include a price',
    })
  }                      //is not an integer
  else if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: 'Dish must have a price that is an integer greater than 0',
    })
  } 
  else if (!image_url) {
    return next({
      status: 400,
      message: 'Dish must include a image_url',
    })
  }
  next()
}

//LIST METHOD
//This route will respond with a list of all existing dish data.
function list(req, res) {
  res.json({ data: dishes })
}

//READ METHOD
function read(req,res,next) {
  res.json({ data: res.locals.dish })
}

//CREATE METHOD
//This route will save the dish and respond with the newly created dish.
function create(req, res) {
  const { data: { name, description, price, image_url} = {} } = req.body;
  const newDish = {
    id: { nextId },
    name: name,
    description: description, 
    price: price,
    image_url: image_url,  
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//UPDATE METHOD
function update(req, res, next) {
  const dishId = res.locals.dishId
  //update the dish where id === :dishId
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  if (id && dishId !== id) {
    next({
      // return 400 if no matching dish is found.
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    })
  }
  const newDish = {
    id: dishId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };

  res.json({ data: newDish });
}

module.exports = {
  list,
  read:[dishExists, read],
  create:[vaildationForm, create],
  update:[dishExists, vaildationForm, update],
  };