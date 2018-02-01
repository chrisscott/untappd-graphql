const typeDefs = `
  type Brewery {
    brewery_id: Int!
    brewery_name: String
    brewery_slug: String
    brewery_label: String
    country_name: String
    brewery_in_production: Int
    is_independent: Int
    claimed_status: ClaimedStatus
    beer_count: Int
    contact: Contact
    brewery_type: String
    brewery_type_id: Int
    location: Location
    rating: Rating
    brewery_description: String
    stats: Stats
  }

  type ClaimedStatus {
    is_claimed: Boolean
    claimed_slug: String
    follow_status: Boolean
    follower_count: Int
    uid: Int
    mute_status: String
  }

  type Contact {
    twitter: String
    facebook: String
    instagram: String
    url: String
  }

  type Location {
    brewery_address: String
    brewery_city: String
    brewery_state: String
    brewery_lat: Float
    brewery_lng: Float
  }

  type Rating {
    count: Int
    rating_score: Float
  }

  type Stats {
    total_count: Int
    unique_count: Int
    monthly_count: Int
    weekly_count: Int
    user_count: Int
    age_on_service: Float
  }

  type Query {
    brewerySearch(
      q: String!
      offset: Int
      limit: Int
    ): [Brewery]
    brewerySearchInflated(
      q: String!
      offset: Int
      limit: Int
    ): [Brewery]
    brewery(id: Int!): Brewery
  }
`;

export default typeDefs;
