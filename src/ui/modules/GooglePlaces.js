/* @flow */

type LatLng = {
	latitude: number;
	longitude: number;
}

type PlaceFilter = {
	restrictToPlaceIds: Array<string>;
	requireOpenNow: boolean;
}

type Place = {
	id: string;
	priceLevel: number;
	rating: number;
	latLng: LatLng;
	address?: string;
	attributions?: string;
	name?: string;
	phoneNumber?: string;
	locale?: string;
	websiteUri?: string;
	placeTypes: Array<number>;
}

type AutoCompletePrediction = {
	fullText: string;
	primaryText: string;
	secondaryText: string;
	placeId: string;
	placeTypes: Array<number>;
}

export default class GooglePlaces {
	static TYPE_FILTER_ADDRESS: number;
	static TYPE_FILTER_CITIES: number;
	static TYPE_FILTER_ESTABLISHMENT: number;
	static TYPE_FILTER_GEOCODE: number;
	static TYPE_FILTER_NONE: number;
	static TYPE_FILTER_REGIONS: number;

	static getCurrentPlace: (filter: ?PlaceFilter) => Promise<Array<{ place: Place; likelihood: number }>>;
	static getPlaceById: (id: string) => Promise<Place>;
	static findPlace: () => Promise<Place>;
	static getAutoCompletePredictions: (
		query: string, bounds: Array<LatLng>, filter: ?Array<number>
	) => Promise<AutoCompletePrediction>;
}
