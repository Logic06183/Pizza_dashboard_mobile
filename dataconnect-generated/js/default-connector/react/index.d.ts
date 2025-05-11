import { GetAllOrdersData, GetOrdersByStatusData, GetOrdersByStatusVariables, GetMyOrdersData, GetOrderByIdData, GetOrderByIdVariables, GetPizzasData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useGetAllOrders(options?: useDataConnectQueryOptions<GetAllOrdersData>): UseDataConnectQueryResult<GetAllOrdersData, undefined>;
export function useGetAllOrders(dc: DataConnect, options?: useDataConnectQueryOptions<GetAllOrdersData>): UseDataConnectQueryResult<GetAllOrdersData, undefined>;

export function useGetOrdersByStatus(vars: GetOrdersByStatusVariables, options?: useDataConnectQueryOptions<GetOrdersByStatusData>): UseDataConnectQueryResult<GetOrdersByStatusData, GetOrdersByStatusVariables>;
export function useGetOrdersByStatus(dc: DataConnect, vars: GetOrdersByStatusVariables, options?: useDataConnectQueryOptions<GetOrdersByStatusData>): UseDataConnectQueryResult<GetOrdersByStatusData, GetOrdersByStatusVariables>;

export function useGetMyOrders(options?: useDataConnectQueryOptions<GetMyOrdersData>): UseDataConnectQueryResult<GetMyOrdersData, undefined>;
export function useGetMyOrders(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyOrdersData>): UseDataConnectQueryResult<GetMyOrdersData, undefined>;

export function useGetOrderById(vars: GetOrderByIdVariables, options?: useDataConnectQueryOptions<GetOrderByIdData>): UseDataConnectQueryResult<GetOrderByIdData, GetOrderByIdVariables>;
export function useGetOrderById(dc: DataConnect, vars: GetOrderByIdVariables, options?: useDataConnectQueryOptions<GetOrderByIdData>): UseDataConnectQueryResult<GetOrderByIdData, GetOrderByIdVariables>;

export function useGetPizzas(options?: useDataConnectQueryOptions<GetPizzasData>): UseDataConnectQueryResult<GetPizzasData, undefined>;
export function useGetPizzas(dc: DataConnect, options?: useDataConnectQueryOptions<GetPizzasData>): UseDataConnectQueryResult<GetPizzasData, undefined>;
