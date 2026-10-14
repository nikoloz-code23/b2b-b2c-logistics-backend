import { CompanyDriverEssential, CompanyDriverPreview } from "./driver";
import { PreviewUser } from "./user";

export interface Route {
	fromCity: string;
	toCity: string;
	fromCoordinate: string;
	toCoordinate: string;
	passengerCount: number;
	departureTime: string;
	departureDate: string;
	car: string;
	price: number;
	userId: number;
	companyDriverId: number | null;
}

export interface RouteWithId extends Route {
	routeId: number;
}

// ----

export interface RouteUserCompanyDriverDataPreview extends RouteWithId {
	uploadedBy: PreviewUser;
	companyDriver: CompanyDriverPreview | null;
}

export interface RouteFullDataDriverPreview
	extends RouteUserCompanyDriverDataPreview {
	routeId: number;
}

// ----

export interface RouteUserCompanyDriverData extends Route {
	uploadedBy: PreviewUser;
	companyDriver: CompanyDriverEssential | null;
}

export interface RouteFullData extends RouteUserCompanyDriverData {
	routeId: number;
}
