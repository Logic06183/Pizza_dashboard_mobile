const { queryRef, executeQuery, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'pizzadashboardmobile',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const getAllOrdersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllOrders');
}
getAllOrdersRef.operationName = 'GetAllOrders';
exports.getAllOrdersRef = getAllOrdersRef;

exports.getAllOrders = function getAllOrders(dc) {
  return executeQuery(getAllOrdersRef(dc));
};

const getOrdersByStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetOrdersByStatus', inputVars);
}
getOrdersByStatusRef.operationName = 'GetOrdersByStatus';
exports.getOrdersByStatusRef = getOrdersByStatusRef;

exports.getOrdersByStatus = function getOrdersByStatus(dcOrVars, vars) {
  return executeQuery(getOrdersByStatusRef(dcOrVars, vars));
};

const getMyOrdersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyOrders');
}
getMyOrdersRef.operationName = 'GetMyOrders';
exports.getMyOrdersRef = getMyOrdersRef;

exports.getMyOrders = function getMyOrders(dc) {
  return executeQuery(getMyOrdersRef(dc));
};

const getOrderByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetOrderById', inputVars);
}
getOrderByIdRef.operationName = 'GetOrderById';
exports.getOrderByIdRef = getOrderByIdRef;

exports.getOrderById = function getOrderById(dcOrVars, vars) {
  return executeQuery(getOrderByIdRef(dcOrVars, vars));
};

const getPizzasRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPizzas');
}
getPizzasRef.operationName = 'GetPizzas';
exports.getPizzasRef = getPizzasRef;

exports.getPizzas = function getPizzas(dc) {
  return executeQuery(getPizzasRef(dc));
};
