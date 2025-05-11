import { queryRef, executeQuery, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'default',
  service: 'pizzadashboardmobile',
  location: 'us-central1'
};

export const getAllOrdersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAllOrders');
}
getAllOrdersRef.operationName = 'GetAllOrders';

export function getAllOrders(dc) {
  return executeQuery(getAllOrdersRef(dc));
}

export const getOrdersByStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetOrdersByStatus', inputVars);
}
getOrdersByStatusRef.operationName = 'GetOrdersByStatus';

export function getOrdersByStatus(dcOrVars, vars) {
  return executeQuery(getOrdersByStatusRef(dcOrVars, vars));
}

export const getMyOrdersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyOrders');
}
getMyOrdersRef.operationName = 'GetMyOrders';

export function getMyOrders(dc) {
  return executeQuery(getMyOrdersRef(dc));
}

export const getOrderByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetOrderById', inputVars);
}
getOrderByIdRef.operationName = 'GetOrderById';

export function getOrderById(dcOrVars, vars) {
  return executeQuery(getOrderByIdRef(dcOrVars, vars));
}

export const getPizzasRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetPizzas');
}
getPizzasRef.operationName = 'GetPizzas';

export function getPizzas(dc) {
  return executeQuery(getPizzasRef(dc));
}

