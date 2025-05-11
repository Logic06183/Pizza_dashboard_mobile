import { ConnectorConfig, DataConnect, QueryRef, QueryPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface GetAllOrdersData {
  orders: ({
    id: string;
    userId?: string | null;
    customerName?: string | null;
    status?: string | null;
    items?: string | null;
    deliveryDetails?: string | null;
    subtotal?: number | null;
    deliveryFee?: number | null;
    tax?: number | null;
    discount?: number | null;
    totalAmount?: number | null;
    paymentMethod?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Order_Key)[];
}

export interface GetMyOrdersData {
  orders: ({
    id: string;
    status?: string | null;
    items?: string | null;
    deliveryDetails?: string | null;
    totalAmount?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Order_Key)[];
}

export interface GetOrderByIdData {
  order?: {
    id: string;
    userId?: string | null;
    customerName?: string | null;
    status?: string | null;
    items?: string | null;
    deliveryDetails?: string | null;
    notes?: string | null;
    subtotal?: number | null;
    deliveryFee?: number | null;
    tax?: number | null;
    discount?: number | null;
    totalAmount?: number | null;
    paymentMethod?: string | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Order_Key;
}

export interface GetOrderByIdVariables {
  orderId: string;
}

export interface GetOrdersByStatusData {
  orders: ({
    id: string;
    userId?: string | null;
    customerName?: string | null;
    status?: string | null;
    items?: string | null;
    deliveryDetails?: string | null;
    totalAmount?: number | null;
    createdAt?: TimestampString | null;
    updatedAt?: TimestampString | null;
  } & Order_Key)[];
}

export interface GetOrdersByStatusVariables {
  status: string;
}

export interface GetPizzasData {
  pizzas: ({
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    ingredients?: string | null;
    category?: string | null;
    isAvailable?: boolean | null;
  } & Pizza_Key)[];
}

export interface Order_Key {
  id: string;
  __typename?: 'Order_Key';
}

export interface Pizza_Key {
  id: string;
  __typename?: 'Pizza_Key';
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface GetAllOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllOrdersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAllOrdersData, undefined>;
  operationName: string;
}
export const getAllOrdersRef: GetAllOrdersRef;

export function getAllOrders(): QueryPromise<GetAllOrdersData, undefined>;
export function getAllOrders(dc: DataConnect): QueryPromise<GetAllOrdersData, undefined>;

interface GetOrdersByStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrdersByStatusVariables): QueryRef<GetOrdersByStatusData, GetOrdersByStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetOrdersByStatusVariables): QueryRef<GetOrdersByStatusData, GetOrdersByStatusVariables>;
  operationName: string;
}
export const getOrdersByStatusRef: GetOrdersByStatusRef;

export function getOrdersByStatus(vars: GetOrdersByStatusVariables): QueryPromise<GetOrdersByStatusData, GetOrdersByStatusVariables>;
export function getOrdersByStatus(dc: DataConnect, vars: GetOrdersByStatusVariables): QueryPromise<GetOrdersByStatusData, GetOrdersByStatusVariables>;

interface GetMyOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyOrdersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyOrdersData, undefined>;
  operationName: string;
}
export const getMyOrdersRef: GetMyOrdersRef;

export function getMyOrders(): QueryPromise<GetMyOrdersData, undefined>;
export function getMyOrders(dc: DataConnect): QueryPromise<GetMyOrdersData, undefined>;

interface GetOrderByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrderByIdVariables): QueryRef<GetOrderByIdData, GetOrderByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetOrderByIdVariables): QueryRef<GetOrderByIdData, GetOrderByIdVariables>;
  operationName: string;
}
export const getOrderByIdRef: GetOrderByIdRef;

export function getOrderById(vars: GetOrderByIdVariables): QueryPromise<GetOrderByIdData, GetOrderByIdVariables>;
export function getOrderById(dc: DataConnect, vars: GetOrderByIdVariables): QueryPromise<GetOrderByIdData, GetOrderByIdVariables>;

interface GetPizzasRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPizzasData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetPizzasData, undefined>;
  operationName: string;
}
export const getPizzasRef: GetPizzasRef;

export function getPizzas(): QueryPromise<GetPizzasData, undefined>;
export function getPizzas(dc: DataConnect): QueryPromise<GetPizzasData, undefined>;

