export interface Route {
  fromCity: string;
  toCity: string;
  fromCoordinate: string;
  toCoordinate: string;
  passengerCount: string;
  car: string;
  price: number;
  userId: number;
  companyDriverId: number | null;
}

export interface RouteWithId extends Route {
  routeId: number;
}
