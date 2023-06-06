import type { GatsbyNode } from "gatsby";

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
    const { createTypes } = actions;

    const typedefs = `
    type FlickrPhoto implements Node {
      _id: String!
      owner: String!
      ownerName: String
      title: String!
      license: License
      description: String
      dateUploaded: Date
      dateLastUpdated: Date
      dateTaken: Date
      views: Int
      geoData: Geo
      tags: [String]
      machineTags: [String]
      media: String
      pathAlias: String
      imageUrls: [ImageUrl]!
      thumbnailUrls: [ImageUrl]!
    } 

    type License {
      _id: Int!, 
      name: String!,
      url: String!
    }

    type GeoPermissions {
      is_public: Int
      is_friend: Int
      is_family: Int
      is_contact: Int
    }

    type Geo {
      permissions: GeoPermissions,
      latitude: Float
      longitude: Float
      accuracy: Float
      context: Float
      woeid: String
      placeid: String
    }

    type ImageUrl {
      label: String
      height: Int!
      width: Int!
      orientation: String!
      url: String!
    }
  `;

    createTypes(typedefs);
  };
