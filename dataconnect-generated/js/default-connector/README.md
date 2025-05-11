# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetAllOrders*](#getallorders)
  - [*GetOrdersByStatus*](#getordersbystatus)
  - [*GetMyOrders*](#getmyorders)
  - [*GetOrderById*](#getorderbyid)
  - [*GetPizzas*](#getpizzas)
- [**Mutations**](#mutations)

# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `default`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@firebasegen/default-connector` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `default`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/default-connector';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@firebasegen/default-connector';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `default` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetAllOrders
You can execute the `GetAllOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [default-connector/index.d.ts](./index.d.ts):
```typescript
getAllOrders(): QueryPromise<GetAllOrdersData, undefined>;

interface GetAllOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllOrdersData, undefined>;
}
export const getAllOrdersRef: GetAllOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllOrders(dc: DataConnect): QueryPromise<GetAllOrdersData, undefined>;

interface GetAllOrdersRef {
  ...
  (dc: DataConnect): QueryRef<GetAllOrdersData, undefined>;
}
export const getAllOrdersRef: GetAllOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllOrdersRef:
```typescript
const name = getAllOrdersRef.operationName;
console.log(name);
```

### Variables
The `GetAllOrders` query has no variables.
### Return Type
Recall that executing the `GetAllOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllOrdersData`, which is defined in [default-connector/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetAllOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllOrders } from '@firebasegen/default-connector';


// Call the `getAllOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllOrders();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllOrders(dataConnect);

console.log(data.orders);

// Or, you can use the `Promise` API.
getAllOrders().then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `GetAllOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllOrdersRef } from '@firebasegen/default-connector';


// Call the `getAllOrdersRef()` function to get a reference to the query.
const ref = getAllOrdersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllOrdersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## GetOrdersByStatus
You can execute the `GetOrdersByStatus` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [default-connector/index.d.ts](./index.d.ts):
```typescript
getOrdersByStatus(vars: GetOrdersByStatusVariables): QueryPromise<GetOrdersByStatusData, GetOrdersByStatusVariables>;

interface GetOrdersByStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrdersByStatusVariables): QueryRef<GetOrdersByStatusData, GetOrdersByStatusVariables>;
}
export const getOrdersByStatusRef: GetOrdersByStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getOrdersByStatus(dc: DataConnect, vars: GetOrdersByStatusVariables): QueryPromise<GetOrdersByStatusData, GetOrdersByStatusVariables>;

interface GetOrdersByStatusRef {
  ...
  (dc: DataConnect, vars: GetOrdersByStatusVariables): QueryRef<GetOrdersByStatusData, GetOrdersByStatusVariables>;
}
export const getOrdersByStatusRef: GetOrdersByStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getOrdersByStatusRef:
```typescript
const name = getOrdersByStatusRef.operationName;
console.log(name);
```

### Variables
The `GetOrdersByStatus` query requires an argument of type `GetOrdersByStatusVariables`, which is defined in [default-connector/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetOrdersByStatusVariables {
  status: string;
}
```
### Return Type
Recall that executing the `GetOrdersByStatus` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetOrdersByStatusData`, which is defined in [default-connector/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetOrdersByStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getOrdersByStatus, GetOrdersByStatusVariables } from '@firebasegen/default-connector';

// The `GetOrdersByStatus` query requires an argument of type `GetOrdersByStatusVariables`:
const getOrdersByStatusVars: GetOrdersByStatusVariables = {
  status: ..., 
};

// Call the `getOrdersByStatus()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getOrdersByStatus(getOrdersByStatusVars);
// Variables can be defined inline as well.
const { data } = await getOrdersByStatus({ status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getOrdersByStatus(dataConnect, getOrdersByStatusVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
getOrdersByStatus(getOrdersByStatusVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `GetOrdersByStatus`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getOrdersByStatusRef, GetOrdersByStatusVariables } from '@firebasegen/default-connector';

// The `GetOrdersByStatus` query requires an argument of type `GetOrdersByStatusVariables`:
const getOrdersByStatusVars: GetOrdersByStatusVariables = {
  status: ..., 
};

// Call the `getOrdersByStatusRef()` function to get a reference to the query.
const ref = getOrdersByStatusRef(getOrdersByStatusVars);
// Variables can be defined inline as well.
const ref = getOrdersByStatusRef({ status: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getOrdersByStatusRef(dataConnect, getOrdersByStatusVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## GetMyOrders
You can execute the `GetMyOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [default-connector/index.d.ts](./index.d.ts):
```typescript
getMyOrders(): QueryPromise<GetMyOrdersData, undefined>;

interface GetMyOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyOrdersData, undefined>;
}
export const getMyOrdersRef: GetMyOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyOrders(dc: DataConnect): QueryPromise<GetMyOrdersData, undefined>;

interface GetMyOrdersRef {
  ...
  (dc: DataConnect): QueryRef<GetMyOrdersData, undefined>;
}
export const getMyOrdersRef: GetMyOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyOrdersRef:
```typescript
const name = getMyOrdersRef.operationName;
console.log(name);
```

### Variables
The `GetMyOrders` query has no variables.
### Return Type
Recall that executing the `GetMyOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyOrdersData`, which is defined in [default-connector/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyOrders } from '@firebasegen/default-connector';


// Call the `getMyOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyOrders();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyOrders(dataConnect);

console.log(data.orders);

// Or, you can use the `Promise` API.
getMyOrders().then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `GetMyOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyOrdersRef } from '@firebasegen/default-connector';


// Call the `getMyOrdersRef()` function to get a reference to the query.
const ref = getMyOrdersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyOrdersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## GetOrderById
You can execute the `GetOrderById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [default-connector/index.d.ts](./index.d.ts):
```typescript
getOrderById(vars: GetOrderByIdVariables): QueryPromise<GetOrderByIdData, GetOrderByIdVariables>;

interface GetOrderByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetOrderByIdVariables): QueryRef<GetOrderByIdData, GetOrderByIdVariables>;
}
export const getOrderByIdRef: GetOrderByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getOrderById(dc: DataConnect, vars: GetOrderByIdVariables): QueryPromise<GetOrderByIdData, GetOrderByIdVariables>;

interface GetOrderByIdRef {
  ...
  (dc: DataConnect, vars: GetOrderByIdVariables): QueryRef<GetOrderByIdData, GetOrderByIdVariables>;
}
export const getOrderByIdRef: GetOrderByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getOrderByIdRef:
```typescript
const name = getOrderByIdRef.operationName;
console.log(name);
```

### Variables
The `GetOrderById` query requires an argument of type `GetOrderByIdVariables`, which is defined in [default-connector/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetOrderByIdVariables {
  orderId: string;
}
```
### Return Type
Recall that executing the `GetOrderById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetOrderByIdData`, which is defined in [default-connector/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetOrderById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getOrderById, GetOrderByIdVariables } from '@firebasegen/default-connector';

// The `GetOrderById` query requires an argument of type `GetOrderByIdVariables`:
const getOrderByIdVars: GetOrderByIdVariables = {
  orderId: ..., 
};

// Call the `getOrderById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getOrderById(getOrderByIdVars);
// Variables can be defined inline as well.
const { data } = await getOrderById({ orderId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getOrderById(dataConnect, getOrderByIdVars);

console.log(data.order);

// Or, you can use the `Promise` API.
getOrderById(getOrderByIdVars).then((response) => {
  const data = response.data;
  console.log(data.order);
});
```

### Using `GetOrderById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getOrderByIdRef, GetOrderByIdVariables } from '@firebasegen/default-connector';

// The `GetOrderById` query requires an argument of type `GetOrderByIdVariables`:
const getOrderByIdVars: GetOrderByIdVariables = {
  orderId: ..., 
};

// Call the `getOrderByIdRef()` function to get a reference to the query.
const ref = getOrderByIdRef(getOrderByIdVars);
// Variables can be defined inline as well.
const ref = getOrderByIdRef({ orderId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getOrderByIdRef(dataConnect, getOrderByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.order);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.order);
});
```

## GetPizzas
You can execute the `GetPizzas` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [default-connector/index.d.ts](./index.d.ts):
```typescript
getPizzas(): QueryPromise<GetPizzasData, undefined>;

interface GetPizzasRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetPizzasData, undefined>;
}
export const getPizzasRef: GetPizzasRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getPizzas(dc: DataConnect): QueryPromise<GetPizzasData, undefined>;

interface GetPizzasRef {
  ...
  (dc: DataConnect): QueryRef<GetPizzasData, undefined>;
}
export const getPizzasRef: GetPizzasRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getPizzasRef:
```typescript
const name = getPizzasRef.operationName;
console.log(name);
```

### Variables
The `GetPizzas` query has no variables.
### Return Type
Recall that executing the `GetPizzas` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetPizzasData`, which is defined in [default-connector/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetPizzas`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getPizzas } from '@firebasegen/default-connector';


// Call the `getPizzas()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getPizzas();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getPizzas(dataConnect);

console.log(data.pizzas);

// Or, you can use the `Promise` API.
getPizzas().then((response) => {
  const data = response.data;
  console.log(data.pizzas);
});
```

### Using `GetPizzas`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getPizzasRef } from '@firebasegen/default-connector';


// Call the `getPizzasRef()` function to get a reference to the query.
const ref = getPizzasRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getPizzasRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.pizzas);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.pizzas);
});
```

# Mutations

No mutations were generated for the `default` connector.

If you want to learn more about how to use mutations in Data Connect, you can follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

