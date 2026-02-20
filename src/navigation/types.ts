export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  ItemDetail: { id: number | string };
  GenericDetail: { id: number | string; type?: string };
  OrderDetail: { orderId: number | string };
  Checkout: undefined;
};
