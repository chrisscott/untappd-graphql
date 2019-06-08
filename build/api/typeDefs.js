"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var typeDefs = "\n  type Brewery {\n    brewery_id: Int!\n    brewery_name: String\n    brewery_slug: String\n    brewery_label: String\n    country_name: String\n    brewery_in_production: Int\n    is_independent: Int\n    claimed_status: ClaimedStatus\n    beer_count: Int\n    contact: Contact\n    brewery_type: String\n    brewery_type_id: Int\n    location: Location\n    rating: Rating\n    brewery_description: String\n    stats: Stats\n  }\n\n  type ClaimedStatus {\n    is_claimed: Boolean\n    claimed_slug: String\n    follow_status: Boolean\n    follower_count: Int\n    uid: Int\n    mute_status: String\n  }\n\n  type Contact {\n    twitter: String\n    facebook: String\n    instagram: String\n    url: String\n  }\n\n  type Location {\n    brewery_address: String\n    brewery_city: String\n    brewery_state: String\n    brewery_lat: Float\n    brewery_lng: Float\n  }\n\n  type Rating {\n    count: Int\n    rating_score: Float\n  }\n\n  type Stats {\n    total_count: Int\n    unique_count: Int\n    monthly_count: Int\n    weekly_count: Int\n    user_count: Int\n    age_on_service: Float\n  }\n\n  type Query {\n    brewerySearch(\n      q: String!\n      offset: Int\n      limit: Int\n    ): [Brewery]\n    brewerySearchInflated(\n      q: String!\n      offset: Int\n      limit: Int\n    ): [Brewery]\n    breweryInfo(id: Int!): Brewery\n  }\n";
var _default = typeDefs;
exports["default"] = _default;